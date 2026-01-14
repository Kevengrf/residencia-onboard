-- Backfill students table (Corrected)
-- Inserts a record for any profile with role='student' that doesn't exist in the students table yet.
-- Removed created_at/updated_at as they seem to not exist or handle defaults automatically.

INSERT INTO public.students (id, status, residency_period, main_role)
SELECT 
    id, 
    'active', 
    1, 
    'Residente'
FROM 
    public.profiles 
WHERE 
    role = 'student' 
    AND id NOT IN (SELECT id FROM public.students);

-- Verify the count
-- SELECT count(*) FROM students;
