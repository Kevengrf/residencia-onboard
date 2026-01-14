
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Briefcase, Building, Trophy, LayoutDashboard, LogOut, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

// Types
type CompanyProfile = {
    id: string
    name: string
    description: string
    website: string
    logo_url: string
    cover_image_url: string
    status: string
}

type Job = {
    id: string
    title: string
    status: 'open' | 'closed'
    applications_count?: number // count from join
    created_at: string
}

type Project = {
    id: string
    title: string
    period: { name: string }
    is_demoday_winner: boolean
}

export default function CompanyDashboard() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState<CompanyProfile | null>(null)
    const [jobs, setJobs] = useState<Job[]>([])
    const [projects, setProjects] = useState<Project[]>([])

    // Form States
    const [isJobModalOpen, setIsJobModalOpen] = useState(false)
    const [newJob, setNewJob] = useState({
        title: '',
        description: '',
        requirements: '',
        salary_range: '',
        benefits: '',
        location: 'Remoto',
        contact_info: '',
        target_courses: [] as string[] // e.g. ['Computação', 'Design']
    })

    // Applicants View State
    const [viewApplicantsJobId, setViewApplicantsJobId] = useState<string | null>(null)
    const [applicants, setApplicants] = useState<any[]>([])
    const [loadingApplicants, setLoadingApplicants] = useState(false)

    // Fetch Data
    useEffect(() => {
        const fetchCompanyData = async () => {
            setLoading(true)

            // 1. Get User & Company ID
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const { data: userProfile } = await supabase
                .from('profiles')
                .select('company_id, role')
                .eq('id', user.id)
                .single()

            if (userProfile?.role !== 'company' || !userProfile.company_id) {
                // Not authorized or no company linked
                alert('Acesso restrito a empresas.')
                router.push('/')
                return
            }

            const companyId = userProfile.company_id

            // 2. Fetch Company Profile
            const { data: companyData } = await supabase
                .from('companies')
                .select('*')
                .eq('id', companyId)
                .single()

            if (companyData) setProfile(companyData)

            // 3. Fetch Jobs
            const { data: jobsData } = await supabase
                .from('jobs')
                .select('*, job_applications(count)')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false })

            if (jobsData) {
                // Map the nested count response to a flat property
                const formattedJobs = jobsData.map((job: any) => ({
                    ...job,
                    applications_count: job.job_applications?.[0]?.count || 0
                }))
                setJobs(formattedJobs)
            }

            // 4. Fetch Projects
            const { data: projectsData } = await supabase
                .from('company_projects')
                .select('*, period:residency_periods(name)')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false })

            if (projectsData) setProjects(projectsData)

            setLoading(false)
        }

        fetchCompanyData()
    }, [])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return

        const { error } = await supabase
            .from('companies')
            .update({
                name: profile.name,
                description: profile.description,
                website: profile.website,
                logo_url: profile.logo_url, // [NEW]
                cover_image_url: profile.cover_image_url
            })
            .eq('id', profile.id)

        if (error) alert('Erro ao atualizar perfil')
        else alert('Perfil atualizado com sucesso!')
    }

    const handleFillMock = () => {
        const titles = [
            'Desenvolvedor Fullstack Jr', 'Designer UI/UX', 'Cientista de Dados Jr',
            'Estágio em QA', 'DevOps Engineer', 'Mobile Developer (React Native)',
            'Product Manager Jr', 'Analista de Segurança'
        ]
        const locations = ['Recife, PE (Porto Digital)', 'Remoto', 'Híbrido (Recife)', 'São Paulo, SP']
        const salaries = ['R$ 2.500 - R$ 3.500', 'R$ 1.500 (Bolsa)', 'R$ 4.000 - R$ 5.000', 'A combinar']

        const descriptions = [
            'Estamos buscando um profissional apaixonado por tecnologia para compor nosso time. O ambiente é descontraído e focado em aprendizado.',
            'Vaga para atuar em projetos inovadores no setor financeiro. Buscamos pessoas criativas e proativas.',
            'Oportunidade de crescimento acelerado em startup que está revolucionando o mercado de varejo.',
            'Venha fazer parte do nosso time de design e ajudar a construir a próxima geração de produtos digitais.'
        ]

        const requirementsList = [
            '- Experiência com TypeScript\n- Conhecimento em Tailwind CSS\n- Vontade de aprender',
            '- Figma avançado\n- Noções de HTML/CSS\n- Portfolio atualizado',
            '- Python para análise de dados\n- SQL intermediário\n- Inglês técnico',
            '- Conhecimento em metodologias ágeis\n- Boa comunicação\n- Proatividade'
        ]

        // Random helpers
        const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

        setNewJob({
            title: pick(titles),
            description: pick(descriptions),
            requirements: pick(requirementsList),
            salary_range: pick(salaries),
            benefits: 'Vale Refeição, Plano de Saúde, Day off no aniversário, Home Office Híbrido',
            location: pick(locations),
            contact_info: `talentos@${Math.random().toString(36).substring(7)}.com`,
            target_courses: ['Computação', 'Sistemas de Informação']
        })
    }

    const handleCreateJob = async () => {
        if (!profile) return

        const { data, error } = await supabase.from('jobs').insert({
            company_id: profile.id,
            title: newJob.title,
            description: newJob.description,
            requirements: newJob.requirements,
            salary_range: newJob.salary_range,
            benefits: newJob.benefits,
            contact_info: newJob.contact_info,
        }).select().single()

        if (!error && data) {
            // Update local fields
            const createdJob: Job = {
                id: data.id,
                title: data.title,
                status: data.status,
                applications_count: 0,
                created_at: data.created_at
            }

            // Prepend new job to list
            setJobs(prev => [createdJob, ...prev])

            // Reset form for next entry
            setNewJob({
                title: '',
                description: '',
                requirements: '',
                salary_range: '',
                benefits: '',
                location: 'Remoto',
                contact_info: '',
                target_courses: []
            })

            // Feedback but keep modal open
            alert('Vaga publicada! Você pode criar outra em seguida.')
        } else {
            console.error(error)
            alert('Erro ao criar vaga.')
        }
    }

    const handleViewApplicants = async (jobId: string) => {
        setViewApplicantsJobId(jobId)
        setLoadingApplicants(true)
        setApplicants([])

        // Join: job_applications -> students -> profiles
        // We need profile info (name, email)
        const { data, error } = await supabase
            .from('job_applications')
            .select(`
                *,
                student:students!inner (
                    id,
                    class_name,
                    profile:profiles!inner ( full_name, email )
                )
            `)
            .eq('job_id', jobId)
            .order('applied_at', { ascending: false })

        if (error) {
            console.error('Error fetching applicants:', error)
            alert('Erro ao carregar candidatos.')
        } else {
            setApplicants(data || [])
        }
        setLoadingApplicants(false)
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

    // Check for Pending Status
    if (profile?.status === 'pending') {
        return (
            <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardHeader>
                        <div className="mx-auto bg-amber-100 p-3 rounded-full w-fit mb-4">
                            <Building className="w-8 h-8 text-amber-600" />
                        </div>
                        <CardTitle className="text-xl">Cadastro em Análise</CardTitle>
                        <CardDescription>
                            Sua empresa foi cadastrada com sucesso, mas ainda precisa ser aprovada pela nossa equipe de gestão.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                            <p>Entraremos em contato assim que seu acesso for liberado.</p>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <Button variant="outline" onClick={handleSignOut} className="w-full">
                            <LogOut className="w-4 h-4 mr-2" /> Voltar para Home
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Building className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl">{profile?.name || 'Portal da Empresa'}</h1>
                        <p className="text-xs text-muted-foreground">Área da Empresa Parceira</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {profile?.id && (
                        <Button variant="outline" size="sm" asChild className="mr-2">
                            <a href={`/companies/${profile.id}`} target="_blank" rel="noopener noreferrer">
                                <Trophy className="w-4 h-4 mr-2" />
                                Ver Página Pública
                            </a>
                        </Button>
                    )}
                    <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
                        <LogOut className="w-4 h-4 mr-2" /> Sair
                    </Button>
                </div>
            </header>

            <main className="container mx-auto p-6 max-w-5xl">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="jobs">Vagas</TabsTrigger>
                        <TabsTrigger value="projects">Projetos</TabsTrigger>
                        <TabsTrigger value="profile">Perfil</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Vagas Abertas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{jobs.filter(j => j.status === 'open').length}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Projetos na Residência</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{projects.length}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Destaques DemoDay</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-amber-500">{projects.filter(p => p.is_demoday_winner).length}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* JOBS TAB */}
                    <TabsContent value="jobs">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Briefcase className="w-5 h-5" /> Gestão de Vagas
                            </h2>
                            <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
                                <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Nova Vaga</Button></DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader className="flex flex-row items-center justify-between">
                                        <DialogTitle>Criar Nova Vaga</DialogTitle>
                                        <Button variant="outline" size="sm" onClick={handleFillMock} className="mr-6 border-dashed text-muted-foreground hover:text-primary">
                                            ⚡ Preencher Demo
                                        </Button>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="grid gap-2">
                                            <Label>Nome do Cargo</Label>
                                            <Input placeholder="Ex: Desenvolvedor Jr" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Faixa Salarial</Label>
                                                <Input placeholder="Ex: R$ 2000 - R$ 3000" value={newJob.salary_range} onChange={e => setNewJob({ ...newJob, salary_range: e.target.value })} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Localização</Label>
                                                <Input value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Descrição da Vaga</Label>
                                            <Textarea placeholder="Descreva as atividades..." value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Requisitos</Label>
                                            <Textarea placeholder="- React&#13;- Node.js&#13;- Inglês" value={newJob.requirements} onChange={e => setNewJob({ ...newJob, requirements: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Benefícios</Label>
                                            <Textarea placeholder="VR, VA, Plano de Saúde..." value={newJob.benefits} onChange={e => setNewJob({ ...newJob, benefits: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Contato / Email para envio</Label>
                                            <Input placeholder="rh@empresa.com" value={newJob.contact_info} onChange={e => setNewJob({ ...newJob, contact_info: e.target.value })} />
                                        </div>
                                        <Button className="w-full" onClick={handleCreateJob}>Publicar Vaga</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Applicants Dialog */}
                        <Dialog open={!!viewApplicantsJobId} onOpenChange={(open) => !open && setViewApplicantsJobId(null)}>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>Candidatos Inscritos</DialogTitle>
                                </DialogHeader>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {loadingApplicants ? (
                                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                                    ) : applicants.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">Nenhum candidato ainda.</p>
                                    ) : (
                                        <div className="grid gap-3">
                                            {applicants.map(app => (
                                                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {app.student.profile.full_name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{app.student.profile.full_name}</p>
                                                            <p className="text-xs text-muted-foreground">{app.student.profile.email} • {app.student.class_name || 'Sem Turma'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right text-xs text-muted-foreground">
                                                        Aplicado em {new Date(app.applied_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <div className="space-y-4">
                            {jobs.map(job => (
                                <Card key={job.id}>
                                    <CardHeader className="flex flex-row items-start justify-between">
                                        <div>
                                            <CardTitle>{job.title}</CardTitle>
                                            <CardDescription>Criada em {new Date(job.created_at).toLocaleDateString()}</CardDescription>
                                        </div>
                                        <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>{job.status}</Badge>
                                    </CardHeader>
                                    <CardFooter className="bg-muted/10 border-t pt-4 flex justify-between items-center">
                                        <div className="text-sm font-medium">
                                            {job.applications_count || 0} candidaturas
                                        </div>
                                        <Button variant="secondary" size="sm" onClick={() => handleViewApplicants(job.id)}>
                                            <Users className="w-4 h-4 mr-2" /> Ver Candidatos
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                            {jobs.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhuma vaga criada.</p>}
                        </div>
                    </TabsContent>

                    {/* PROJECTS TAB */}
                    <TabsContent value="projects">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5" /> Histórico de Projetos</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {projects.map(project => (
                                <Card key={project.id} className={project.is_demoday_winner ? 'border-amber-400 border-2 bg-amber-50/50' : ''}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline">{project.period?.name}</Badge>
                                            {project.is_demoday_winner && (
                                                <Badge className="bg-amber-500 hover:bg-amber-600">🏆 Vencedor DemoDay</Badge>
                                            )}
                                        </div>
                                        <CardTitle className="mt-2">{project.title}</CardTitle>
                                    </CardHeader>
                                </Card>
                            ))}
                            {projects.length === 0 && <p className="text-muted-foreground">Nenhum projeto registrado.</p>}
                        </div>
                    </TabsContent>

                    {/* PROFILE TAB */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Editar Perfil Público</CardTitle>
                                <CardDescription>Essas informações aparecem na página pública da empresa.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {profile && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label>Nome da Empresa</Label>
                                            <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Website</Label>
                                            <Input value={profile.website} onChange={e => setProfile({ ...profile, website: e.target.value })} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>URL da Logo (Quadrada)</Label>
                                            <Input value={profile.logo_url || ''} onChange={e => setProfile({ ...profile, logo_url: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>URL da Imagem de Capa (Wide)</Label>
                                            <Input
                                                value={profile.cover_image_url || ''}
                                                onChange={e => setProfile({ ...profile, cover_image_url: e.target.value })}
                                                placeholder="https://..."
                                            />
                                            <p className="text-xs text-muted-foreground">Recomendado: 1200x300px</p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Descrição</Label>
                                            <Textarea
                                                className="min-h-[150px]"
                                                value={profile.description}
                                                onChange={e => setProfile({ ...profile, description: e.target.value })}
                                            />
                                        </div>
                                        <Button onClick={handleUpdateProfile}>Salvar Alterações</Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div >
    )
}
