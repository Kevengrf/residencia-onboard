
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDb() {
    console.log('Checking database connection...');

    const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

    if (error) {
        console.error('Error connecting to profiles table:', error);
        console.log('Most likely cause: The schema.sql has not been run in Supabase SQL Editor.');
    } else {
        console.log('Successfully connected to profiles table.');
        console.log('Data:', data);
    }
}

checkDb();
