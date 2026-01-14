-- FIX SIGNUP SCRIPT (COMPANY & IES)
-- 1. Ensure Companies table has 'status' column
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id); -- Optional linkage if needed

-- 2. Ensure IES table has 'status' just in case
ALTER TABLE public.ies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- 3. Update the Trigger Function
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

  -- 1. Create Initial Profile (we will update company_id/ies_id later)
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, user_name, target_role);

  -- 2. Handle Specific Roles
  IF target_role = 'student' THEN
    INSERT INTO public.students (id, status, residency_period, main_role)
    VALUES (new.id, 'active', user_period, 'Residente');

  ELSIF target_role = 'company' THEN
    -- Create Company Record (Pending)
    INSERT INTO public.companies (name, status, description)
    VALUES (user_name, 'pending', 'Cadastro pendente de aprovação.')
    RETURNING id INTO new_company_id;

    -- Link Profile to Company
    UPDATE public.profiles 
    SET company_id = new_company_id 
    WHERE id = new.id;

  ELSIF target_role = 'ies' THEN
    -- Create IES Record (Active by default or pending? Let's say pending/active)
    INSERT INTO public.ies (name, status)
    VALUES (user_name, 'active') -- Usually IES are pre-approved or created differently, but for signup consistency
    RETURNING id INTO new_ies_id;

    -- Link Profile to IES
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
