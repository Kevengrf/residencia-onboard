
-- Schema updates for Historic Projects Support

-- 1. Modify company_projects to allow historic data
alter table public.company_projects
add column if not exists historic_company_name text, -- For companies not in the system
add column if not exists class_name text; -- Optional: Contextualize which class did this

-- Ensure company_id is nullable (it usually is for FKs unless specified NOT NULL, but let's be safe)
alter table public.company_projects alter column company_id drop not null;

-- 2. Constraint: Either company_id OR historic_company_name must be present
-- (Optional but good for data integrity)
alter table public.company_projects
drop constraint if exists check_company_presence;

alter table public.company_projects
add constraint check_company_presence
check (company_id is not null or historic_company_name is not null);

-- 3. Policy: Admin 2 can insert projects with null company_id
-- (Existing policy "Management can insert/update projects" usually allows this if RLS checks role)
-- Let's re-verify the policy in update_history_schema.sql, it checked for 'management' role.
-- We just need to ensure the insert doesn't fail due to RLS.

-- 4. Add helper index for searching projects by period or class
create index if not exists idx_company_projects_period on company_projects(period_id);
