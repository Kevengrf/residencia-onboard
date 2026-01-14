-- 1. Create Management Users table if not exists (handling the error source)
CREATE TABLE IF NOT EXISTS management_users (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Verify and fix the user 'gestao@residencia.com'
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'gestao@residencia.com';

    IF target_user_id IS NOT NULL THEN
        -- Update Profile Role
        UPDATE profiles 
        SET role = 'management'
        WHERE id = target_user_id;

        -- Remove from Students if exists (Cleanup)
        DELETE FROM students WHERE id = target_user_id;
        
        -- Insert into management_users
        INSERT INTO management_users (id) 
        VALUES (target_user_id)
        ON CONFLICT (id) DO NOTHING;

        RAISE NOTICE 'Fixed role and tables for gestao@residencia.com';
    ELSE
        RAISE NOTICE 'User gestao@residencia.com not found';
    END IF;
END $$;
