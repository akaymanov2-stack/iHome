'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBlogPosts, getCategories, type BlogPost, type Category, type PostStatus } from '@/utils/supabase';
import { STATUS_LABELS, ALL_POST_STATUSES } from './PostForm';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [role, setRole] = useState('reader');
  const [userId, setUserId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
  const [savingCategory, setSavingCategory] = useState(false);

  const adminIdentifier = typeof window !== 'undefined' ? localStorage.getItem('adminIdentifier') : null;

  useEffect(() => {
    loadProfile();
    loadPosts();
    loadCategories();
  }, []);

  async function loadProfile() {
    try {
      const res = await fetch(`/api/auth/profile?identifier=${encodeURIComponent(adminIdentifier ?? '')}`);
      if (!res.ok) return;
      const data = await res.json();
      setRole(data?.role ?? 'reader');
      setUserId(data?.id ?? null);
    } catch {
      // ignore
    }
  }

  async function loadPosts() {
    try {
      setPosts(await getBlogPosts());
    } catch {
      setError('Не удалось загрузить посты');
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      setCategories(await getCategories());
    } catch {
      // ignore
    }
  }

  async function handleDeletePost(id: string) {
    if (!confirm('Удалить пост?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/blog/${id}?identifier=${encodeURIComponent(adminIdentifier ?? '')}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError('Не удалось удалить пост');
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setSavingCategory(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: adminIdentifier, ...newCategory }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setCategories((prev) => [...prev, created]);
      setNewCategory({ name: '', slug: '' });
    } catch {
      setError('Не удалось создать категорию');
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Удалить категорию?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${id}?identifier=${encodeURIComponent(adminIdentifier ?? '')}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Не удалось удалить категорию');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const canManageAll = role === 'admin' || role === 'editor';
  const visiblePosts = posts
    .filter((post) => canManageAll || post.author_id === userId)
    .filter((post) => statusFilter === 'all' || post.status === statusFilter);

  function canDelete(post: BlogPost) {
    if (canManageAll) return true;
    return post.author_id === userId && (post.status === 'draft' || post.status === 'review');
  }

  return (
    <div className="space-y-8">
      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      {role === 'admin' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Категории</h2>
          <div className="bg-white rounded-lg shadow p-4 space-y-3">
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center justify-between text-sm">
                  <span>{category.name} <span className="text-gray-400">({category.slug})</span></span>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:underline"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="Название"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="flex-1 p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="slug"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                className="flex-1 p-2 border rounded"
                required
              />
              <button
                type="submit"
                disabled={savingCategory}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Добавить
              </button>
            </form>
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold">Посты</h2>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PostStatus | 'all')}
              className="border rounded p-1 text-sm"
            >
              <option value="all">Все статусы</option>
              {ALL_POST_STATUSES.map((status) => (
                <option key={status} value={status}>{STATUS_LABELS[status]}</option>
              ))}
            </select>
            <Link href="/admin/panel/posts/new" className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600">
              Новый пост
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{post.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {STATUS_LABELS[post.status]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Автор: {post.author}</p>
                <p className="text-sm text-gray-600">Категория: {post.category?.name ?? '—'}</p>
                <p className="text-sm text-gray-600">Дата: {new Date(post.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3">
                <Link href={`/admin/panel/posts/${post.id}`} className="text-blue-600 hover:underline text-sm">
                  Редактировать
                </Link>
                {canDelete(post) && (
                  <button onClick={() => handleDeletePost(post.id)} className="text-red-600 hover:underline text-sm">
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))}
          {visiblePosts.length === 0 && <p className="text-gray-500">Постов нет</p>}
        </div>
      </div>
    </div>
  );
}
