-- Add Shift (Turno) to students table
alter table public.students
add column if not exists shift text; -- 'Manhã', 'Tarde', 'Noite'
