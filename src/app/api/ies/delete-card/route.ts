
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
    const supabase = await createClient()
    const formData = await request.formData()
    const id = formData.get('id') as string

    if (id) {
        await supabase.from('ies_cards').delete().eq('id', id)
    }

    redirect('/ies')
}
