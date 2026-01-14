
-- Enable RLS on IES table if not already
alter table public.ies enable row level security;

-- Allow everyone (authenticated) to read IES list
create policy "Authenticated users can read IES"
on public.ies for select
to authenticated
using (true);

-- Allow public to read IES list (for registration forms if needed)
create policy "Public can read IES"
on public.ies for select
to anon
using (true);
