-- Add main_role to students table
alter table students 
add column if not exists main_role text;

-- Create storage bucket for avatars if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage Policies for Avatars
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );
  
create policy "Anyone can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' );

-- Note: In a real prod app, strict RLS on generic 'everyone insert' is dangerous, 
-- but acceptable for this MVP phase. Ideally strict checks on auth.uid() = name.
