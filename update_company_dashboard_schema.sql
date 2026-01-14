
-- 1. Updates to Companies Table
alter table public.companies 
add column if not exists cover_image_url text;

-- 2. Updates to Jobs Table for detailed descriptions and targeting
alter table public.jobs 
add column if not exists contact_info text, -- e.g. "email@company.com" or instructions
add column if not exists target_courses text[], -- Filter by course (e.g. ['Engineering', 'Design'])
add column if not exists skills_required text[]; -- For matching with student skills

-- 3. Updates to Company Projects for Demo Day
alter table public.company_projects
add column if not exists is_demoday_winner boolean default false;

-- 4. RLS for Company Dashboard
-- Company Admins can update their own company profile
drop policy if exists "Company admins can update own company" on public.companies;
create policy "Company admins can update own company"
on public.companies for update
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'company'
        and profiles.company_id = companies.id
    )
);

-- Company Admins can CRUD their own jobs (already exists in update_jobs_schema.sql but reinforcing if needed or adding specific update/delete policies)
-- (The previous script `update_jobs_schema.sql` had "Companies can manage own jobs" for ALL operations, so that covers it).

-- Company Admins can read their own projects
create policy "Company admins can view own projects"
on public.company_projects for select
to authenticated
using (
    company_id in (
        select company_id from public.profiles 
        where profiles.id = auth.uid() 
        and profiles.role = 'company'
    )
);
