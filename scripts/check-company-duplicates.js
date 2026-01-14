
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: companies, error } = await supabase
        .from('companies')
        .select('id, name, created_at');

    if (error) {
        console.error(error);
        return;
    }

    console.table(companies);

    // Identificar duplicadas
    const counts = {};
    companies.forEach(c => {
        counts[c.name] = (counts[c.name] || 0) + 1;
    });

    const duplicates = Object.keys(counts).filter(name => counts[name] > 1);

    if (duplicates.length > 0) {
        console.log('\n❌ Duplicates Found:', duplicates);
    } else {
        console.log('\n✅ No duplicates found.');
    }
}

check();
