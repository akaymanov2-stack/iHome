'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBlogPosts, createBlogPost, type BlogPost } from '@/utils/supabase';

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    author: '',
    image_url: ''
  });
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }
    
    loadPosts();
  }, [router]);

  async function loadPosts() {
    try {
      const fetchedPosts = await getBlogPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      setError('Ошибка при загрузке постов');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const post = await createBlogPost(newPost);
      if (post) {
        setPosts([post, ...posts]);
        setNewPost({ title: '', content: '', author: '', image_url: '' });
      }
    } catch (err) {
      setError('Ошибка при создании поста');
      console.error('Error creating post:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Управление блогом</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Добавить новый пост</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Заголовок</label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Автор</label>
            <input
              type="text"
              value={newPost.author}
              onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">URL изображения</label>
            <input
              type="url"
              value={newPost.image_url}
              onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Содержание</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Добавить пост
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Существующие посты</h2>
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium">{post.title}</h3>
            <p className="text-sm text-gray-500">
              Автор: {post.author} | Дата: {new Date(post.created_at).toLocaleDateString('ru-RU')}
            </p>
            <p className="mt-2">{post.content}</p>
            {post.image_url && (
              <p className="text-sm text-gray-500 mt-2">
                Изображение: {post.image_url}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 