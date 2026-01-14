-- FIX USER TRIGGER SCRIPT
-- This script makes the handle_new_user trigger more robust against metadata errors
-- and ensures dependent tables (students) are populated.

-- 1. Drop existing trigger and function to start fresh
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. Recreate the function with better error handling
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  target_role user_role;
  raw_role text;
begin
  -- Extract role safely
  raw_role := new.raw_user_meta_data->>'role';

  -- Normalize/Validate Role
  if raw_role is null or raw_role = '' then
     target_role := 'student';
  elsif raw_role = 'company' then
     target_role := 'company';
  elsif raw_role = 'ies' then
     target_role := 'ies';
  elsif raw_role = 'management' then
     target_role := 'management';
  elsif raw_role = 'support' then
     target_role := 'support';
  else
     -- Fallback for invalid/unknown roles to 'student' to prevent crash
     -- Log notice for debugging
     raise warning 'Invalid role % received, defaulting to student', raw_role;
     target_role := 'student';
  end if;

  -- Insert into Profiles
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Novo Usuário'), target_role);

  -- Perform Role-Specific Setup
  if target_role = 'student' then
      -- Create empty student record
      insert into public.students (id, status)
      values (new.id, 'active');
  end if;

  -- (Optional) We could auto-create company records here too if we wanted, 
  -- but usually companies need more data. 
  
  return new;
exception
  when others then
    -- If anything fails, log it and allow the user creation to proceed 
    -- (so they can at least login, even if profile is missing - though that's bad UX, 
    -- it's better than a 500 error. The app should handle missing profile).
    raise warning 'Error in handle_new_user: %', SQLERRM;
    return new;
end;
$$ language plpgsql security definer;

-- 3. Reattach Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Verify RLS grants just in case
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
