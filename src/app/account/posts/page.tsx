'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { STATUS_LABELS } from '@/app/admin/panel/posts/PostForm';
import type { PostStatus } from '@/utils/supabase';

interface MyPost {
  id: string;
  title: string;
  status: PostStatus;
  created_at: string;
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const identifier = localStorage.getItem('adminIdentifier') || '';
    fetch(`/api/account/posts?identifier=${encodeURIComponent(identifier)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Мои публикации</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">У вас пока нет публикаций</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{post.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString('ru-RU')} · {STATUS_LABELS[post.status]}
                </p>
              </div>
              {post.status === 'published' && (
                <Link href={`/blog/${post.id}`} className="text-blue-600 hover:underline text-sm">
                  Открыть
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
