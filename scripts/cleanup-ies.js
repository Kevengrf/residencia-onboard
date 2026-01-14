
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanupIES() {
    console.log('Starting IES Cleanup...')

    // 1. Fetch all IES
    const { data: allIES, error } = await supabase.from('ies').select('*')
    if (error) {
        console.error('Error fetching IES:', error)
        return
    }

    console.log(`Found ${allIES.length} IES records.`)

    // Define Mappings (Bad Name -> Good Name)
    const mappings = {
        'Faculdade Senac': 'Senac',
        'UNICAP': 'Unicap',
        'UNIT': 'Unit',
        'Uninassau': 'Nassau',
        'CESAR': 'CESAR School'
    }

    const goodNames = Object.values(mappings)

    // Also define start periods for the Good ones
    const startPeriods = {
        'Senac': '2022.1',
        'Unicap': '2022.1',
        'Unit': '2022.1',
        'FICR': '2022.2',
        'Nassau': '2023.1',
        'CESAR School': '2023.2'
    }

    for (const [badName, goodName] of Object.entries(mappings)) {
        const badRecord = allIES.find(i => i.name === badName)
        const goodRecord = allIES.find(i => i.name === goodName)

        if (badRecord && goodRecord) {
            console.log(`Merging '${badName}' (${badRecord.id}) -> '${goodName}' (${goodRecord.id})...`)

            // A. Update Profiles
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ ies_id: goodRecord.id })
                .eq('ies_id', badRecord.id)

            if (updateError) {
                console.error(`Error updating profiles for ${badName}:`, updateError)
                continue
            }

            // B. Delete Bad Record
            const { error: deleteError } = await supabase
                .from('ies')
                .delete()
                .eq('id', badRecord.id)

            if (deleteError) {
                console.error(`Error deleting ${badName}:`, deleteError)
            } else {
                console.log(`Deleted '${badName}' successfully.`)
            }
        } else {
            if (badRecord && !goodRecord) {
                console.log(`Found bad record '${badName}' but no target '${goodName}'. Renaming bad record to good.`)
                const { error: renameError } = await supabase
                    .from('ies')
                    .update({ name: goodName })
                    .eq('id', badRecord.id)
                if (renameError) console.error('Error renaming:', renameError)
            }
        }
    }

    // Update Start Periods for everyone remaining
    for (const [name, period] of Object.entries(startPeriods)) {
        const { error: periodError } = await supabase
            .from('ies')
            .update({ start_period: period })
            .eq('name', name)

        if (periodError) console.error(`Error updating period for ${name}:`, periodError)
    }

    console.log('Cleanup Finished.')
}

cleanupIES()
