-- Check counts to diagnose why Talents page is empty

SELECT 'profiles_student_count' as metric, count(*) as value FROM profiles WHERE role = 'student';
SELECT 'total_students_table_count' as metric, count(*) as value FROM students;

-- show sample profile if exists
SELECT * FROM profiles WHERE role = 'student' LIMIT 1;
