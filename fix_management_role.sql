-- 1. Identify the User ID for gestao@residencia.com
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'gestao@residencia.com';

    IF target_user_id IS NOT NULL THEN
        -- 2. Update Profile Role to 'management'
        UPDATE profiles 
        SET role = 'management'
        WHERE id = target_user_id;

        -- 3. Remove from Students table if exists
        DELETE FROM students WHERE id = target_user_id;

        -- 4. Remove from Companies/IES just in case
        DELETE FROM companies WHERE id = target_user_id;
        DELETE FROM ies WHERE id = target_user_id;

        -- 5. Ensure entry in management_users
        INSERT INTO management_users (id, created_at)
        VALUES (target_user_id, NOW())
        ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE 'Fixed role for gestao@residencia.com (ID: %)', target_user_id;
    ELSE
        RAISE NOTICE 'User gestao@residencia.com not found';
    END IF;
END $$;
