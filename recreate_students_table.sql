-- DATA INTEGRITY FIX: Recreate Students Table
-- This script will ensure the table has the correct columns and data.

-- 1. Drop existing table (and its dependencies if any)
DROP TABLE IF EXISTS public.students CASCADE;

-- 2. Create the table correctly
CREATE TABLE public.students (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'active',
    residency_period INTEGER DEFAULT 1,
    main_role TEXT DEFAULT 'Residente',
    
    -- Optional fields matching your DTO/Types
    bio TEXT,
    skills TEXT[]
);

-- 3. Enable Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Allow PUBLIC read access (so they appear on the website)
CREATE POLICY "Public students are viewable by everyone"
ON public.students FOR SELECT
TO public
USING (true);

-- Allow admins/service role to do everything
CREATE POLICY "Admins can do everything"
ON public.students FOR ALL
USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('management', 'support', 'ies')))
WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('management', 'support', 'ies')));

-- 5. BACKFILL DATA (The important part)
-- Insert a row for every profile that is a 'student'
INSERT INTO public.students (id, created_at, status, residency_period, main_role)
SELECT 
    id, 
    created_at, 
    'active', 
    1, 
    'Residente'
FROM 
    public.profiles 
WHERE 
    role = 'student';

-- 6. Report success
SELECT count(*) as total_students_created FROM public.students;
