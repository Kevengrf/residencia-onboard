
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureCompanyUser() {
    console.log('🏢 Ensuring Company User exists...');

    const email = 'empresa@residencia.com';
    const password = 'password123';

    // 1. Get the first company from the DB
    const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .limit(1);

    if (companyError || !companies || companies.length === 0) {
        console.error('❌ No companies found in database. Run seed script first.');
        return;
    }

    const company = companies[0];
    console.log(`🔗 Linking to Company: ${company.name} (${company.id})`);

    // 2. Check if user exists
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
        console.log('👤 Creating new user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: 'Admin da Empresa', role: 'company' }
        });

        if (createError) {
            console.error('Error creating user:', createError.message);
            return;
        }
        user = newUser.user;
    } else {
        console.log('👤 User already exists. Updating password...');
        await supabase.auth.admin.updateUserById(user.id, { password: password });
    }

    // 3. Update Profile (Role + Company Link)
    // We update public.profiles directly to ensure the link
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            role: 'company',
            company_id: company.id,
            full_name: 'Admin da Empresa',
            updated_at: new Date()
        });

    if (profileError) {
        console.error('❌ Error updating profile:', profileError.message);
    } else {
        console.log('✅ Success! User linked.');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log(`🏢 Company: ${company.name}`);
        if (company.logo_url) console.log(`🖼️ Logo: ${company.logo_url}`);
        else console.log('🖼️ No logo found.');
    }
}

ensureCompanyUser();
