'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, XCircle, Calendar, Plus, User, School, Building2, Save, Trash2, Edit2 } from 'lucide-react'
import { UploadCloud, Star, StarOff } from 'lucide-react'
import { HistoricProjectForm } from '@/components/historic-project-form'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// --- Types ---
type Company = {
    id: string
    name: string
    description: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
}

type Period = {
    id: string
    name: string
    start_date: string
    end_date: string
    status: 'planning' | 'active' | 'finished'
}

type Ies = {
    id: string
    name: string
}

type ResidencyAllocation = {
    id: string
    residency_period_id: string
    company_id: string
    ies_id: string
    company?: { name: string }
    ies?: { name: string }
}

type Student = {
    id: string
    residency_period: number
    status: 'active' | 'graduated' | 'dropped'
    main_role: string
    profile: {
        full_name: string
        avatar_url: string
        email: string
    }
}

type IesCard = {
    id: string
    title: string
    content: string
    image_url: string
    type: string
    is_featured_on_home: boolean
    ies: {
        name: string
    }
    created_at: string
}

export default function ManagementDashboard() {
    const supabase = createClient()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('students') // Default to students

    // Data States
    const [companies, setCompanies] = useState<Company[]>([])
    const [allCompanies, setAllCompanies] = useState<Company[]>([]) // For Allocations
    const [periods, setPeriods] = useState<Period[]>([])
    const [iesList, setIesList] = useState<Ies[]>([])
    const [allocations, setAllocations] = useState<ResidencyAllocation[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [iesCards, setIesCards] = useState<IesCard[]>([])
    const [loading, setLoading] = useState(true)

    // Form States
    const [newPeriodName, setNewPeriodName] = useState('')
    const [newStartDate, setNewStartDate] = useState('')
    const [newEndDate, setNewEndDate] = useState('')

    // Allocation State
    const [selectedAllocPeriod, setSelectedAllocPeriod] = useState<string>('')
    const [selectedAllocCompany, setSelectedAllocCompany] = useState<string>('')
    const [selectedAllocIes, setSelectedAllocIes] = useState<string[]>([])

    // Student Edit State
    const [editingStudent, setEditingStudent] = useState<Student | null>(null)
    const [editStudentPeriod, setEditStudentPeriod] = useState<string>('1')
    const [editStudentStatus, setEditStudentStatus] = useState<string>('active')

    // Project Modal State
    const [selectedPeriodProjects, setSelectedPeriodProjects] = useState<any[] | null>(null)
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
    const [currentPeriodName, setCurrentPeriodName] = useState('')


    const fetchData = async () => {
        setLoading(true)

        // 1. Pending Companies (Approvals)
        const { data: companiesData } = await supabase
            .from('companies')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
        if (companiesData) setCompanies(companiesData as Company[])

        // 2. All Companies (For Allocations)
        const { data: allCompaniesData } = await supabase
            .from('companies')
            .select('*')
            .eq('status', 'approved')
            .order('name', { ascending: true })
        if (allCompaniesData) setAllCompanies(allCompaniesData as Company[])

        // 3. Periods
        const { data: periodsData } = await supabase
            .from('residency_periods')
            .select('*')
            .order('start_date', { ascending: false })
        if (periodsData) setPeriods(periodsData as Period[])

        // 4. IES List
        const { data: iesData } = await supabase
            .from('ies')
            .select('id, name')
            .order('name', { ascending: true })
        if (iesData) setIesList(iesData as Ies[])

        // 5. Allocations
        const { data: allocData } = await supabase
            .from('residency_allocations')
            .select('*, company:companies(name), ies:ies(name)')
        if (allocData) setAllocations(allocData as unknown as ResidencyAllocation[])

        // 6. Students
        const { data: studentsData } = await supabase
            .from('students')
            .select('*, profile:profiles(full_name, avatar_url)')
            .order('created_at', { ascending: false })
        if (studentsData) setStudents(studentsData as unknown as Student[])

        // 7. IES Cards (Highlights)
        const { data: cardsData } = await supabase
            .from('ies_cards')
            .select('*, ies:ies(name)')
            .order('created_at', { ascending: false })
        if (cardsData) setIesCards(cardsData as unknown as IesCard[])

        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    // --- Actions ---

    const handleCreatePeriod = async (e: React.FormEvent) => {
        e.preventDefault()
        const { error } = await supabase
            .from('residency_periods')
            .insert({
                name: newPeriodName,
                start_date: newStartDate,
                end_date: newEndDate,
                status: 'planning'
            })

        if (!error) {
            setNewPeriodName('')
            setNewStartDate('')
            setNewEndDate('')
            fetchData()
        } else {
            alert('Erro ao criar período')
        }
    }

    const handleCreateAllocation = async () => {
        if (!selectedAllocPeriod || !selectedAllocCompany || selectedAllocIes.length === 0) {
            alert('Selecione Período, Empresa e pelo menos uma IES.')
            return
        }

        const inserts = selectedAllocIes.map(iesId => ({
            residency_period_id: selectedAllocPeriod,
            company_id: selectedAllocCompany,
            ies_id: iesId
        }))

        const { error } = await supabase.from('residency_allocations').insert(inserts)

        if (error) {
            console.error(error)
            alert('Erro ao criar alocações. Verifique se já existem.')
        } else {
            setSelectedAllocIes([])
            fetchData()
        }
    }

    const handleDeleteAllocation = async (id: string) => {
        if (!confirm('Remover esta alocação?')) return
        await supabase.from('residency_allocations').delete().eq('id', id)
        fetchData()
    }

    const handleUpdateStudent = async () => {
        if (!editingStudent) return

        const { error } = await supabase
            .from('students')
            .update({ residency_period: parseInt(editStudentPeriod), status: editStudentStatus })
            .eq('id', editingStudent.id)

        if (!error) {
            setEditingStudent(null)
            fetchData()
        } else {
            alert('Erro ao atualizar aluno')
        }
    }

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
        const { error } = await supabase.from('companies').update({ status: newStatus }).eq('id', id)
        if (!error) fetchData()
    }
    const handleToggleHighlight = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('ies_cards')
            .update({ is_featured_on_home: !currentStatus })
            .eq('id', id)
        if (!error) fetchData()
    }

    const handleViewProjects = async (periodId: string, periodName: string) => {
        setLoading(true)
        setCurrentPeriodName(periodName)
        const { data } = await supabase
            .from('company_projects')
            .select('*, company:companies(name)')
            .eq('period_id', periodId)
            .order('created_at', { ascending: false })

        if (data) setSelectedPeriodProjects(data)
        setIsProjectModalOpen(true)
        setLoading(false)
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Painel de Gestão</h1>
                    <p className="text-muted-foreground">Administração Geral da Residência</p>
                </div>
                <Button variant="ghost" onClick={handleSignOut}>Sair</Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 justify-start">
                    <TabsTrigger value="students" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                        <User className="w-4 h-4 mr-2" /> Alunos
                    </TabsTrigger>
                    <TabsTrigger value="structure" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                        <Building2 className="w-4 h-4 mr-2" /> Estrutura & Períodos
                    </TabsTrigger>
                    <TabsTrigger value="highlights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                        <Star className="w-4 h-4 mr-2" /> Destaques
                    </TabsTrigger>
                    <TabsTrigger value="historic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                        <Calendar className="w-4 h-4 mr-2" /> Histórico
                    </TabsTrigger>
                    <TabsTrigger value="approvals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border">
                        <CheckCircle className="w-4 h-4 mr-2" /> Aprovações
                        {companies.length > 0 && <Badge variant="destructive" className="ml-2 px-1 h-5">{companies.length}</Badge>}
                    </TabsTrigger>
                </TabsList>

                {/* --- TAB: STUDENTS --- */}
                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Base de Alunos ({students.length})</CardTitle>
                            <CardDescription>Gerencie o status e período dos residentes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[500px]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Aluno</TableHead>
                                            <TableHead>Papel Principal</TableHead>
                                            <TableHead>Período</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => (
                                            <TableRow key={student.id}>
                                                <TableCell className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={student.profile?.avatar_url} />
                                                        <AvatarFallback>{student.profile?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-medium">{student.profile?.full_name}</div>
                                                </TableCell>
                                                <TableCell>{student.main_role}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{student.residency_period}º Período</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                                        {student.status === 'active' ? 'Ativo' : student.status === 'graduated' ? 'Formado' : 'Inativo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        setEditingStudent(student)
                                                        setEditStudentPeriod(student.residency_period.toString())
                                                        setEditStudentStatus(student.status)
                                                    }}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- TAB: STRUCTURE (Periods & Allocations) --- */}
                <TabsContent value="structure" className="space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Section 1: Periods */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Períodos de Residência</CardTitle>
                                    <CardDescription>Ciclos ativos e planejados.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <form onSubmit={handleCreatePeriod} className="flex gap-2 items-end">
                                        <div className="grid gap-1 flex-1">
                                            <Label>Nome (202X.X)</Label>
                                            <Input required value={newPeriodName} onChange={e => setNewPeriodName(e.target.value)} placeholder="ex: 2025.2" />
                                        </div>
                                        <div className="grid gap-1">
                                            <Label>Início</Label>
                                            <Input type="date" required value={newStartDate} onChange={e => setNewStartDate(e.target.value)} />
                                        </div>
                                        <div className="grid gap-1">
                                            <Label>Fim</Label>
                                            <Input type="date" required value={newEndDate} onChange={e => setNewEndDate(e.target.value)} />
                                        </div>
                                        <Button type="submit"><Plus className="w-4 h-4" /></Button>
                                    </form>

                                    <div className="space-y-2 mt-4">
                                        {periods.map(p => (
                                            <div key={p.id} className="flex justify-between items-center p-3 border rounded-lg">
                                                <div>
                                                    <div className="font-bold">{p.name}</div>
                                                    <div className="text-xs text-muted-foreground">{new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}</div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge>
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        setSelectedAllocPeriod(p.id)
                                                    }}>
                                                        Selecionar
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Section 2: Allocations */}
                        <div className="space-y-6">
                            <Card className="border-blue-100 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-900/10">
                                <CardHeader>
                                    <CardTitle>Alocações de Empresas</CardTitle>
                                    <CardDescription>Vincule Empresas a IES em um Período.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>1. Período Selecionado</Label>
                                        <Select value={selectedAllocPeriod} onValueChange={setSelectedAllocPeriod}>
                                            <SelectTrigger><SelectValue placeholder="Selecione um período" /></SelectTrigger>
                                            <SelectContent>
                                                {periods.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>2. Empresa</Label>
                                        <Select value={selectedAllocCompany} onValueChange={setSelectedAllocCompany}>
                                            <SelectTrigger><SelectValue placeholder="Selecione a Empresa" /></SelectTrigger>
                                            <SelectContent>
                                                {allCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>3. IES Envolvidas</Label>
                                        <div className="grid grid-cols-2 gap-2 border p-3 rounded-md bg-background h-32 overflow-y-auto">
                                            {iesList.map(ies => (
                                                <div key={ies.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`ies-${ies.id}`}
                                                        checked={selectedAllocIes.includes(ies.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) setSelectedAllocIes([...selectedAllocIes, ies.id])
                                                            else setSelectedAllocIes(selectedAllocIes.filter(id => id !== ies.id))
                                                        }}
                                                    />
                                                    <label htmlFor={`ies-${ies.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                        {ies.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button className="w-full" onClick={handleCreateAllocation} disabled={!selectedAllocPeriod || !selectedAllocCompany || selectedAllocIes.length === 0}>
                                        <Save className="w-4 h-4 mr-2" /> Salvar Alocação
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Alocações Existentes</CardTitle></CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[200px]">
                                        <div className="space-y-2">
                                            {allocations
                                                .filter(a => activeTab === 'structure' ? (!selectedAllocPeriod || a.residency_period_id === selectedAllocPeriod) : true)
                                                .map(alloc => (
                                                    <div key={alloc.id} className="flex justify-between items-center p-2 border-b text-sm">
                                                        <div>
                                                            <span className="font-bold">{alloc.company?.name}</span>
                                                            <span className="mx-2 text-muted-foreground">↔</span>
                                                            <span>{alloc.ies?.name}</span>
                                                        </div>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDeleteAllocation(alloc.id)}>
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            {allocations.length === 0 && <div className="text-muted-foreground text-sm">Nenhuma alocação registrada.</div>}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* --- TAB: HIGHLIGHTS --- */}
                <TabsContent value="highlights">
                    <div className="grid md:grid-cols-3 gap-6">
                        {iesCards.map(card => (
                            <Card key={card.id} className={card.is_featured_on_home ? 'border-primary border-2' : ''}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="mb-2">{card.ies?.name}</Badge>
                                        <Badge className={card.type === 'achievement' ? 'bg-yellow-500' : 'bg-blue-500'}>
                                            {card.type === 'achievement' ? 'Conquista' : card.type === 'highlight' ? 'Destaque' : 'Notícia'}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg">{card.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">{card.content}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {card.image_url && (
                                        <div className="w-full h-32 bg-muted rounded-md mb-2 overflow-hidden">
                                            <img src={card.image_url} alt="Cover" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">{new Date(card.created_at).toLocaleDateString()}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant={card.is_featured_on_home ? "default" : "outline"}
                                        className="w-full"
                                        onClick={() => handleToggleHighlight(card.id, card.is_featured_on_home)}
                                    >
                                        {card.is_featured_on_home ? (
                                            <><StarOff className="w-4 h-4 mr-2" /> Remover da Home</>
                                        ) : (
                                            <><Star className="w-4 h-4 mr-2" /> Destacar na Home</>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* --- TAB: HISTORIC --- */}
                <TabsContent value="historic">
                    <HistoricProjectForm />
                </TabsContent>

                {/* --- TAB: APPROVALS --- */}
                <TabsContent value="approvals">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companies.map((company) => (
                            <Card key={company.id}>
                                <CardHeader>
                                    <CardTitle>{company.name}</CardTitle>
                                    <CardDescription>{new Date(company.created_at).toLocaleDateString()}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{company.description}</p>
                                    <Badge variant="outline">Pendente</Badge>
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                    <Button variant="destructive" className="flex-1" onClick={() => handleStatusUpdate(company.id, 'rejected')}>Rejeitar</Button>
                                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(company.id, 'approved')}>Aprovar</Button>
                                </CardFooter>
                            </Card>
                        ))}
                        {companies.length === 0 && <p className="text-muted-foreground">Nenhuma empresa pendente.</p>}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Student Edit Modal */}
            <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Aluno</DialogTitle>
                        <DialogDescription>{editingStudent?.profile?.full_name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Período de Residência</Label>
                            <Select value={editStudentPeriod} onValueChange={setEditStudentPeriod}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6].map(p => <SelectItem key={p} value={p.toString()}>{p}º Período</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={editStudentStatus} onValueChange={setEditStudentStatus}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Ativo (Residente)</SelectItem>
                                    <SelectItem value="graduated">Formado (Alumni)</SelectItem>
                                    <SelectItem value="dropped">Desligado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingStudent(null)}>Cancelar</Button>
                        <Button onClick={handleUpdateStudent}>Salvar Alterações</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Project Management Modal */}
            <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
                <DialogContent className="max-w-3xl border-none">
                    <DialogHeader>
                        <DialogTitle>Projetos - {currentPeriodName}</DialogTitle>
                        <DialogDescription>
                            Lista de projetos cadastrados neste período.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[400px] rounded-md border p-4">
                        {loading ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                        ) : selectedPeriodProjects?.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">Nenhum projeto encontrado.</div>
                        ) : (
                            <div className="grid gap-4">
                                {selectedPeriodProjects?.map((proj) => (
                                    <div key={proj.id} className="flex items-start justify-between p-4 border rounded-lg bg-card">
                                        <div>
                                            <h4 className="font-semibold">{proj.title}</h4>
                                            <p className="text-sm text-muted-foreground mb-1">
                                                {proj.company?.name || proj.historic_company_name || 'Empresa Desconhecida'}
                                            </p>
                                            <Badge variant="secondary" className="text-xs">{proj.type}</Badge>
                                        </div>
                                        <div className="text-right text-xs text-muted-foreground">
                                            {new Date(proj.created_at).toLocaleDateString()}
                                            {proj.class_name && <div className="mt-1 font-medium text-primary">{proj.class_name}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}
