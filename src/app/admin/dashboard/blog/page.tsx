'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBlogPosts, createBlogPost, type BlogPost, getCategories, Category } from '@/utils/supabase';

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    author: '',
    image_url: '',
    category_id: '',
    tags: [] as string[]
  });
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }
    
    loadPosts();
    loadCategories();
  }, [router]);

  async function loadPosts() {
    try {
      const data = await getBlogPosts();
      setPosts(data);
    } catch (error) {
      setError('Ошибка при загрузке постов');
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const post = await createBlogPost(newPost);
      if (post) {
        setPosts([post, ...posts]);
        setNewPost({
          title: '',
          content: '',
          author: '',
          image_url: '',
          category_id: '',
          tags: []
        });
      }
    } catch (error) {
      setError('Ошибка при создании поста');
      console.error('Error creating post:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Управление блогом</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Заголовок</label>
          <input
            type="text"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Содержание</label>
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            className="w-full p-2 border rounded h-32"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Автор</label>
          <input
            type="text"
            value={newPost.author}
            onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">URL изображения</label>
          <input
            type="text"
            value={newPost.image_url}
            onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Категория</label>
          <select
            value={newPost.category_id}
            onChange={(e) => setNewPost({ ...newPost, category_id: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Теги (через запятую)</label>
          <input
            type="text"
            value={newPost.tags.join(', ')}
            onChange={(e) => setNewPost({ 
              ...newPost, 
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Создать пост
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Существующие посты</h2>
        {posts.map((post) => (
          <div key={post.id} className="border p-4 rounded">
            <h3 className="font-medium">{post.title}</h3>
            <p className="text-sm text-gray-600">Автор: {post.author}</p>
            <p className="text-sm text-gray-600">Дата: {new Date(post.created_at).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Категория: {post.category?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 