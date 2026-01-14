
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureManagementUser() {
    const email = 'gestao@residencia.com';
    const password = 'password123';

    console.log(`Ensuring user ${email} exists...`);

    // 1. Check if user exists in Auth
    // Note: listing users requires service role
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    let user = users.find(u => u.email === email);

    if (!user) {
        console.log('User not found. Creating...');
        const { data, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: 'Gestão - Admin 2' }
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }
        user = data.user;
        console.log('User created with ID:', user.id);
    } else {
        console.log('User already exists (ID: ' + user.id + '). Updating password...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            password: password
        });
        if (updateError) console.error('Error resetting password:', updateError);
        else console.log('Password reset to default.');
    }

    // 2. Ensure Profile exists and has correct role
    console.log('Updating public profile...');
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: 'Gestão - Admin 2',
            role: 'management',
            // email: email, // removed as it does not exist in profiles
            updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (profileError) {
        console.error('Error updating profile:', profileError);
    } else {
        console.log('Profile updated successfully.');
    }
}

ensureManagementUser();
