-- RESIDENCY MANAGEMENT STRUCTURE
-- 1. Residency Periods (e.g., 2024.1, 2024.2)
CREATE TABLE IF NOT EXISTS public.residency_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- "2024.1"
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure is_active column exists (in case table already existed without it)
ALTER TABLE public.residency_periods ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- 2. Residency Allocations (Link: Period <-> Company <-> IES)
-- "Empresa A trabalha com IES X no período 2024.1"
CREATE TABLE IF NOT EXISTS public.residency_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    residency_period_id UUID REFERENCES public.residency_periods(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    ies_id UUID REFERENCES public.ies(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevent duplicate allocations
    UNIQUE(residency_period_id, company_id, ies_id)
);

-- 3. RLS Policies
ALTER TABLE public.residency_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residency_allocations ENABLE ROW LEVEL SECURITY;

-- Public Read (Everyone needs to see periods/allocations for context)
DROP POLICY IF EXISTS "Public can view periods" ON public.residency_periods;
CREATE POLICY "Public can view periods" ON public.residency_periods FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public can view allocations" ON public.residency_allocations;
CREATE POLICY "Public can view allocations" ON public.residency_allocations FOR SELECT TO public USING (true);

-- Management Write Access
-- Users with role 'management' can create/edit/delete
DROP POLICY IF EXISTS "Management can manage periods" ON public.residency_periods;
CREATE POLICY "Management can manage periods" 
ON public.residency_periods 
FOR ALL 
USING (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'management')
);

DROP POLICY IF EXISTS "Management can manage allocations" ON public.residency_allocations;
CREATE POLICY "Management can manage allocations" 
ON public.residency_allocations 
FOR ALL 
USING (
    exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'management')
);

-- Seed Initial Periods if empty
INSERT INTO public.residency_periods (name, is_active, start_date, end_date)
SELECT '2024.1', false, '2024-02-01', '2024-06-30'
WHERE NOT EXISTS (SELECT 1 FROM public.residency_periods WHERE name = '2024.1');

INSERT INTO public.residency_periods (name, is_active, start_date, end_date)
SELECT '2024.2', true, '2024-08-01', '2024-12-15'
WHERE NOT EXISTS (SELECT 1 FROM public.residency_periods WHERE name = '2024.2');

INSERT INTO public.residency_periods (name, is_active, start_date, end_date)
SELECT '2025.1', false, '2025-02-01', '2025-06-30'
WHERE NOT EXISTS (SELECT 1 FROM public.residency_periods WHERE name = '2025.1');
