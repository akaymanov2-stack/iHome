'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCategories, type Category } from '@/utils/supabase';
import { compressImage, checkImageSize } from '@/utils/imageCompression';
import PostForm, { type PostFormValues } from '../PostForm';

export default function AdminPostNewPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [role, setRole] = useState('reader');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const adminIdentifier = typeof window !== 'undefined' ? localStorage.getItem('adminIdentifier') : null;

  useEffect(() => {
    async function load() {
      try {
        const [cats, profileRes] = await Promise.all([
          getCategories(),
          fetch(`/api/auth/profile?identifier=${encodeURIComponent(adminIdentifier ?? '')}`),
        ]);
        const profile = profileRes.ok ? await profileRes.json() : null;
        setRole(profile?.role ?? 'reader');
        setCategories(cats);
      } catch {
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleImageUpload(imageFile: File | null): Promise<string | null> {
    if (!imageFile) return null;
    const compressed = await compressImage(imageFile);
    const sizeError = checkImageSize(compressed);
    if (sizeError) throw new Error(sizeError);
    const formData = new FormData();
    formData.append('file', compressed);
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
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: adminIdentifier,
          ...values,
          image_url: uploadedUrl ?? values.image_url,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Не удалось создать пост');
      }
      router.push('/admin/panel/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать пост');
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

  if (role === 'reader') {
    return <div className="p-4 bg-red-100 text-red-700 rounded">Доступ запрещён</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Новый пост</h2>
      <PostForm
        categories={categories}
        role={role}
        submitting={saving}
        error={error}
        submitLabel="Создать"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
