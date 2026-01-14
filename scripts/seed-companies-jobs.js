
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

const companies = [
    {
        name: 'Moura',
        description: 'Líder em acumuladores elétricos na América do Sul, a Moura está impulsionando o futuro da energia e mobilidade.',
        website: 'https://www.moura.com.br',
        jobs: [
            { title: 'Desenvolvedor Full Stack Júnior', type: 'Full-time', location: 'Recife/Híbrido', salary_range: 'R$ 3.500 - R$ 5.000' },
            { title: 'Estágio em Ciência de Dados', type: 'Internship', location: 'Belo Jardim', salary_range: 'R$ 1.500' }
        ]
    },
    {
        name: 'Accenture',
        description: 'Uma empresa global de consultoria de gestão, serviços de tecnologia e outsourcing. Transformando negócios na era digital.',
        website: 'https://www.accenture.com',
        jobs: [
            { title: 'Analista de QA', type: 'Full-time', location: 'Remoto', salary_range: 'R$ 4.000 - R$ 6.000' },
            { title: 'Trainee Java', type: 'Trainee', location: 'Recife', salary_range: 'R$ 2.500' },
            { title: 'Tech Lead React', type: 'Full-time', location: 'Recife', salary_range: 'R$ 12.000+' }
        ]
    },
    {
        name: 'Avanade',
        description: 'A vanguarda da inovação digital no ecossistema Microsoft. Criamos soluções que fazem a diferença para clientes em todo o mundo.',
        website: 'https://www.avanade.com',
        jobs: [
            { title: 'Desenvolvedor .NET Pleno', type: 'Full-time', location: 'Recife', salary_range: 'R$ 7.000' }
        ]
    }
];

async function seed() {
    console.log('🌱 Seeding Companies and Jobs...');

    for (const company of companies) {
        // 1. Create Company
        const { data: createdCompany, error: companyError } = await supabase
            .from('companies')
            .insert({
                name: company.name,
                description: company.description,
                website: company.website,
                status: 'approved', // Auto-approve for demo
                public_page_config: { theme: 'light' }
            })
            .select()
            .single();

        if (companyError) {
            console.error(`Error creating company ${company.name}:`, companyError.message);
            continue;
        }

        console.log(`✅ Company Created: ${company.name}`);

        // 2. Create Profile (Admin) for the company (Optional but good for completeness)
        // We'll skip creating a user profile linked to it for now to keep it simple, 
        // strictly focusing on the public page content.

        // 3. Create Jobs
        if (company.jobs && company.jobs.length > 0) {
            const jobsToInsert = company.jobs.map(job => ({
                company_id: createdCompany.id,
                title: job.title,
                description: `Estamos buscando um ${job.title} para integrar nosso time inovador.`,
                requirements: '- Conhecimento em tecnologia\n- Vontade de aprender',
                type: job.type,
                location: job.location,
                salary_range: job.salary_range,
                status: 'open'
            }));

            const { error: jobsError } = await supabase
                .from('jobs')
                .insert(jobsToInsert);

            if (jobsError) {
                console.error(`  Error creating jobs for ${company.name}:`, jobsError.message);
            } else {
                console.log(`  ✅ ${company.jobs.length} jobs posted for ${company.name}`);
            }
        }
    }

    console.log('✨ Seeding complete!');
}

seed();
