-- FIX COMPANY RLS POLICIES
-- Ensure management users can view and update companies (especially pending ones)

-- 1. Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies to avoid conflicts
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;
DROP POLICY IF EXISTS "Companies are viewable by authenticated" ON public.companies;
DROP POLICY IF EXISTS "Management can update companies" ON public.companies;
DROP POLICY IF EXISTS "Management can view all companies" ON public.companies;

-- 3. Create Allow-All Select Policy for Management (View Pending)
CREATE POLICY "Management can view all companies"
ON public.companies FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('management', 'support', 'ies')
  OR
  status = 'approved'
  OR
  -- Users can view their own company (even pending)
  user_id = auth.uid()
);

-- 4. Allow Public to see Approved companies (for public pages)
CREATE POLICY "Public can view approved companies"
ON public.companies FOR SELECT
TO anon
USING (status = 'approved');

-- 5. Management can UPDATE companies (Approve/Reject)
CREATE POLICY "Management can update companies"
ON public.companies FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('management', 'support')
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('management', 'support')
);

-- 6. Allow Insertion (Signup trigger does this as postgres/service_role, so RLS doesn't block it usually, 
-- but if we do it from client side, we need this. For safety, trigger is SECURITY DEFINER so it bypasses RLS).
