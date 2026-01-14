
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const iesList = [
    'CESAR School',
    'FICR',
    'Faculdade Senac',
    'Unicap',
    'Uninassau',
    'Unit'
];

async function seedData() {
    console.log('Seeding IES...');

    for (const name of iesList) {
        const { error } = await supabase
            .from('ies')
            .insert({ name, description: 'Parceiro da Residência Tecnológica' });

        if (!error) console.log(`Created IES: ${name}`);
    }
}

seedData();
