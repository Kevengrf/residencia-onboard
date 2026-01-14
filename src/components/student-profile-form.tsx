'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, Github, Linkedin, Globe, GraduationCap, School } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploadModal } from '@/components/profile/image-upload-modal'

interface ProfileFormProps {
    user: any
    profile: any
    student: any
    iesList: any[]
}

export function StudentProfileForm({ user, profile, student, iesList }: ProfileFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    // Form States
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
    const [fullName, setFullName] = useState(profile?.full_name || '')
    const [mainRole, setMainRole] = useState(student?.main_role || '')
    const [bio, setBio] = useState(student?.bio || '')
    const [linkedin, setLinkedin] = useState(student?.linkedin_url || '')
    const [github, setGithub] = useState(student?.github_url || '')
    const [portfolio, setPortfolio] = useState(student?.portfolio_url || '')
    const [skillsInput, setSkillsInput] = useState(student?.skills?.join(', ') || '')

    // Academic Info
    const [entryPeriod, setEntryPeriod] = useState(student?.entry_period || '')
    const [className, setClassName] = useState(student?.class_name || '')
    const [selectedIES, setSelectedIES] = useState(profile?.ies_id || '')
    const [isEmbarque, setIsEmbarque] = useState(student?.is_embarque_holder || false)
    const [shift, setShift] = useState(student?.shift || '')

    // IES Availability Logic
    const filteredIESList = iesList?.filter(ies => {
        if (!entryPeriod) return false
        const iesStart = ies.start_period || '2022.1'
        const isStarted = iesStart <= entryPeriod
        if ((ies.name.includes('Nassau') || ies.name.includes('Uninassau')) && entryPeriod >= '2024.1') {
            return false
        }
        return isStarted
    }) || []

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Update Profile (Name & IES)
            if (fullName !== profile.full_name || selectedIES !== profile.ies_id) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        full_name: fullName,
                        ies_id: selectedIES || null
                    })
                    .eq('id', user.id)

                if (profileError) throw profileError
            }

            // Update Student Details
            const skillsArray = skillsInput.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0)

            const { error: studentError } = await supabase
                .from('students')
                .update({
                    bio,
                    main_role: mainRole,
                    linkedin_url: linkedin,
                    github_url: github,
                    portfolio_url: portfolio,
                    skills: skillsArray,
                    entry_period: entryPeriod,
                    class_name: className,
                    is_embarque_holder: isEmbarque,
                    shift: shift
                })
                .eq('id', user.id)

            if (studentError) throw studentError

            router.refresh()
            alert('Perfil salvo com sucesso!')
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Erro ao salvar perfil.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Foto de Perfil</CardTitle>
                    <CardDescription>Esta foto será exibida no Catálogo de Talentos.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center pb-6">
                    <ImageUploadModal
                        userId={user.id}
                        currentAvatarUrl={avatarUrl}
                        onUploadComplete={(url) => {
                            setAvatarUrl(url)
                            router.refresh()
                        }}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Mantenha seus dados atualizados para atrair empresas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="fullname">Nome Completo</Label>
                        <Input
                            id="fullname"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mainRole">Cargo / Especialidade</Label>
                        <Input
                            id="mainRole"
                            placeholder="Ex: Desenvolvedor Front-end, UX Designer..."
                            value={mainRole}
                            onChange={(e) => setMainRole(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Como você quer ser conhecido profissionalmente.</p>
                    </div>

                    {/* ACADEMIC INFO SECTION */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="entryPeriod" className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" /> Entrada (Ano.Semestre)
                            </Label>
                            <Select value={entryPeriod} onValueChange={setEntryPeriod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o ano" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2022.1">2022.1</SelectItem>
                                    <SelectItem value="2022.2">2022.2</SelectItem>
                                    <SelectItem value="2023.1">2023.1</SelectItem>
                                    <SelectItem value="2023.2">2023.2</SelectItem>
                                    <SelectItem value="2024.1">2024.1</SelectItem>
                                    <SelectItem value="2024.2">2024.2</SelectItem>
                                    <SelectItem value="2025.1">2025.1</SelectItem>
                                    <SelectItem value="2025.2">2025.2</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="className">Turma</Label>
                            <Input
                                id="className"
                                placeholder="ex: Turma 02"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Turno</Label>
                        <Select value={shift} onValueChange={setShift}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o Turno" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Manhã">Manhã</SelectItem>
                                <SelectItem value="Tarde">Tarde</SelectItem>
                                <SelectItem value="Noite">Noite</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                        <Switch id="embarque" checked={isEmbarque} onCheckedChange={setIsEmbarque} />
                        <Label htmlFor="embarque">Sou bolsista do Embarque Digital</Label>
                    </div>

                    {/* IES Selection */}
                    <div className="grid gap-2">
                        <Label className="flex items-center gap-1"><School className="w-3 h-3" /> Instituição de Ensino (IES)</Label>
                        <Select value={selectedIES} onValueChange={setSelectedIES}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione sua Faculdade" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredIESList.map(ies => (
                                    <SelectItem key={ies.id} value={ies.id}>{ies.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {filteredIESList.length === 0 && entryPeriod && (
                            <p className="text-xs text-red-500">Nenhuma IES encontrada para esse período.</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio / Resumo Profissional</Label>
                        <Textarea
                            id="bio"
                            placeholder="Conte um pouco sobre suas experiências e objetivos..."
                            className="min-h-[100px]"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Habilidades & Experiência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="skills">Habilidades (separadas por vírgula)</Label>
                        <Input
                            id="skills"
                            placeholder="React, Node.js, Design, SQL..."
                            value={skillsInput}
                            onChange={(e) => setSkillsInput(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Ex: React, Typescript, UI/UX</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Links & Portfólio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="linkedin" className="flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</Label>
                        <Input
                            id="linkedin"
                            placeholder="https://linkedin.com/in/seu-perfil"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="github" className="flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</Label>
                        <Input
                            id="github"
                            placeholder="https://github.com/seu-user"
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="portfolio" className="flex items-center gap-2"><Globe className="w-4 h-4" /> Portfólio / Site</Label>
                        <Input
                            id="portfolio"
                            placeholder="https://seu-portfolio.com"
                            value={portfolio}
                            onChange={(e) => setPortfolio(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end sticky bottom-4">
                <Button type="submit" size="lg" disabled={loading} className="shadow-xl">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Alterações
                </Button>
            </div>
        </form>
    )
}
