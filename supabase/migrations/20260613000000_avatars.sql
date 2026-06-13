-- Аватар пользователя и связь постов с автором
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES admin_users(id);

-- Публичный бакет для аватаров
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
