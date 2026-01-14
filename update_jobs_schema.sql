-- Update Companies table to include public page configuration
-- and create Jobs tables

-- 1. Add public_page_config to companies
do $$ begin
    alter table companies add column public_page_config jsonb default '{}'::jsonb;
exception
    when duplicate_column then null;
end $$;

-- 2. Create Jobs table
create table if not exists jobs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  title text not null,
  description text not null,
  requirements text,
  salary_range text,
  benefits text,
  location text,
  type text default 'Full-time', -- Full-time, Internship, etc.
  status text default 'open', -- open, closed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Job Applications table (The Match System)
create table if not exists job_applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade not null,
  student_id uuid references students(id) on delete cascade not null,
  status text default 'applied', -- applied, viewed, rejected, contacted
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(job_id, student_id) -- Prevent double application
);

-- 4. RLS for Jobs
alter table jobs enable row level security;
alter table job_applications enable row level security;

-- Jobs Policies
create policy "Jobs are viewable by everyone" on jobs for select using (true);
create policy "Companies can manage own jobs" on jobs for all using (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.company_id = jobs.company_id)
);

-- Application Policies
create policy "Companies can view applications for their jobs" on job_applications for select using (
    exists (select 1 from jobs where jobs.id = job_applications.job_id and jobs.company_id = (select company_id from profiles where id = auth.uid()))
);
create policy "Students can create applications (Swipe Right)" on job_applications for insert with check (
    exists (select 1 from students where students.id = auth.uid()) 
    AND student_id = auth.uid()
);
create policy "Students can view own applications" on job_applications for select using (
    student_id = auth.uid()
);

-- 5. Grant permissions
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
