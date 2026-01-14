-- 1. FIX LANDING IMAGES TABLE
drop table if exists landing_images cascade;

create table landing_images (
  id uuid primary key default uuid_generate_v4(),
  image_url text not null,
  order_index int default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table landing_images enable row level security;

-- Policies (Public Read, Admin Write)
drop policy if exists "Public Read Landing Images" on landing_images;
create policy "Public Read Landing Images"
  on landing_images for select
  using ( is_active = true );

drop policy if exists "Admin Manage Landing Images" on landing_images;
create policy "Admin Manage Landing Images"
  on landing_images for all
  using ( 
    auth.uid() in (
      select id from profiles where role in ('management', 'support')
    )
  );

-- Seed Data (Public Local Paths)
insert into landing_images (image_url, order_index) values 
('/carousel/1750271394343.jpeg', 1),
('/carousel/1762460232945.jpeg', 2),
('/carousel/1763128926053.jpeg', 3),
('/carousel/1764770398311.jpeg', 4),
('/carousel/1765913601518.jpeg', 5),
('/carousel/1765999788211.jpeg', 6),
('/carousel/1766162293992.jpeg', 7),
('/carousel/1767904758717.jpeg', 8),
('/carousel/1767904764703.jpeg', 9);


-- 2. FIX STORAGE BUCKET (LANDING & AVATARS)
insert into storage.buckets (id, name, public)
values ('landing_bucket', 'landing_bucket', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage Policies (Simplified for Public Read)
drop policy if exists "Public Read Landing Bucket" on storage.objects;
create policy "Public Read Landing Bucket"
  on storage.objects for select
  using ( bucket_id = 'landing_bucket' );

drop policy if exists "Admin Write Landing Bucket" on storage.objects;
create policy "Admin Write Landing Bucket"
  on storage.objects for insert
  with check ( 
    bucket_id = 'landing_bucket' 
    and auth.uid() in (select id from profiles where role in ('management', 'support'))
  );

-- Avatar Policies
create policy "Public Read Avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Auth Upload Avatars"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Auth Update Own Avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );
