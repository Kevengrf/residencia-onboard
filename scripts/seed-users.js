
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const users = [
    { email: 'suporte@residencia.com', password: 'password123', role: 'support', name: 'Suporte Admin' },
    { email: 'gestao@residencia.com', password: 'password123', role: 'management', name: 'Gestão Admin' },
    { email: 'empresa@residencia.com', password: 'password123', role: 'company', name: 'Empresa Admin' },
    { email: 'ies@residencia.com', password: 'password123', role: 'ies', name: 'IES Admin' },
    { email: 'aluno@residencia.com', password: 'password123', role: 'student', name: 'Aluno Teste' },
];

async function seedUsers() {
    console.log('Starting user creation...');

    for (const user of users) {
        try {
            // Check if user exists first (optional, but good for re-running)
            // Actually createUser will error if exists, which is fine, we catch it.

            const { data, error } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: {
                    full_name: user.name,
                    role: user.role
                }
            });

            if (error) {
                console.log(`Error creating ${user.email}:`, error.message);
            } else {
                console.log(`Created user: ${user.email} (${user.role})`);
            }

        } catch (err) {
            console.error(`Unexpected error for ${user.email}:`, err);
        }
    }
}

seedUsers();
