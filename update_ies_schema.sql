
-- Add start_period column if not exists
alter table public.ies 
add column if not exists start_period text default '2022.1';

-- Clean up duplicates (Keep the ones that were likely created first or have better names)
-- Strategy: Delete newer duplicates if names are similar. 
-- In the previous check, we saw IDs. Let's just standardise on the "best" names.

-- Remove duplicates carefully (optional, but good for hygiene)
-- For now, let's just update based on Name patterns.

-- Update Senac, Unicap, Unit (Originals)
update public.ies set start_period = '2022.1' where name ilike '%Senac%';
update public.ies set start_period = '2022.1' where name ilike '%Unicap%';
update public.ies set start_period = '2022.1' where name ilike '%Unit%';

-- Update FICR
update public.ies set start_period = '2022.2' where name ilike '%FICR%';

-- Update Nassau
update public.ies set start_period = '2023.1' where name ilike '%Nassau%' or name ilike '%Uninassau%';

-- Update CESAR
update public.ies set start_period = '2023.2' where name ilike '%CESAR%';

-- Remove simple duplicates (exact name matches, keeping oldest)
delete from public.ies a using public.ies b
where a.id > b.id and a.name = b.name;

-- Ensure RLS allows reading (just in case)
alter table public.ies enable row level security;
drop policy if exists "Authenticated users can read IES" on public.ies;
create policy "Authenticated users can read IES" on public.ies for select to authenticated using (true);
