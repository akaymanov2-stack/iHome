'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getBlogPostById, getCategories, type Category, type BlogPost } from '@/utils/supabase';
import PostForm, { type PostFormValues } from '../PostForm';

export default function AdminPostEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [role, setRole] = useState('reader');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const adminIdentifier = typeof window !== 'undefined' ? localStorage.getItem('adminIdentifier') : null;

  useEffect(() => {
    async function load() {
      try {
        const [fetchedPost, cats, profileRes] = await Promise.all([
          getBlogPostById(params.id),
          getCategories(),
          fetch(`/api/auth/profile?identifier=${encodeURIComponent(adminIdentifier ?? '')}`),
        ]);

        if (!fetchedPost) {
          setError('Пост не найден');
          return;
        }

        const profile = profileRes.ok ? await profileRes.json() : null;
        const userRole = profile?.role ?? 'reader';

        if (userRole === 'reader' || (userRole === 'author' && fetchedPost.author_id !== profile?.id)) {
          setError('Доступ запрещён');
          return;
        }

        setRole(userRole);
        setPost(fetchedPost);
        setCategories(cats);
      } catch {
        setError('Не удалось загрузить пост');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleImageUpload(imageFile: File | null): Promise<string | null> {
    if (!imageFile) return null;
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('identifier', adminIdentifier ?? '');
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Ошибка при загрузке изображения');
    const { url } = await response.json();
    return url;
  }

  async function handleSubmit(values: PostFormValues, imageFile: File | null) {
    setSaving(true);
    setError(null);
    try {
      const uploadedUrl = await handleImageUpload(imageFile);
      const res = await fetch(`/api/blog/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: adminIdentifier,
          ...values,
          image_url: uploadedUrl ?? values.image_url,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Не удалось сохранить пост');
      }
      router.push('/admin/panel/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить пост');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !post) {
    return <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Редактирование поста</h2>
      <PostForm
        initial={post ?? undefined}
        categories={categories}
        role={role}
        submitting={saving}
        error={error}
        submitLabel="Сохранить"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
