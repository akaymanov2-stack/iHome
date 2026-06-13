'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdminComment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  post_id: string;
  post: { id: string; title: string } | null;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const adminIdentifier = typeof window !== 'undefined' ? localStorage.getItem('adminIdentifier') : null;

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments?identifier=${encodeURIComponent(adminIdentifier ?? '')}`);
      if (!res.ok) throw new Error();
      setComments(await res.json());
    } catch {
      setError('Не удалось загрузить комментарии');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить комментарий?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/comments/${id}?identifier=${encodeURIComponent(adminIdentifier ?? '')}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError('Не удалось удалить комментарий');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}
      {comments.length === 0 && <p className="text-gray-500">Комментариев пока нет</p>}
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white rounded-lg shadow p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-900">{comment.content}</p>
            <p className="text-sm text-gray-500 mt-1">
              {comment.author_name} · {new Date(comment.created_at).toLocaleString()}
              {comment.post && (
                <>
                  {' · '}
                  <Link href={`/blog/${comment.post.id}`} className="text-blue-600 hover:underline">
                    {comment.post.title}
                  </Link>
                </>
              )}
            </p>
          </div>
          <button onClick={() => handleDelete(comment.id)} className="text-red-600 hover:underline text-sm whitespace-nowrap">
            Удалить
          </button>
        </div>
      ))}
    </div>
  );
}
