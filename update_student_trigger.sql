-- Trigger to handle new user creation
-- Automatically creates profiles and students records based on metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role text;
  user_period int;
BEGIN
  -- Extract role from metadata (default to 'student')
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  -- Extract residency_period (default to 1)
  user_period := COALESCE((new.raw_user_meta_data->>'residency_period')::int, 1);

  -- 1. Create Profile
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    user_role
  );

  -- 2. If Student, create Student entry with period
  IF user_role = 'student' THEN
    INSERT INTO public.students (id, status, residency_period, main_role)
    VALUES (
      new.id,
      'active',
      user_period,
      'Residente'
    );
  END IF;

  RETURN new;
END;
$$;

-- Recreate the trigger (if needed, usually replacing function is enough)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
