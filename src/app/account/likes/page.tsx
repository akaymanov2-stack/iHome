'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LikedPost {
  id: string;
  title: string;
  created_at: string;
}

export default function LikedPostsPage() {
  const [posts, setPosts] = useState<LikedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const identifier = localStorage.getItem('adminIdentifier') || '';
    fetch(`/api/likes?identifier=${encodeURIComponent(identifier)}`)
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
      <h2 className="text-xl font-semibold mb-4">Понравившиеся публикации</h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">Вы пока ничего не отметили как понравившееся</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-gray-900">{post.title}</h3>
              <time className="text-sm text-gray-500" dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('ru-RU')}
              </time>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
