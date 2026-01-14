-- Add Embarque Digital Scholarship flag to students
alter table public.students
add column if not exists is_embarque_holder boolean default false;
