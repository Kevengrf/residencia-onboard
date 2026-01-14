-- UPDATE STUDENT SCHEMA
-- Add fields for extended profile (Skills, Social Links)

alter table public.students 
add column if not exists skills text[] default '{}',
add column if not exists linkedin_url text,
add column if not exists github_url text,
add column if not exists portfolio_url text;

-- Ensure RLS allows update (already done in main setup, but good to double check)
-- "Students can update own record" policy should cover these new columns automatically.
