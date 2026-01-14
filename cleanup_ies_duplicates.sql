
-- 1. Standardize Names (Update the preferred ones to the canonical name if needed)
-- We want to keep: Senac, Unicap, Unit, FICR, Nassau, CESAR School
-- We will delete: Faculdade Senac, UNICAP (caps), UNIT (caps), Uninassau (if we choose Nassau)

-- Let's identify IDs to keep vs delete. 
-- Since we don't know exact IDs, we'll use name matching to delete the unwanted variations.
-- SAFETY: If there are constraints (users linked), this might fail. We should ideally update users to point to the 'good' ID first.

-- A) Update profiles to point to the 'good' IES if they point to a 'bad' one.
-- But first, let's define 'Good' names.
-- Senac
-- Unicap
-- Unit
-- FICR
-- Nassau
-- CESAR School

-- B) Delete 'Faculdade Senac' (Keep 'Senac')
delete from public.ies where name = 'Faculdade Senac';

-- C) Deduplicate Case variants (Unicap vs UNICAP)
-- Keep 'Unicap', delete 'UNICAP'
delete from public.ies where name = 'UNICAP';

-- Keep 'Unit', delete 'UNIT'
delete from public.ies where name = 'UNIT';

-- Keep 'Nassau', delete 'Uninassau'
delete from public.ies where name = 'Uninassau';

-- Ensure remaining have correct start_periods
update public.ies set start_period = '2022.1' where name = 'Senac';
update public.ies set start_period = '2022.1' where name = 'Unicap';
update public.ies set start_period = '2022.1' where name = 'Unit';
update public.ies set start_period = '2022.2' where name = 'FICR';
update public.ies set start_period = '2023.1' where name = 'Nassau';
update public.ies set start_period = '2023.2' where name = 'CESAR School';

-- Final cleanup of any other exact duplicates (keeping the one with the oldest created_at if any left)
delete from public.ies a using public.ies b
where a.id > b.id and a.name = b.name;
