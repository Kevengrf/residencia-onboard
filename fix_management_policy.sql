
    -- Fix RLS Policies for Management Dashboard

    -- 1. Residency Periods: Allow Management to ALL (Insert, Update, Delete)
    drop policy if exists "Management can manage periods" on public.residency_periods;
    
    create policy "Management can manage periods"
    on public.residency_periods
    for all
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'management'
        )
    );

    -- 2. Company Projects: Allow Management to ALL
    -- (We might have added this in update_history_schema, but let's reinforce/ensure it covers INSERT)
    drop policy if exists "Management can insert/update projects" on public.company_projects;
    drop policy if exists "Management can manage projects" on public.company_projects;

    create policy "Management can manage projects"
    on public.company_projects
    for all
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'management'
        )
    );

    -- 3. Project Allocations: Allow Management to ALL
    drop policy if exists "Management can manage allocations" on public.project_allocations;

    create policy "Management can manage allocations"
    on public.project_allocations
    for all
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'management'
        )
    );

    -- 4. ENSURE Profiles are readable by self (Critical for the role check above)
    drop policy if exists "Users can read own profile" on public.profiles;

    create policy "Users can read own profile"
    on public.profiles
    for select
    to authenticated
    using ( auth.uid() = id );

