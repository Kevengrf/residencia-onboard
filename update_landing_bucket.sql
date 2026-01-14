-- Create storage bucket for landing page images
insert into storage.buckets (id, name, public)
values ('landing_bucket', 'landing_bucket', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Landing images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'landing_bucket' );

create policy "Management can upload landing images"
  on storage.objects for insert
  with check ( 
    bucket_id = 'landing_bucket' 
    and auth.uid() in (
      select id from profiles where role in ('management', 'support')
    )
  );

create policy "Management can update landing images"
  on storage.objects for update
  using ( 
    bucket_id = 'landing_bucket' 
    and auth.uid() in (
      select id from profiles where role in ('management', 'support')
    )
  );

create policy "Management can delete landing images"
  on storage.objects for delete
  using ( 
    bucket_id = 'landing_bucket' 
    and auth.uid() in (
      select id from profiles where role in ('management', 'support')
    )
  );
