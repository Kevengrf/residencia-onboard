
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, Rocket, Building2, CheckCircle2 } from 'lucide-react'

export const revalidate = 0

export default async function MyProjectsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. Fetch Allocations (Projects user is doing)
    const { data: allocations } = await supabase
        .from('project_allocations')
        .select(`
            *,
            project:company_projects (
                *,
                company:companies(*),
                period:residency_periods(*)
            )
        `)
        .eq('student_id', user.id)

    // 2. Fetch Available Projects (If user has no allocations, show Kick-off)
    // Logic: If Student is Semester 1, show Kickoff projects from Active Periods
    const { data: availableKickoffs } = await supabase
        .from('company_projects')
        .select(`
            *,
            company:companies(*),
            period:residency_periods(*)
        `)
        .eq('type', 'kickoff')
        .eq('period.status', 'active') // This might need a join filter logic, simplified for now
        .limit(1)

    // Filter available kickoffs manually if join filter is tricky in simple query
    const kickoffs = availableKickoffs?.filter(k => k.period?.status === 'active') || []

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="border-b bg-card px-4 py-4 flex items-center sticky top-0 z-10">
                <Button variant="ghost" size="icon" asChild className="mr-4">
                    <Link href="/student"><ArrowLeft className="w-6 h-6" /></Link>
                </Button>
                <div>
                    <h1 className="font-bold text-lg">Meus Projetos</h1>
                    <p className="text-xs text-muted-foreground">Jornada de Residência</p>
                </div>
            </header>

            <main className="container mx-auto p-4 space-y-8 max-w-3xl">

                {/* Active Projects Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-primary" />
                        Projetos Ativos
                    </h2>

                    {allocations && allocations.length > 0 ? (
                        <div className="grid gap-4">
                            {allocations.map((alloc: any) => (
                                <Card key={alloc.id} className="border-l-4 border-l-primary">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Badge variant="outline" className="mb-2">{alloc.project.period.name}</Badge>
                                                <CardTitle>{alloc.project.title}</CardTitle>
                                                <CardDescription className="flex items-center gap-1 mt-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {alloc.project.company?.name || alloc.project.historic_company_name || 'Empresa Desconhecida'}
                                                </CardDescription>
                                            </div>
                                            <Badge>{alloc.project.type.toUpperCase()}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{alloc.project.description}</p>
                                    </CardContent>
                                    <CardFooter className="justify-between bg-muted/20 py-3">
                                        <span className="text-xs text-muted-foreground">Status: {alloc.status === 'active' ? 'Em andamento' : alloc.status}</span>
                                        <Link href={`/student/projects/${alloc.id}`} className="text-sm font-medium hover:underline text-primary">
                                            Ver Detalhes
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 dashed rounded-xl">
                            <p className="text-muted-foreground mb-4">Você ainda não está alocado em nenhum projeto.</p>
                            {/* Temporary Setup Button for Demo */}
                            <form action="/api/setup-kickoff" method="post">
                                <Button variant="outline" type="submit" disabled>
                                    Aguardando Início do Semestre
                                </Button>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    (Projetos são atribuídos pela coordenação)
                                </p>
                            </form>
                        </div>
                    )}
                </section>

                {/* Available / Upcoming (For demo: Show the Kickoff created via SQL) */}
                {(!allocations || allocations.length === 0) && kickoffs.length > 0 && (
                    <section className="opacity-75">
                        <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Próximos Projetos (Exemplo)</h2>
                        {kickoffs.map(proj => (
                            <Card key={proj.id} className="bg-muted/30">
                                <CardHeader>
                                    <CardTitle className="text-base">{proj.title}</CardTitle>
                                    <CardDescription>
                                        {proj.company?.name || proj.historic_company_name} • {proj.period?.name}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </section>
                )}

                {/* Historic Section */}
                <section>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 mt-8 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5" />
                        Histórico
                    </h2>
                    <p className="text-sm text-muted-foreground">Nenhum projeto finalizado.</p>
                </section>

            </main>
        </div>
    )
}
