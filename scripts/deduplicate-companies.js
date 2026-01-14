
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function deduplicate() {
    console.log('🧹 Deduplicating companies...');

    const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: true }); // Keep oldest? Or newest? Let's keep oldest.

    const seen = new Set();
    const toDelete = [];

    for (const company of companies) {
        const normalized = company.name.trim(); // Case sensitive match based on screenshot
        if (seen.has(normalized)) {
            console.log(`🗑️ Mark for deletion: ${normalized} (ID: ${company.id})`);
            toDelete.push(company.id);
        } else {
            console.log(`✅ Keep: ${normalized} (ID: ${company.id})`);
            seen.add(normalized);
        }
    }

    if (toDelete.length > 0) {
        const { error } = await supabase
            .from('companies')
            .delete()
            .in('id', toDelete);

        if (error) console.error('Error deleting:', error);
        else console.log(`Deleted ${toDelete.length} duplicates.`);
    } else {
        console.log('No duplicates to delete.');
    }
}

deduplicate();
