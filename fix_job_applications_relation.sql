-- Explicitly fix relationships for job_applications
-- This handles cases where the table existed but without proper FKs

-- 1. Ensure student_id FK exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_student_id_fkey'
    ) THEN
        ALTER TABLE job_applications 
        ADD CONSTRAINT job_applications_student_id_fkey 
        FOREIGN KEY (student_id) 
        REFERENCES students(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Ensure job_id FK exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_job_id_fkey'
    ) THEN
        ALTER TABLE job_applications 
        ADD CONSTRAINT job_applications_job_id_fkey 
        FOREIGN KEY (job_id) 
        REFERENCES jobs(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Notify PostgREST to reload schema (by making a schema change)
NOTIFY pgrst, 'reload config';

-- 4. Double check RLS policies just in case
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Companies/Management can view all applications" ON job_applications;
CREATE POLICY "Companies/Management can view all applications" 
ON job_applications 
FOR SELECT 
USING (
    exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role in ('company', 'management', 'ies'))
);

DROP POLICY IF EXISTS "Students can create applications (Swipe Right)" ON job_applications;
CREATE POLICY "Students can create applications (Swipe Right)" 
ON job_applications 
FOR INSERT 
WITH CHECK (
    auth.uid() = student_id
);

DROP POLICY IF EXISTS "Students can view own applications" ON job_applications;
CREATE POLICY "Students can view own applications" 
ON job_applications 
FOR SELECT 
USING (
    auth.uid() = student_id
);
