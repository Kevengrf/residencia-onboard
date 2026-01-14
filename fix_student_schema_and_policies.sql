-- 1. Add missing columns to 'students' table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS entry_period TEXT,
ADD COLUMN IF NOT EXISTS class_name TEXT,
ADD COLUMN IF NOT EXISTS is_embarque_holder BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS shift TEXT;

-- 2. Add RLS Policy for Students to update their own data
DROP POLICY IF EXISTS "Users can update their own student data" ON public.students;
CREATE POLICY "Users can update their own student data"
ON public.students
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Add RLS Policy for Profiles to update their own data (Name, etc.)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Grant permissions just in case (though Policy usually handles row access, Grant handles table access)
GRANT ALL ON TABLE public.students TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;
