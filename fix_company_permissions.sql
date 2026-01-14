
-- Fix Profile Access
-- Allow users to read their own profile (essential for permission checks)
drop policy if exists "Users can see own profile" on public.profiles;
create policy "Users can see own profile"
on public.profiles for select
to authenticated
using ( id = auth.uid() );

-- Fix Company RLS (if not clearly defined)
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

-- Fix Jobs RLS
-- Split into explicit actions for clarity and correctness

-- 1. VIEW: Everyone can view open jobs (or all jobs if company owner)
drop policy if exists "Jobs are viewable by everyone" on public.jobs;
drop policy if exists "Companies can manage own jobs" on public.jobs;

create policy "Public can view jobs"
on public.jobs for select
using (true);

-- 2. INSERT: Company Owner can insert job for THEIR company
create policy "Companies can insert own jobs"
on public.jobs for insert
to authenticated
with check (
    -- The company_id of the NEW job must match the user's company_id
    company_id in (
        select company_id from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'company'
    )
);

-- 3. UPDATE: Company Owner can update their own jobs
create policy "Companies can update own jobs"
on public.jobs for update
to authenticated
using (
    company_id in (
        select company_id from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'company'
    )
)
with check (
    company_id in (
        select company_id from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'company'
    )
);

-- 4. DELETE: Company Owner can delete their own jobs
create policy "Companies can delete own jobs"
on public.jobs for delete
to authenticated
using (
    company_id in (
        select company_id from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'company'
    )
);

-- Ensure RLS is enabled
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.companies enable row level security;
