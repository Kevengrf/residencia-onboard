-- Create Management Users table for explicit Management Role handling
CREATE TABLE IF NOT EXISTS management_users (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE management_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Management users viewable by authenticated" ON management_users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only admins/management can insert" ON management_users FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('management', 'support'))
);

-- Ensure gestao@residencia.com is in it if not already
DO $$
DECLARE
    target_id UUID;
BEGIN
    SELECT id INTO target_id FROM auth.users WHERE email = 'gestao@residencia.com';
    
    IF target_id IS NOT NULL THEN
        INSERT INTO management_users (id) VALUES (target_id)
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
