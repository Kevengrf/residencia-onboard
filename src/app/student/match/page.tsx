
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import JobMatchDeck from '@/components/job-match-deck'

export const revalidate = 0

export default async function MatchPage() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 2. Fetch Jobs not yet applied
    // This requires a slightly complex query (jobs where id NOT IN applications).
    // Supabase JS doesn't support NOT IN nicely with related tables in one go sometimes.
    // For MVP, we'll fetch open jobs and filter client side or fetch existing applications first.

    // Fetch all application job IDs for this student
    const { data: applications } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('student_id', user.id)

    const appliedJobIds = applications?.map(app => app.job_id) || []

    // Fetch open jobs
    let query = supabase
        .from('jobs')
        .select(`
            id, 
            title, 
            description, 
            salary_range, 
            location, 
            type,
            companies ( name, logo_url )
        `)
        .eq('status', 'open')
        .limit(20)

    // Apply exclusion filter if possible, or filter in memory
    const { data: allJobs } = await query

    if (!allJobs) return <div>Erro ao carregar vagas.</div>

    // Filter out already applied jobs
    // In a real production app with thousands of jobs, this filtering should happen on DB (RPC function)
    const availableJobs = allJobs
        .filter(job => !appliedJobIds.includes(job.id))
        .map(job => ({
            ...job,
            company: Array.isArray(job.companies) ? job.companies[0] : job.companies
        }))

    return (
        <div className="min-h-screen bg-background flex flex-col items-center">
            {/* Header */}
            <header className="w-full flex items-center p-4 border-b bg-card absolute top-0 z-50">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/student"><ArrowLeft className="w-6 h-6" /></Link>
                </Button>
                <div className="mx-auto font-bold text-lg">Encontrar Vagas</div>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <main className="flex-1 w-full max-w-md flex flex-col justify-center pt-20 px-4 overflow-hidden">
                <div className="text-center mb-6">
                    <p className="text-muted-foreground text-sm">
                        Deslize para a direita para se candidatar,<br />esquerda para passar.
                    </p>
                </div>

                <JobMatchDeck jobs={availableJobs} studentId={user.id} />
            </main>
        </div>
    )
}
