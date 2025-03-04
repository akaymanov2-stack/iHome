-- Добавление тестовых категорий
INSERT INTO categories (name, slug) VALUES
    ('Интерьер', 'interior'),
    ('Ремонт', 'repair'),
    ('Дизайн', 'design'),
    ('Советы', 'tips');

-- Добавление тестовых постов
INSERT INTO blog_posts (title, content, author, image_url, category_id, tags) 
SELECT 
    'Как создать уютный интерьер в стиле минимализм',
    'Минимализм – это не только стиль, но и философия жизни. В этой статье мы расскажем, как создать уютный и функциональный интерьер в стиле минимализм, сохраняя при этом комфорт и практичность...',
    'Анна Петрова',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace',
    id,
    ARRAY['минимализм', 'интерьер', 'дизайн']
FROM categories WHERE slug = 'interior';

INSERT INTO blog_posts (title, content, author, image_url, category_id, tags)
SELECT 
    'Ремонт квартиры: с чего начать',
    'Планирование ремонта – важный этап, от которого зависит успех всего проекта. Мы расскажем о ключевых шагах, которые помогут вам правильно организовать процесс ремонта...',
    'Иван Смирнов',
    'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e',
    id,
    ARRAY['ремонт', 'планирование', 'советы']
FROM categories WHERE slug = 'repair';

INSERT INTO blog_posts (title, content, author, image_url, category_id, tags)
SELECT 
    'Тренды в дизайне интерьера 2024',
    'Каждый год приносит новые тренды в дизайне интерьера. В 2024 году на первый план выходят экологичность, многофункциональность и персонализация пространства...',
    'Мария Иванова',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace',
    id,
    ARRAY['тренды', 'дизайн', '2024']
FROM categories WHERE slug = 'design';

-- Добавление тестовых комментариев
INSERT INTO comments (post_id, author_name, content)
SELECT 
    bp.id,
    'Алексей',
    'Отличная статья! Очень полезные советы по организации пространства.'
FROM blog_posts bp
WHERE bp.title = 'Как создать уютный интерьер в стиле минимализм';

INSERT INTO comments (post_id, author_name, content)
SELECT 
    bp.id,
    'Елена',
    'Спасибо за подробное описание процесса ремонта. Теперь я знаю, с чего начать!'
FROM blog_posts bp
WHERE bp.title = 'Ремонт квартиры: с чего начать';

INSERT INTO comments (post_id, author_name, content)
SELECT 
    bp.id,
    'Дмитрий',
    'Интересные тренды! Особенно понравилась идея с экологичными материалами.'
FROM blog_posts bp
WHERE bp.title = 'Тренды в дизайне интерьера 2024'; 