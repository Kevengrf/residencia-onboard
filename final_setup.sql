-- SAFE SETUP SCRIPT
-- Run this to fix/ensure all tables and types exist without errors.

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TYPES (Safe Creation)
do $$ begin
    create type user_role as enum ('student', 'support', 'management', 'company', 'ies');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type student_status as enum ('active', 'graduated');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type company_status as enum ('pending', 'approved', 'rejected');
exception
    when duplicate_object then null;
end $$;

-- 3. TABLES (Create if not exists)
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  logo_url text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add 'status' column to companies if it doesn't exist
do $$ begin
    alter table companies add column status company_status default 'pending';
exception
    when duplicate_column then null;
end $$;

create table if not exists ies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  logo_url text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'student',
  full_name text,
  avatar_url text,
  company_id uuid references companies(id),
  ies_id uuid references ies(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists students (
  id uuid primary key references profiles(id) on delete cascade,
  residency_period int check (residency_period between 1 and 6),
  status student_status default 'active',
  bio text,
  contact_info jsonb,
  enrollment_date timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade not null,
  title text not null,
  description text,
  media_urls text[],
  link_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists videos (
  id uuid primary key default uuid_generate_v4(),
  uploader_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists notices (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references profiles(id) on delete set null,
  title text not null,
  content text not null,
  image_url text,
  target_audience user_role[], 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. RLS POLICIES (Drop first to avoid errors, then recreate)
alter table profiles enable row level security;
alter table companies enable row level security;
alter table ies enable row level security;
alter table students enable row level security;
alter table projects enable row level security;
alter table videos enable row level security;
alter table notices enable row level security;

-- Drop existing policies to ensure clean updates
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Companies are viewable by everyone" on companies;
drop policy if exists "Users can register new companies" on companies;
drop policy if exists "Management can update companies" on companies;
drop policy if exists "Students can insert own record" on students;
drop policy if exists "Students can update own record" on students;
drop policy if exists "Students are viewable by everyone" on students;
drop policy if exists "Anyone can view videos" on videos;
drop policy if exists "Anyone can view projects" on projects;
drop policy if exists "Anyone can view ies" on ies;

-- Recreate Policies
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update to authenticated using (auth.uid() = id);

create policy "Companies are viewable by everyone" on companies for select using (true);
create policy "Users can register new companies" on companies for insert to authenticated with check (true);
create policy "Management can update companies" on companies for update to authenticated using (
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'management')
  OR exists (select 1 from profiles where profiles.id = auth.uid() and profiles.company_id = companies.id)
);

create policy "Students can insert own record" on students for insert to authenticated with check (id = auth.uid());
create policy "Students can update own record" on students for update to authenticated using (id = auth.uid());
create policy "Students are viewable by everyone" on students for select using (true);

create policy "Anyone can view videos" on videos for select using (true);
create policy "Anyone can view projects" on projects for select using (true);
create policy "Anyone can view ies" on ies for select using (true);


-- 5. TRIGGER FIX
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function public.handle_new_user() 
returns trigger as $$
declare
  target_role user_role;
begin
  if (new.raw_user_meta_data->>'role') is null then
     target_role := 'student';
  else
     target_role := (new.raw_user_meta_data->>'role')::user_role;
  end if;

  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', target_role);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grants
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
