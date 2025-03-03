'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    author: ''
  });
  const router = useRouter();

  useEffect(() => {
    // Проверка авторизации
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      router.push('/admin/login');
    }
    
    // Загрузка постов (в реальном приложении через API)
    const mockPosts: BlogPost[] = [
      {
        id: '1',
        title: 'Введение в Web3',
        content: 'Web3 - это следующее поколение интернета...',
        date: '2024-02-20',
        author: 'Admin'
      }
    ];
    setPosts(mockPosts);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const post: BlogPost = {
      id: Date.now().toString(),
      ...newPost,
      date: new Date().toISOString().split('T')[0]
    };
    
    setPosts([...posts, post]);
    setNewPost({ title: '', content: '', author: '' });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Управление блогом</h1>
      
      {/* Форма добавления поста */}
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

      {/* Список постов */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Существующие посты</h2>
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium">{post.title}</h3>
            <p className="text-sm text-gray-500">Автор: {post.author} | Дата: {post.date}</p>
            <p className="mt-2">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 