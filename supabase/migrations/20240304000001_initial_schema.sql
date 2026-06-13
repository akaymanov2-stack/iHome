-- Удаление существующих таблиц и зависимостей
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS categories;

-- Создание таблицы категорий
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Создание таблицы постов блога
CREATE TABLE blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    image_url TEXT,
    category_id UUID REFERENCES categories(id),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Создание таблицы комментариев
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Создание индекса для полнотекстового поиска
ALTER TABLE blog_posts ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (to_tsvector('russian', title || ' ' || content)) STORED;

CREATE INDEX blog_posts_search_idx ON blog_posts USING GIN (search_vector);

-- Создание индексов для оптимизации запросов
CREATE INDEX blog_posts_category_id_idx ON blog_posts(category_id);
CREATE INDEX blog_posts_created_at_idx ON blog_posts(created_at DESC);
CREATE INDEX comments_post_id_idx ON comments(post_id);
CREATE INDEX comments_created_at_idx ON comments(created_at DESC);

-- Создание триггера для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Добавление тестовых данных
INSERT INTO categories (name, slug) VALUES
    ('Интерьер', 'interior'),
    ('Ремонт', 'repair'),
    ('Дизайн', 'design'),
    ('Советы', 'tips');

-- Добавление тестового поста
INSERT INTO blog_posts (title, content, author, image_url, category_id, tags)
SELECT 
    'Тестовый пост',
    'Это тестовый пост для проверки функциональности блога.',
    'Администратор',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace',
    id,
    ARRAY['тест', 'проверка']
FROM categories WHERE slug = 'interior';

SELECT * FROM categories;

SELECT * FROM blog_posts; 