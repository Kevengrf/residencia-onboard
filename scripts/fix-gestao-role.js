const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runFix() {
    console.log('Running fix for gestao@residencia.com...');

    // We can't run raw SQL blocks easily via JS client without RPC or generic SQL function.
    // We'll reproduce the logic in JS using the admin client.

    const email = 'gestao@residencia.com';

    // 1. Get User ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log(`Found user ${user.id}`);

    // 2. Update Profile
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'management' })
        .eq('id', user.id);

    if (profileError) console.error('Profile Update Error:', profileError);
    else console.log('Profile updated to MANAGEMENT');

    // 3. Delete from Students
    const { error: delStudent } = await supabase.from('students').delete().eq('id', user.id);
    if (delStudent) console.error('Delete Student Error:', delStudent);
    else console.log('Removed from Students table');

    // 4. Ensure Management User
    const { error: insMgmt } = await supabase
        .from('management_users')
        .insert({ id: user.id })
        .select();

    // Ignore conflict error if it exists
    if (insMgmt && !insMgmt.message?.includes('duplicate key')) {
        console.error('Insert Management Error:', insMgmt);
    } else {
        console.log('Ensured in management_users table');
    }

    console.log('Fix complete.');
}

runFix();
