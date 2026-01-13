-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enums
create type user_role as enum ('student', 'support', 'management', 'company', 'ies');
create type student_status as enum ('active', 'graduated');

-- Create Tables

-- Companies
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  logo_url text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- IES (Instituições de Ensino Superior)
create table ies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  logo_url text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles (Extends auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'student',
  full_name text,
  avatar_url text,
  company_id uuid references companies(id), -- For Company Admins
  ies_id uuid references ies(id), -- For IES Admins
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Students (Specific details for student role)
create table students (
  id uuid primary key references profiles(id) on delete cascade,
  residency_period int check (residency_period between 1 and 6),
  status student_status default 'active',
  bio text,
  contact_info jsonb, -- { "email": "...", "linkedin": "...", "phone": "..." }
  enrollment_date timestamp with time zone default timezone('utc'::text, now())
);

-- Projects
create table projects (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade not null,
  title text not null,
  description text,
  media_urls text[], -- Array of image/video URLs
  link_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Videos (TikTok style feed)
create table videos (
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

-- Likes on Videos
create table video_likes (
  video_id uuid references videos(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (video_id, user_id)
);

-- Comments on Videos
create table video_comments (
  id uuid primary key default uuid_generate_v4(),
  video_id uuid references videos(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notices / Cards (Avisos)
create table notices (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references profiles(id) on delete set null,
  title text not null,
  content text not null,
  image_url text,
  target_audience user_role[], -- Who can see this? null = public/all
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies (Basic Setup - To be refined)
alter table profiles enable row level security;
alter table companies enable row level security;
alter table ies enable row level security;
alter table students enable row level security;
alter table projects enable row level security;
alter table videos enable row level security;
alter table video_likes enable row level security;
alter table video_comments enable row level security;
alter table notices enable row level security;

-- Public read access for most tables
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Companies are viewable by everyone" on companies for select using (true);
create policy "IES are viewable by everyone" on ies for select using (true);
create policy "Videos are viewable by everyone" on videos for select using (true);
create policy "Projects are viewable by everyone" on projects for select using (true);
create policy "Notices are viewable by everyone" on notices for select using (true);

-- Insert Roles helper function
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'role')::user_role);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
