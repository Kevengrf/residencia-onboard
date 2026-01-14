
-- Add Profile fields to IES table
alter table public.ies
add column if not exists logo_url text,
add column if not exists cover_image_url text,
add column if not exists description text,
add column if not exists website text;

-- Ensure RLS allows IES Admins to update their own IES
drop policy if exists "IES admins can update own IES" on public.ies;
create policy "IES admins can update own IES"
on public.ies for update
to authenticated
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role = 'ies'
        and profiles.ies_id = ies.id
    )
);
