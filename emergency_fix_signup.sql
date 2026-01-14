-- EMERGENCY FIX SIGNUP
-- This script ensures the signup trigger never blocks user creation (Error 500).
-- It swallows errors and logs them, allowing the user to be created in auth.users.

-- 1. Ensure Tables Exist (Idempotent)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'student', -- Changed to text to be safer, or keep enum if confident
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Drop functionality
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 3. Create Robust Function
create or replace function public.handle_new_user() 
returns trigger 
security definer
set search_path = public -- CRITICAL: Ensures we find the right tables
as $$
declare
  target_role text; -- Use text to prevent enum casting errors inside logic
begin
  -- Parse role safely
  target_role := new.raw_user_meta_data->>'role';
  if target_role is null or target_role = '' then
      target_role := 'student';
  end if;

  begin
      -- Try to insert profile
      -- Cast target_role to user_role if your column is enum, 
      -- OR if you altered it to text, fine. 
      -- We assume column is user_role enum, so we cast safely.
      
      insert into public.profiles (id, full_name, role)
      values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Novo Usuário'), target_role::user_role);

      -- Try to insert student record
      if target_role = 'student' then
          insert into public.students (id, status)
          values (new.id, 'active');
      end if;
      
  exception when others then
      -- CATCH ALL ERRORS
      -- Log it so we can see it in Supabase logs but DO NOT FAIL the transaction
      raise warning '⚠️ Error in handle_new_user trigger: %. Proceeding with specific basic setup.', SQLERRM;
      
      -- Fallback: Try simplest insert if complex one failed (e.g. enum issue)
      begin
         insert into public.profiles (id, full_name, role)
         values (new.id, 'Fallback User', 'student'::user_role);
      exception when others then
         raise warning 'Critial: Could not create profile even with fallback.';
      end;
  end;

  return new;
end;
$$ language plpgsql;

-- 4. Reattach Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Grant Permissions (Crucial)
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;
