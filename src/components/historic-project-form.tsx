
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Save, Plus, Users, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function HistoricProjectForm() {
    const supabase = createClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // Data Loading
    const [periods, setPeriods] = useState<any[]>([])
    const [classes, setClasses] = useState<string[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [companiesList, setCompaniesList] = useState<any[]>([]) // [NEW]

    // Form Selection
    const [selectedPeriod, setSelectedPeriod] = useState('')
    const [selectedClass, setSelectedClass] = useState('')

    // Project Data
    const [title, setTitle] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [description, setDescription] = useState('')
    const [pdfUrl, setPdfUrl] = useState('')
    const [videoUrl, setVideoUrl] = useState('')
    const [isDemoDayWinner, setIsDemoDayWinner] = useState(false) // [NEW]

    // Squad Selection
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])

    // Load Initial Data (Periods & Classes)
    useEffect(() => {
        const loadInitial = async () => {
            // Periods
            const { data: pData } = await supabase
                .from('residency_periods')
                .select('*')
                .order('start_date', { ascending: false })
            if (pData) setPeriods(pData)

            // Classes (Distinct)
            // Supabase doesn't support .distinct() easily directly on client without RPC or raw SQL sometimes,
            // but we can fetch all students (lightweight) or just distinct class_names if possible.
            // Let's fetch all students with class_names to build the list. 
            // Better: Create an RPC ideally, but client-side dedupe is fine for < 1000 students.
            const { data: sData } = await supabase
                .from('students')
                .select('class_name')
                .not('class_name', 'is', null)

            if (sData) {
                const unique = Array.from(new Set(sData.map((s: any) => s.class_name))).sort()
                setClasses(unique as string[])
                setClasses(unique as string[])
            }

            // [NEW] Fetch Companies for autosuggest
            const { data: cData } = await supabase
                .from('companies')
                .select('id, name')
                .eq('status', 'approved')
                .order('name')

            if (cData) setCompaniesList(cData)
        }
        loadInitial()
    }, [])

    // Load Students when Class/Period changes
    useEffect(() => {
        if (!selectedClass) {
            setStudents([])
            return
        }

        const loadStudents = async () => {
            let query = supabase
                .from('profiles')
                .select('id, full_name, student:students!inner(class_name, entry_period)')
                .eq('student.class_name', selectedClass)
                .order('full_name')

            if (selectedPeriod) {
                // If the period matches the ENTRY period, great. 
                // But historic projects might be done by students who entered earlier.
                // So maybe we don't strict filter by entry_period here, trusting the 'Class' grouping more.
                // Or we can filter: .eq('student.entry_period', selectedPeriod.name) // if period object
            }

            const { data } = await query
            if (data) {
                setStudents(data.map((p: any) => ({
                    id: p.id,
                    name: p.full_name,
                    ...p.student
                })))
            }
        }
        loadStudents()
    }, [selectedClass, selectedPeriod])

    const handleToggleStudent = (id: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPeriod) return alert('Selecione um Período')
        setLoading(true)

        try {
            // [NEW] Check if manual name matches an existing company
            const matchedCompany = companiesList.find(c => c.name.toLowerCase() === companyName.trim().toLowerCase())
            const finalCompanyId = matchedCompany ? matchedCompany.id : null
            const finalHistoricName = matchedCompany ? null : companyName // Only store historic name if not linked

            const { data: project, error: projError } = await supabase
                .from('company_projects')
                .insert({
                    period_id: selectedPeriod,
                    title,
                    description,
                    historic_company_name: finalHistoricName, // Only text if unknown
                    company_id: finalCompanyId, // Link real company if known
                    pdf_url: pdfUrl || null,
                    video_url: videoUrl || null,
                    class_name: selectedClass, // Context
                    type: 'custom', // Historic treated as custom/other
                    is_demoday_winner: isDemoDayWinner // [NEW]
                })
                .select()
                .single()

            if (projError) throw projError

            // 2. Create Allocations (Squad)
            if (selectedStudentIds.length > 0) {
                const allocations = selectedStudentIds.map(sid => ({
                    project_id: project.id,
                    student_id: sid,
                    status: 'completed' // Historic implies done
                }))

                const { error: allocError } = await supabase
                    .from('project_allocations')
                    .insert(allocations)

                if (allocError) throw allocError
            }

            alert('Projeto Histórico Importado com Sucesso!')
            // Reset Form partially
            setTitle('')
            setCompanyName('')
            setDescription('')
            setPdfUrl('')
            setPdfUrl('')
            setVideoUrl('')
            setIsDemoDayWinner(false)
            setSelectedStudentIds([])

        } catch (error) {
            console.error('Error importing:', error)
            alert('Erro ao importar projeto.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column: Context Setup */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Contexto do Projeto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Período de Realização</Label>
                                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o Semestre (ex: 2023.2)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Empresa Parceira (Nome Histórico)</Label>
                                <Input
                                    list="companies-list"
                                    placeholder="Comece a digitar ou selecione..."
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    required
                                />
                                <datalist id="companies-list">
                                    {companiesList.map((c: any) => (
                                        <option key={c.id} value={c.name} />
                                    ))}
                                </datalist>
                                <p className="text-xs text-muted-foreground">Selecione uma existente ou digite um novo nome.</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Título do Desafio / Projeto</Label>
                                <Input
                                    placeholder="Ex: Sistema de Gestão de Resíduos"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Descrição Resumida</Label>
                                <Textarea
                                    placeholder="O que foi desenvolvido..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2 py-2">
                                <Checkbox
                                    id="demoday"
                                    checked={isDemoDayWinner}
                                    onCheckedChange={(checked) => setIsDemoDayWinner(checked as boolean)}
                                />
                                <Label htmlFor="demoday" className="cursor-pointer font-medium flex items-center gap-2">
                                    Participou do DemoDay / Destaque 🏆
                                </Label>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label>PDF (URL)</Label>
                                    <Input placeholder="https://..." value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Vídeo Pitch (URL)</Label>
                                    <Input placeholder="https://youtube..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Squad Selection */}
                <div className="space-y-4">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex justify-between items-center">
                                Seleção do Squad
                                <Badge variant="secondary">{selectedStudentIds.length} selecionados</Badge>
                            </CardTitle>
                            <CardDescription>
                                Filtre por turma e selecione os alunos.
                            </CardDescription>

                            <div className="pt-2">
                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por Turma" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto max-h-[500px] space-y-2">
                            {students.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    Selecione uma turma para ver os alunos.
                                </div>
                            ) : (
                                students.map(student => (
                                    <div key={student.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-muted/50">
                                        <Checkbox
                                            id={student.id}
                                            checked={selectedStudentIds.includes(student.id)}
                                            onCheckedChange={() => handleToggleStudent(student.id)}
                                        />
                                        <div className="grid gap-0.5 leading-none">
                                            <label
                                                htmlFor={student.id}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {student.name}
                                            </label>
                                            <p className="text-xs text-muted-foreground">
                                                {student.class_name} • {student.entry_period}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Importar Projeto Histórico
                </Button>
            </div>
        </form>
    )
}


