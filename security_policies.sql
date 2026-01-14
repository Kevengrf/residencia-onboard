
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table companies enable row level security;
alter table ies enable row level security;
alter table projects enable row level security;
alter table videos enable row level security;

-- PROFILES
-- View: Public
create policy "Public profiles are viewable by everyone" 
on profiles for select using (true);
-- Update: Users can update their own profile
create policy "Users can update own profile" 
on profiles for update 
to authenticated 
using (auth.uid() = id);

-- COMPANIES
-- View: Public
create policy "Companies are viewable by everyone" 
on companies for select using (true);
-- Insert: Authenticated users (for registration)
create policy "Users can register new companies" 
on companies for insert 
to authenticated 
with check (true);
-- Update: Management (Admin 2) and the Company Admin (owner)
create policy "Management can update companies" 
on companies for update 
to authenticated 
using (
  -- User is management
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'management')
  OR
  -- User is the company admin (need to link profile->company_id, checking reverse is harder without backlink)
  -- Typically we check if the company being updated matches the user's company_id
  exists (select 1 from profiles where profiles.id = auth.uid() and profiles.company_id = companies.id)
);

-- STUDENTS
create policy "Students can insert own record"
on students for insert
to authenticated
with check (id = auth.uid());

create policy "Students can update own record"
on students for update
to authenticated
using (id = auth.uid());

create policy "Students are viewable by everyone"
on students for select using (true);

-- VIDEOS
create policy "Anyone can view videos"
on videos for select using (true);

-- TODO: Add more specific policies as we build features
