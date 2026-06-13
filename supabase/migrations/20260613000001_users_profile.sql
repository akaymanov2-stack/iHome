-- Переименование admin_users в users и расширение профиля для личного кабинета
ALTER TABLE admin_users RENAME TO users;

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('reader', 'author'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_user_id UUID;

GRANT ALL ON users TO anon, authenticated, service_role;
