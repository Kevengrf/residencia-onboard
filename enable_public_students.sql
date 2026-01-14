-- Enable RLS on tables if not already enabled
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Policy for PROFILES: Allow PUBLIC read access
-- Needed so everyone can see names and photos
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO public
USING (true);

-- 2. Policy for STUDENTS: Allow PUBLIC read access
-- Needed so the Talents page can list students
DROP POLICY IF EXISTS "Students are viewable by everyone" ON public.students;
CREATE POLICY "Students are viewable by everyone"
ON public.students FOR SELECT
TO public
USING (true);

-- 3. Verify data exists (Optional: for your own check in SQL Editor)
-- SELECT count(*) FROM students;
-- SELECT count(*) FROM profiles;
