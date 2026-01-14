-- APPROVE KEVEN WILLIAM
-- This script manually sets the status to 'active' for the specific student
-- so they reappear on the Talents page.

UPDATE public.students
SET status = 'active'
FROM public.profiles
WHERE students.id = profiles.id
AND profiles.full_name ILIKE '%Keven William%';

-- Optional: Approve all pending students for testing convenience
-- UPDATE public.students SET status = 'active' WHERE status = 'pending';
