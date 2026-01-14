
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label' // Ensure this exists or use generic label
import { LogOut, GraduationCap, Users, UserCheck, Plus, Trash2, Globe, Megaphone } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateCardForm } from '@/components/ies-create-card-form'

export function IESDashboardClient({
    user,
    profile,
    iesData,
    students,
    cards,
    stats
}: {
    user: any,
    profile: any,
    iesData: any,
    students: any[],
    cards: any[],
    stats: any
}) {
    const supabase = createClient()
    const [ies, setIes] = useState(iesData || {})
    const [loading, setLoading] = useState(false)

    // Derived State
    const classes: Record<string, any[]> = {}
    students.forEach(student => {
        const period = student.entry_period || 'Sem Período'
        const name = student.class_name || 'Sem Turma'
        const shift = student.shift || 'Sem Turno'
        const key = `${period} - ${name} (${shift})`
        if (!classes[key]) classes[key] = []
        classes[key].push(student)
    })

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!ies.id) return
        setLoading(true)

        const { error } = await supabase
            .from('ies')
            .update({
                name: ies.name,
                description: ies.description,
                website: ies.website,
                logo_url: ies.logo_url,
                cover_image_url: ies.cover_image_url
            })
            .eq('id', ies.id)

        setLoading(false)
        if (error) {
            console.error(error)
            alert('Erro ao atualizar perfil.')
        } else {
            alert('Perfil atualizado com sucesso!')
            window.location.reload()
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="border-b bg-card px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl">{ies.name || profile.full_name}</h1>
                        <p className="text-xs text-muted-foreground">Portal da Instituição</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {ies.id && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/ies/public/${ies.id}`} target="_blank">
                                <Globe className="w-4 h-4 mr-2" />
                                Ver Página Pública
                            </Link>
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
                        <LogOut className="w-4 h-4 mr-2" /> Sair
                    </Button>
                </div>
            </header>

            <main className="container mx-auto p-8 max-w-6xl">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                        <TabsTrigger value="profile">Perfil</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid md:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Alunos</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{stats.totalStudents}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Embarque Digital</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold text-blue-600">{stats.totalEmbarque}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Cobranding</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold text-amber-600">{stats.totalCobranding}</div></CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Turmas Ativas</CardTitle></CardHeader>
                                <CardContent><div className="text-2xl font-bold">{stats.totalClasses}</div></CardContent>
                            </Card>
                        </div>

                        {/* News / Cards Management */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Megaphone className="w-5 h-5" />
                                    Mural de Destaques
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <Card className="border-dashed border-2 bg-muted/20">
                                    <CardHeader>
                                        <CardTitle className="text-base text-center">Criar Novo Destaque</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CreateCardForm iesId={ies.id} />
                                    </CardContent>
                                </Card>

                                {cards?.map((card: any) => (
                                    <Card key={card.id} className="flex flex-col">
                                        {card.image_url && (
                                            <div className="h-32 w-full bg-cover bg-center rounded-t-xl" style={{ backgroundImage: `url(${card.image_url})` }} />
                                        )}
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline">{card.type.toUpperCase()}</Badge>
                                                <form action="/api/ies/delete-card" method="post">
                                                    <input type="hidden" name="id" value={card.id} />
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50">
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </form>
                                            </div>
                                            <CardTitle className="text-lg leading-snug mt-2">{card.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-sm text-muted-foreground line-clamp-3">{card.content}</p>
                                        </CardContent>
                                        <CardFooter>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(card.created_at).toLocaleDateString()}
                                            </span>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        <div className="border-t pt-4" />

                        {/* Class Lists */}
                        <section>
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                                <Users className="w-5 h-5" />
                                Minhas Turmas
                            </h2>

                            <div className="grid gap-6">
                                {Object.entries(classes).map(([className, classStudents]) => (
                                    <Card key={className} className="overflow-hidden">
                                        <CardHeader className="bg-muted/30 py-3 flex flex-row items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base">{className}</CardTitle>
                                            </div>
                                            <Badge variant="secondary">{classStudents.length} alunos</Badge>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y max-h-[300px] overflow-y-auto">
                                                {classStudents.map((s) => (
                                                    <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                                {s.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{s.name}</p>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    {s.linkedin_url && (
                                                                        <Link href={s.linkedin_url} target="_blank" className="hover:underline text-blue-500">
                                                                            LinkedIn
                                                                        </Link>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {s.is_embarque_holder ? (
                                                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                                                                    Embarque Digital
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                                                                    Cobranding
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </TabsContent>

                    {/* PROFILE TAB */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Editar Perfil da IES</CardTitle>
                                <CardDescription>Estas informações aparecem na página pública da instituição.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Nome da Instituição</Label>
                                    <Input value={ies.name || ''} onChange={e => setIes({ ...ies, name: e.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Website Oficial</Label>
                                    <Input value={ies.website || ''} onChange={e => setIes({ ...ies, website: e.target.value })} placeholder="https://..." />
                                </div>
                                <div className="grid gap-2">
                                    <Label>URL da Logo (Quadrada)</Label>
                                    <Input value={ies.logo_url || ''} onChange={e => setIes({ ...ies, logo_url: e.target.value })} placeholder="https://..." />
                                </div>
                                <div className="grid gap-2">
                                    <Label>URL da Imagem de Capa (Wide)</Label>
                                    <Input
                                        value={ies.cover_image_url || ''}
                                        onChange={e => setIes({ ...ies, cover_image_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                    <p className="text-xs text-muted-foreground">Recomendado: 1200x300px</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Descrição / Bio</Label>
                                    <Textarea
                                        className="min-h-[150px]"
                                        value={ies.description || ''}
                                        onChange={e => setIes({ ...ies, description: e.target.value })}
                                        placeholder="Sobre a instituição..."
                                    />
                                </div>
                                <Button onClick={handleUpdateProfile} disabled={loading}>
                                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
