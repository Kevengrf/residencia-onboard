
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const requestUrl = new URL(request.url)
    const supabase = await createClient()

    // Check if we have a session
    const {
        data: { session },
    } = await supabase.auth.getSession()

    if (session) {
        await supabase.auth.signOut()
    }

    // Redirect to the home page after sign out
    return NextResponse.redirect(`${requestUrl.origin}/`, {
        status: 301,
    })
}
