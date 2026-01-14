-- Ensure extension exists
create extension if not exists "uuid-ossp";

-- 1. Drop the existing trigger and function to start fresh
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. Create a more robust handler function
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  target_role user_role;
begin
  -- Attempt to cast the role from metadata. 
  
  if (new.raw_user_meta_data->>'role') is null then
     target_role := 'student';
  else
     target_role := (new.raw_user_meta_data->>'role')::user_role;
  end if;

  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    target_role
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- 3. Re-attach the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Grant permissions just in case
grant usage on schema public to service_role;
grant all on public.profiles to service_role;
grant all on all tables in schema public to service_role;
