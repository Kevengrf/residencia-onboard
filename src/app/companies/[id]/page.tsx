
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Globe, MapPin, ArrowLeft, Trophy, DollarSign, Gift, Briefcase } from 'lucide-react'
import { LogoutButton } from '@/components/logout-button'

export const revalidate = 0

type Params = Promise<{ id: string }>

export default async function CompanyDetailPage({ params }: { params: Params }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Company Details
    const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

    if (!company) {
        notFound()
    }

    // 2. Fetch Open Jobs
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

    // 3. Fetch Company Projects (History)
    const { data: projects } = await supabase
        .from('company_projects')
        .select('*, period:residency_periods(name)')
        .eq('company_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Navbar */}
            <header className="border-b bg-card sticky top-0 z-20">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/companies" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Voltar para lista</span>
                    </Link>
                    <div className="font-bold text-lg hidden md:block">{company.name}</div>
                    <LogoutButton />
                </div>
            </header>

            {/* Cover Image & Branding */}
            <div className="relative w-full h-[250px] md:h-[350px] bg-muted overflow-hidden">
                {company.cover_image_url ? (
                    <img src={company.cover_image_url} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-center">
                        <Building2 className="w-20 h-20 text-white/10" />
                    </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-10 max-w-5xl">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 text-center md:text-left">
                    {/* Logo */}
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-card rounded-2xl shadow-lg border-4 border-background flex items-center justify-center overflow-hidden shrink-0">
                        {company.logo_url ? (
                            <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-12 h-12 text-muted-foreground" />
                        )}
                    </div>
                    {/* Title & Info */}
                    <div className="flex-1 pb-2">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{company.name}</h1>
                        {company.website && (
                            <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline bg-primary/10 px-3 py-1 rounded-full text-sm font-medium">
                                <Globe className="w-4 h-4 mr-2" />
                                {company.website.replace('https://', '')}
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* About */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">Sobre</h2>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed p-6 border rounded-xl bg-card/50">
                                {company.description ? (
                                    <p className="whitespace-pre-wrap">{company.description}</p>
                                ) : (
                                    <p className="italic">Nenhuma descrição informada.</p>
                                )}
                            </div>
                        </section>

                        {/* Jobs */}
                        <section id="jobs">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Briefcase className="w-6 h-6 text-primary" /> Vagas Abertas
                            </h2>
                            <div className="space-y-6">
                                {jobs?.map((job) => (
                                    <Card key={job.id} className="overflow-hidden hover:border-primary/50 transition-all shadow-sm">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-xl">{job.title}</CardTitle>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                        <MapPin className="w-3 h-3" /> {job.location || 'Localização não informada'}
                                                    </div>
                                                </div>
                                                <Badge>{job.type}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                                {job.salary_range && (
                                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                                                        <DollarSign className="w-4 h-4" />
                                                        {job.salary_range}
                                                    </div>
                                                )}
                                                {job.benefits && (
                                                    <div className="flex items-start gap-2 text-muted-foreground">
                                                        <Gift className="w-4 h-4 mt-0.5 shrink-0" />
                                                        <span className="line-clamp-1" title={job.benefits}>Benefícios Disponíveis</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Description Snippet */}
                                            <div className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line border-l-2 pl-4">
                                                {job.description}
                                            </div>

                                            <Button className="w-full">Ver Detalhes e Inscrever-se</Button>
                                        </CardContent>
                                    </Card>
                                ))}
                                {(!jobs || jobs.length === 0) && (
                                    <div className="text-center py-10 border rounded-xl bg-muted/20 border-dashed">
                                        <p className="text-muted-foreground">Nenhuma vaga aberta no momento.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                    </div>

                    {/* Sidebar / History */}
                    <div className="space-y-8">
                        {/* Residency History */}
                        <div className="border rounded-xl bg-card p-6 shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                Histórico na Residência
                            </h3>

                            {projects && projects.length > 0 ? (
                                <div className="space-y-4 relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border -z-10"></div>

                                    {projects.map((proj) => (
                                        <div key={proj.id} className="relative pl-8">
                                            {/* Dot */}
                                            <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${proj.is_demoday_winner ? 'bg-amber-500 border-amber-500' : 'bg-background border-muted-foreground'}`}></div>

                                            <div className="text-sm">
                                                <div className="font-semibold">{proj.period?.name}</div>
                                                <div className="text-muted-foreground font-medium">{proj.title}</div>
                                                {proj.is_demoday_winner && (
                                                    <Badge variant="outline" className="mt-1 border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30">
                                                        🏆 Vencedor DemoDay
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Esta empresa ainda não participou de ciclos anteriores.</p>
                            )}

                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-semibold text-sm mb-2">Contato</h4>
                                <p className="text-sm text-muted-foreground">Para parcerias e projetos:</p>
                                <a href="mailto:contato@residencia.com" className="text-primary text-sm hover:underline">
                                    contato@residencia.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
