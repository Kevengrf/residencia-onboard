
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame, User, LayoutDashboard, LogOut } from 'lucide-react'

export const revalidate = 0

export default async function StudentDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch student profile data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch stats
    const { count: applicationsCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id)

    // TODO: Fetch matches (where status = 'matched' or similar)
    // For now, let's assume matches are applications with 'accepted' status
    const { count: matchesCount } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id)
        .eq('status', 'accepted')

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* ... Header ... */}
            <header className="border-b bg-card px-4 py-4 flex justify-between items-center">
                <div>
                    <h1 className="font-bold text-xl">Olá, {profile?.full_name?.split(' ')[0]} 👋</h1>
                    <p className="text-xs text-muted-foreground">Portal do Aluno</p>
                </div>
                <form action="/auth/signout" method="post">
                    <Button variant="ghost" size="icon">
                        <LogOut className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </form>
            </header>

            <main className="container mx-auto p-4 space-y-6">

                {/* Match CTA */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">Encontre seu Match!</h2>
                        <p className="mb-4 opacity-90 max-w-[200px]">
                            Descubra vagas ideais para você e candidate-se com um swipe.
                        </p>
                        <Button variant="secondary" size="lg" className="font-bold text-rose-600" asChild>
                            <Link href="/student/match">
                                <Flame className="w-5 h-5 mr-2 fill-rose-600" />
                                Começar Agora
                            </Link>
                        </Button>
                    </div>
                    <Flame className="absolute -right-8 -bottom-8 w-48 h-48 text-white opacity-20 rotate-12" />
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Candidaturas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{applicationsCount || 0}</div>
                            <p className="text-xs text-muted-foreground">Vagas aguardando</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Matches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{matchesCount || 0}</div>
                            <p className="text-xs text-muted-foreground">Empresas interessadas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 gap-4">
                    <Button variant="outline" className="h-16 justify-start text-lg px-6" asChild>
                        <Link href="/student/profile">
                            <User className="w-6 h-6 mr-4 text-primary" />
                            Meu Perfil
                        </Link>
                    </Button>
                    <Button variant="outline" className="h-16 justify-start text-lg px-6" asChild>
                        <Link href="/student/projects">
                            <LayoutDashboard className="w-6 h-6 mr-4 text-primary" />
                            Meus Projetos
                        </Link>
                    </Button>
                </div>

            </main>
        </div>
    )
}
