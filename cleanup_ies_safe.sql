
-- Safe Merge and Cleanup Script

-- Helper block to perform reassignments
do $$
declare
    target_id uuid;
    bad_id uuid;
begin
    -- 1. Merge 'Faculdade Senac' -> 'Senac'
    select id into target_id from public.ies where name = 'Senac' limit 1;
    select id into bad_id from public.ies where name = 'Faculdade Senac' limit 1;
    
    if target_id is not null and bad_id is not null then
        -- Move users
        update public.profiles set ies_id = target_id where ies_id = bad_id;
        -- Now safe to delete
        delete from public.ies where id = bad_id;
    end if;

    -- 2. Merge 'UNICAP' (caps) -> 'Unicap'
    select id into target_id from public.ies where name = 'Unicap' limit 1;
    select id into bad_id from public.ies where name = 'UNICAP' limit 1;
    
    if target_id is not null and bad_id is not null then
        update public.profiles set ies_id = target_id where ies_id = bad_id;
        delete from public.ies where id = bad_id;
    end if;

    -- 3. Merge 'UNIT' (caps) -> 'Unit'
    select id into target_id from public.ies where name = 'Unit' limit 1;
    select id into bad_id from public.ies where name = 'UNIT' limit 1;
    
    if target_id is not null and bad_id is not null then
        update public.profiles set ies_id = target_id where ies_id = bad_id;
        delete from public.ies where id = bad_id;
    end if;

     -- 4. Merge 'Uninassau' -> 'Nassau'
    select id into target_id from public.ies where name = 'Nassau' limit 1;
    select id into bad_id from public.ies where name = 'Uninassau' limit 1;
    
    if target_id is not null and bad_id is not null then
        update public.profiles set ies_id = target_id where ies_id = bad_id;
        delete from public.ies where id = bad_id;
    end if;

end $$;

-- Verify Start Periods are correct for what remains
update public.ies set start_period = '2022.1' where name = 'Senac';
update public.ies set start_period = '2022.1' where name = 'Unicap';
update public.ies set start_period = '2022.1' where name = 'Unit';
update public.ies set start_period = '2022.2' where name = 'FICR';
update public.ies set start_period = '2023.1' where name = 'Nassau';
update public.ies set start_period = '2023.2' where name = 'CESAR School';
