
-- Table for IES Public Cards/Posts
create table if not exists public.ies_cards (
    id uuid default gen_random_uuid() primary key,
    ies_id uuid references public.ies(id) not null,
    title text not null,
    content text, -- Description or body
    image_url text, -- Optional image
    type text check (type in ('highlight', 'news', 'achievement')), -- e.g., "Ganhou Hackathon"
    is_featured_on_home boolean default false, -- Admin 2 control
    created_at timestamp with time zone default now()
);

-- RLS for ies_cards
alter table public.ies_cards enable row level security;

-- IES can CRUD their own cards
-- IES can CRUD their own cards
drop policy if exists "IES can manage own cards" on public.ies_cards;
create policy "IES can manage own cards"
on public.ies_cards
for all
to authenticated
using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'ies'
    and profiles.ies_id = ies_cards.ies_id
));

-- Public can read cards
drop policy if exists "Public can read cards" on public.ies_cards;
create policy "Public can read cards"
on public.ies_cards for select
to anon, authenticated
using (true);

-- Admin 2 (Management) can update is_featured_on_home
drop policy if exists "Management can update cards" on public.ies_cards;
create policy "Management can update cards"
on public.ies_cards for update
to authenticated
using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'management'
));
