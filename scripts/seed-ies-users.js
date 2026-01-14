
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const fs = require('fs')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

const iesData = [
    { name: 'Senac', email: 'senac@residencia.com', password: 'password123' },
    { name: 'UNICAP', email: 'unicap@residencia.com', password: 'password123' },
    { name: 'UNIT', email: 'unit@residencia.com', password: 'password123' },
    { name: 'FICR', email: 'ficr@residencia.com', password: 'password123' },
    { name: 'Nassau', email: 'nassau@residencia.com', password: 'password123' },
    { name: 'CESAR School', email: 'cesar@residencia.com', password: 'password123' },
]

async function seedIES() {
    console.log('Starting IES Seeding...')
    let credentialsOutput = '# Credenciais das IES\n\n'

    for (const ies of iesData) {
        console.log(`Processing ${ies.name}...`)

        // 1. Create or Get IES record in public table
        let iesId
        const { data: existingIES, error: fetchError } = await supabase
            .from('ies')
            .select('id')
            .eq('name', ies.name)
            .single()

        if (existingIES) {
            iesId = existingIES.id
        } else {
            const { data: newIES, error: insertError } = await supabase
                .from('ies')
                .insert({ name: ies.name, description: 'Instituição parceira do Embarque Digital' })
                .select()
                .single()

            if (insertError) {
                console.error(`Error creating IES ${ies.name}:`, insertError)
                continue
            }
            iesId = newIES.id
        }

        // 2. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: ies.email,
            password: ies.password,
            email_confirm: true,
            user_metadata: {
                full_name: `Admin ${ies.name}`,
                role: 'ies'
            }
        })

        if (authError) {
            // If user already exists, we might want to update their profile to link to this IES ID
            console.log(`User ${ies.email} might already exist or error: ${authError.message}`)
            // Try to fetch existing user to link
            // (Skipping for simplicity in this script, assuming clean start or manual fix if needed)
        } else {
            console.log(`Created user ${ies.email}`)

            // 3. Link Profile to IES
            // The trigger might have created the profile, but we need to set the ies_id
            const userId = authData.user.id

            const { error: updateProfileError } = await supabase
                .from('profiles')
                .update({
                    role: 'ies',
                    ies_id: iesId,
                    full_name: `Admin ${ies.name}`
                })
                .eq('id', userId)

            if (updateProfileError) {
                console.error(`Error linking profile for ${ies.name}:`, updateProfileError)
            }
        }

        credentialsOutput += `### ${ies.name}\n- **Email:** ${ies.email}\n- **Senha:** ${ies.password}\n\n`
    }

    // Write credentials to file
    fs.writeFileSync('credentials_ies.md', credentialsOutput)
    console.log('Seeding complete! Credentials saved to credentials_ies.md')
}

seedIES()
