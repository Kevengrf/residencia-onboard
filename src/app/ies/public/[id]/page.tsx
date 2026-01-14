
import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Users, Trophy, Megaphone, Calendar, ArrowLeft, Globe, MapPin } from 'lucide-react'

export const revalidate = 0

export default async function IESPublicPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch IES Details
    const { data: ies, error } = await supabase
        .from('ies')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !ies) {
        notFound()
    }

    // 2. Fetch Stats (or basic count)
    const { count: studentCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('ies_id', id)
        .eq('role', 'student')

    // 3. Fetch Cards
    const { data: cards } = await supabase
        .from('ies_cards')
        .select('*')
        .eq('ies_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Navbar */}
            <header className="border-b bg-card sticky top-0 z-20">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Voltar para Home</span>
                    </Link>
                    <div className="font-bold text-lg hidden md:block">{ies.name}</div>
                    <Button asChild variant="default">
                        <Link href="/login">Área do Aluno</Link>
                    </Button>
                </div>
            </header>

            {/* Cover Image & Branding */}
            <div className="relative w-full h-[250px] md:h-[350px] bg-muted overflow-hidden">
                {ies.cover_image_url ? (
                    <img src={ies.cover_image_url} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-900 to-indigo-900 flex items-center justify-center">
                        <GraduationCap className="w-20 h-20 text-white/10" />
                    </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-10 max-w-5xl">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 text-center md:text-left">
                    {/* Logo */}
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-card rounded-2xl shadow-lg border-4 border-background flex items-center justify-center overflow-hidden shrink-0">
                        {ies.logo_url ? (
                            <img src={ies.logo_url} alt={ies.name} className="w-full h-full object-cover" />
                        ) : (
                            <GraduationCap className="w-12 h-12 text-muted-foreground" />
                        )}
                    </div>
                    {/* Title & Info */}
                    <div className="flex-1 pb-2">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{ies.name}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            {ies.website && (
                                <a href={ies.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary hover:underline bg-primary/10 px-3 py-1 rounded-full text-sm font-medium">
                                    <Globe className="w-4 h-4 mr-2" />
                                    Website Oficial
                                </a>
                            )}
                            <Badge variant="secondary" className="px-3">
                                Entrada: {ies.start_period}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* About */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">Sobre a Instituição</h2>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed p-6 border rounded-xl bg-card/50">
                                {ies.description ? (
                                    <p className="whitespace-pre-wrap">{ies.description}</p>
                                ) : (
                                    <p className="italic">Nenhuma descrição informada.</p>
                                )}
                            </div>
                        </section>

                        {/* Mural / Cards */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Megaphone className="w-6 h-6 text-primary" />
                                Mural de Destaques
                            </h2>
                            <div className="space-y-6">
                                {cards && cards.length > 0 ? (
                                    <div className="grid gap-6">
                                        {cards.map((card: any) => (
                                            <Card key={card.id} className="overflow-hidden hover:border-primary/50 transition-all shadow-sm">
                                                {card.image_url && (
                                                    <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${card.image_url})` }} />
                                                )}
                                                <CardHeader className="bg-muted/30 pb-4">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-xl">{card.title}</CardTitle>
                                                        <Badge variant={card.type === 'achievement' ? 'default' : 'secondary'}>
                                                            {card.type === 'achievement' ? 'Conquista' : card.type === 'news' ? 'Notícia' : 'Destaque'}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        Publicado em {new Date(card.created_at).toLocaleDateString()}
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-6">
                                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{card.content}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 border rounded-xl bg-muted/20 border-dashed">
                                        <p className="text-muted-foreground">Nenhuma publicação recente no mural.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="border rounded-xl bg-card p-6 shadow-sm sticky top-24">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-500" />
                                Números da IES
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">Alunos Ativos</span>
                                    <span className="font-bold text-lg">{studentCount || '--'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">Projetos Vencedores</span>
                                    <span className="font-bold text-lg text-amber-600">--</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <h4 className="font-semibold text-sm mb-2">Contato</h4>
                                <p className="text-sm text-muted-foreground mb-4">Em caso de dúvidas sobre a residência nesta instituição:</p>
                                <Button variant="outline" className="w-full" asChild>
                                    <a href="mailto:coordenacao@ies.com">Falar com Coordenação</a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
