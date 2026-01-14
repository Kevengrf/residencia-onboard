-- RESIDENCY MANAGEMENT SCHEMA
-- Adds support for Periods, Company Projects, and Allocations.

-- 1. Residency Periods (Managed by Admin 2)
create table if not exists residency_periods (
  id uuid primary key default uuid_generate_v4(),
  name text not null, -- e.g. "2024.1"
  start_date date not null,
  end_date date not null,
  status text default 'planning' check (status in ('planning', 'active', 'finished')),
  created_at timestamp with time zone default now()
);

-- 2. Project Types Enum
do $$ begin
    create type project_type as enum ('kickoff', 'riseup', 'growup', 'takeoff', 'levelup', 'custom');
exception
    when duplicate_object then null;
end $$;

-- 3. Company Projects (Created by Companies for a Period)
create table if not exists company_projects (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  period_id uuid references residency_periods(id) on delete cascade,
  title text not null,
  description text,
  type project_type not null default 'custom',
  requirements text[],
  max_students int default 5,
  created_at timestamp with time zone default now()
);

-- 4. Allocations (Which Project a Student is Doing)
create table if not exists project_allocations (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  project_id uuid references company_projects(id) on delete cascade,
  status text default 'active' check (status in ('active', 'completed', 'dropped')),
  feedback text,
  grade numeric,
  created_at timestamp with time zone default now(),
  unique(student_id, project_id)
);

-- 5. Helper: Add 'semester' to students if not exists
alter table students add column if not exists semester int default 1; 

-- 6. RLS Policies
alter table residency_periods enable row level security;
alter table company_projects enable row level security;
alter table project_allocations enable row level security;

-- (Simplified Policies for MVP)
create policy "Periods viewable by everyone" on residency_periods for select using (true);
create policy "Projects viewable by everyone" on company_projects for select using (true);
create policy "Allocations viewable by involved" on project_allocations for select using (
    auth.uid() = student_id 
    OR exists (select 1 from company_projects cp where cp.id = project_id and cp.company_id = (select company_id from profiles where id = auth.uid()))
);

-- 7. SEED DATA (For immediate testing)
-- Ensure Porto Digital exists or create it
insert into companies (name, description, status)
values ('Porto Digital', 'Parque Tecnológico (Gestor da Residência)', 'approved')
on conflict do nothing;

-- Create a Dummy Period
insert into residency_periods (name, start_date, end_date, status)
values ('2024.1', '2024-01-01', '2024-06-30', 'active');

-- Create a Kickoff Project linked to Porto Digital (Dynamically finding ID)
with pd as (select id from companies where name = 'Porto Digital' limit 1),
     per as (select id from residency_periods where name = '2024.1' limit 1)
insert into company_projects (company_id, period_id, title, description, type, max_students)
select pd.id, per.id, 'Residência Kick-off 2024', 'Projeto inicial de imersão no ecossistema.', 'kickoff', 100
from pd, per;
