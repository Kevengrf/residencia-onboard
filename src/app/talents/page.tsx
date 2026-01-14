import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { MainNavbar } from '@/components/main-navbar'
import { TalentCard } from '@/components/talent-card'

export const revalidate = 0

export default async function TalentsPage() {
    const supabase = await createClient()

    const { data: students } = await supabase
        .from('students')
        .select(`
            *,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <MainNavbar />

            <main className="container mx-auto px-4 py-12 flex-1">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-[#004d40] dark:text-emerald-400">
                        Talentos da Residência
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Conheça os profissionais que estão sendo formados para liderar o mercado de tecnologia.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {students?.map((student: any) => (
                        <TalentCard key={student.id} student={student} />
                    ))}

                    {(!students || students.length === 0) && (
                        <div className="col-span-full py-20 text-center text-muted-foreground">
                            <p>Nenhum talento encontrado no momento.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
