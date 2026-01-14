
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkIES() {
    const { data, error } = await supabase.from('ies').select('*')
    if (error) {
        console.error('Error fetching IES:', error)
    } else {
        console.log('IES in DB:', data)
    }
}

checkIES()
