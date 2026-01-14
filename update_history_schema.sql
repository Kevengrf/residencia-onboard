-- UPDATE HISTORY SCHEMA
-- enable support for Classes (Turmas) and rich media in projects

-- 1. Updates to Students Table (Academic Info)
alter table public.students
add column if not exists entry_period text, -- e.g. '2022.1'
add column if not exists class_name text; -- e.g. 'Turma 02'

-- 2. Updates to Company Projects (Rich Media for Historic Projects)
alter table public.company_projects
add column if not exists pdf_url text,    -- For reports/docs
add column if not exists video_url text;  -- For pitch videos

-- 3. Policy Update (Ensure managers can update projects)
create policy "Management can insert/update projects" on company_projects
for all to authenticated using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'management')
);

create policy "Management can manage allocations" on project_allocations
for all to authenticated using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'management')
);
