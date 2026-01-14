
import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, Building2, Calendar, FileText, Video, ExternalLink } from 'lucide-react'

export const revalidate = 0

// Fix for Next.js 15+ params
type Props = {
    params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch Allocation with Project Details
    const { data: allocation } = await supabase
        .from('project_allocations')
        .select(`
            *,
            project:company_projects (
                *,
                company:companies(*),
                period:residency_periods(*)
            )
        `)
        .eq('id', id)
        .eq('student_id', user.id) // Security check: must be own allocation
        .single()

    if (!allocation) {
        return notFound()
    }

    const { project } = allocation
    const companyName = project.company?.name || project.historic_company_name || 'Empresa não identificada'

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="border-b bg-card px-4 py-4 flex items-center sticky top-0 z-10">
                <Button variant="ghost" size="icon" asChild className="mr-4">
                    <Link href="/student/projects"><ArrowLeft className="w-6 h-6" /></Link>
                </Button>
                <div>
                    <h1 className="font-bold text-lg">Detalhes do Projeto</h1>
                </div>
            </header>

            <main className="container mx-auto p-4 max-w-3xl space-y-6">

                {/* Header Section */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{project.period?.name}</Badge>
                        <Badge>{allocation.status.toUpperCase()}</Badge>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{project.title}</h2>
                    <div className="flex items-center text-muted-foreground">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span className="font-medium">{companyName}</span>
                    </div>
                </div>

                {/* Description */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sobre o Desafio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                            {project.description || "Sem descrição informada."}
                        </p>
                    </CardContent>
                </Card>

                {/* Resources / Delivery */}
                <div className="grid md:grid-cols-2 gap-4">
                    {project.pdf_url && (
                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg dark:bg-red-900/20">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-medium truncate">Documentação PDF</h4>
                                    <p className="text-xs text-muted-foreground">Material de apoio ou entrega</p>
                                </div>
                                <Button variant="ghost" size="icon" asChild>
                                    <a href={project.pdf_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {project.video_url && (
                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/20">
                                    <Video className="w-6 h-6" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-medium truncate">Vídeo / Pitch</h4>
                                    <p className="text-xs text-muted-foreground">Apresentação do projeto</p>
                                </div>
                                <Button variant="ghost" size="icon" asChild>
                                    <a href={project.video_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Feedback / Grade if available */}
                {(allocation.feedback || allocation.grade) && (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-primary text-lg">Avaliação & Feedback</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {allocation.grade && (
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-1">Nota Final</span>
                                    <span className="text-4xl font-bold">{allocation.grade}</span>
                                </div>
                            )}
                            {allocation.feedback && (
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-1">Comentários</span>
                                    <p className="italic text-muted-foreground">"{allocation.feedback}"</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

            </main>
        </div>
    )
}
