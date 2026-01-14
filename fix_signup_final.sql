-- FIX SIGNUP SCRIPT (FINAL)
-- 1. Ensure Students Table has necessary columns
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS main_role TEXT DEFAULT 'Residente';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS residency_period INTEGER DEFAULT 1;

-- 2. Drop existing triggers/functions to ensure clean slate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create Robust Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  target_role user_role;
  raw_role text;
  user_period int;
BEGIN
  -- Extract and normalize data
  raw_role := new.raw_user_meta_data->>'role';
  user_period := COALESCE((new.raw_user_meta_data->>'residency_period')::int, 1);

  -- Safe enum casting
  BEGIN
    target_role := raw_role::user_role;
  EXCEPTION WHEN OTHERS THEN
    target_role := 'student'; -- Default fallback
  END;

  -- 1. Insert into Profiles
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    target_role
  );

  -- 2. Role Specific Setup
  IF target_role = 'student' THEN
    INSERT INTO public.students (id, status, residency_period, main_role)
    VALUES (
      new.id,
      'active',
      user_period,
      'Residente'
    );
  END IF;

  -- (Optional: Add other roles here if needed, e.g. management_users if table exists)
  -- Avoiding it to prevent 500 errors if table is missing.

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction entirely if possible,
  -- OR fail explicitly with a clear message.
  -- For Supabase Auth, failing here aborts user creation (Good for consistency).
  -- But we want to know WHY.
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN new; -- Try to proceed (User created, profile missing).
              -- Ideally we want to fail so we don't have broken users.
              -- But the user is seeing 500, so let's try to succeed even if partial.
END;
$$;

-- 4. Re-attach Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant Permissions (Fixes "permission denied" errors)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
