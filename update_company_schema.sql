
-- Create Company Status Enum
create type company_status as enum ('pending', 'approved', 'rejected');

-- Alter companies table
alter table companies 
add column if not exists status company_status default 'pending';

-- RLS for Company Registration
-- Allow authenticated users to insert into companies (for registration)
create policy "Users can register new companies" 
on companies for insert 
to authenticated 
with check (true);

-- Allow Management (Admin 2) to update company status
create policy "Management can update companies" 
on companies for update 
to authenticated 
using (
  exists (
    select 1 from profiles 
    where profiles.id = auth.uid() 
    and profiles.role = 'management'
  )
);
