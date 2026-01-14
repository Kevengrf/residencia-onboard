
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { StudentProfileForm } from '@/components/student-profile-form'

export const revalidate = 0

export default async function StudentProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch Student Details
    const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch IES List
    const { data: iesList } = await supabase
        .from('ies')
        .select('*')
        .order('name')

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="border-b bg-card px-4 py-4 flex items-center sticky top-0 z-10">
                <Button variant="ghost" size="icon" asChild className="mr-4">
                    <Link href="/student"><ArrowLeft className="w-6 h-6" /></Link>
                </Button>
                <h1 className="font-bold text-lg">Meu Perfil</h1>
            </header>

            <main className="container mx-auto p-4 max-w-2xl">
                <StudentProfileForm
                    user={user}
                    profile={profile}
                    student={student}
                    iesList={iesList || []}
                />
            </main>
        </div>
    )
}
