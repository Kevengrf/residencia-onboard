
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { IESDashboardClient } from '@/components/ies-dashboard-client'

export const revalidate = 0

export default async function IESDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // Get IES Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*, ies(*)')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'ies') redirect('/student')

    const iesData = profile.ies || {}
    const iesId = iesData.id

    // 1. Fetch Students
    const { data: studentsData } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            student:students!inner (
                id,
                entry_period,
                class_name,
                shift,
                is_embarque_holder,
                linkedin_url
            )
        `)
        .eq('ies_id', iesId)
        .order('full_name')

    const students = studentsData?.map((p: any) => ({
        id: p.id,
        name: p.full_name,
        ...p.student
    })) || []

    // 2. Fetch Cards
    const { data: cards } = await supabase
        .from('ies_cards')
        .select('*')
        .eq('ies_id', iesId)
        .order('created_at', { ascending: false })

    // Stats
    const totalStudents = students.length
    const totalEmbarque = students.filter((s: any) => s.is_embarque_holder).length
    const totalCobranding = totalStudents - totalEmbarque

    // Calculate total classes
    const classes = new Set(students.map((s: any) => s.class_name).filter(Boolean))
    const totalClasses = classes.size

    const stats = {
        totalStudents,
        totalEmbarque,
        totalCobranding,
        totalClasses
    }

    return (
        <IESDashboardClient
            user={user}
            profile={profile}
            iesData={iesData}
            students={students}
            cards={cards || []}
            stats={stats}
        />
    )
}
