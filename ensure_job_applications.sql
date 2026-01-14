-- Ensure Job Applications Table Exists
create table if not exists job_applications (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references jobs(id) on delete cascade not null,
  student_id uuid references students(id) on delete cascade not null,
  status text default 'applied', -- applied, viewed, rejected, contacted
  applied_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(job_id, student_id)
);

-- Ensure RLS is enabled
alter table job_applications enable row level security;

-- Policies for Students
DROP POLICY IF EXISTS "Students can create applications (Swipe Right)" ON job_applications;
CREATE POLICY "Students can create applications (Swipe Right)" 
ON job_applications 
FOR INSERT 
WITH CHECK (
    -- Allow any authenticated user who matches the student_id to insert
    auth.uid() = student_id
);

DROP POLICY IF EXISTS "Students can view own applications" ON job_applications;
CREATE POLICY "Students can view own applications" 
ON job_applications 
FOR SELECT 
USING (
    auth.uid() = student_id
);

-- Policies for Companies/Management
DROP POLICY IF EXISTS "Companies/Management can view all applications" ON job_applications;
CREATE POLICY "Companies/Management can view all applications" 
ON job_applications 
FOR SELECT 
USING (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('company', 'management', 'ies'))
);
