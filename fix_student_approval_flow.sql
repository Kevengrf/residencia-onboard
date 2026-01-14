-- FIX APPROVAL FLOW (STUDENTS)
-- 1. Add 'pending' to student_status enum
-- Postgres doesn't support IF NOT EXISTS for enum values directly in standard SQL widely used in scripts without blocks.
-- But we can wrap it.
DO $$
BEGIN
    ALTER TYPE student_status ADD VALUE 'pending';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Student Trigger to default to 'pending'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  target_role user_role;
  raw_role text;
  user_period int;
  user_name text;
  new_company_id uuid;
  new_ies_id uuid;
BEGIN
  -- Extract Data
  raw_role := new.raw_user_meta_data->>'role';
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário');
  user_period := COALESCE((new.raw_user_meta_data->>'residency_period')::int, 1);

  -- Safe Role Cast
  BEGIN
    target_role := raw_role::user_role;
  EXCEPTION WHEN OTHERS THEN
    target_role := 'student';
  END;

  -- 1. Create Initial Profile
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, user_name, target_role);

  -- 2. Handle Specific Roles
  IF target_role = 'student' THEN
    -- NOW DEFAULTING TO 'pending'
    INSERT INTO public.students (id, status, residency_period, main_role)
    VALUES (new.id, 'pending', user_period, 'Residente');

  ELSIF target_role = 'company' THEN
    INSERT INTO public.companies (name, status, description)
    VALUES (user_name, 'pending', 'Cadastro pendente de aprovação.')
    RETURNING id INTO new_company_id;

    UPDATE public.profiles 
    SET company_id = new_company_id 
    WHERE id = new.id;

  ELSIF target_role = 'ies' THEN
    INSERT INTO public.ies (name, status)
    VALUES (user_name, 'active')
    RETURNING id INTO new_ies_id;

    UPDATE public.profiles 
    SET ies_id = new_ies_id 
    WHERE id = new.id;
  END IF;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$;
