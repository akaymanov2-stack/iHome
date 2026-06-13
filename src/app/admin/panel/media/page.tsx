'use client';

import { useEffect, useState } from 'react';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const adminIdentifier = typeof window !== 'undefined' ? localStorage.getItem('adminIdentifier') : null;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/media?identifier=${encodeURIComponent(adminIdentifier ?? '')}`);
      if (!res.ok) throw new Error();
      setItems(await res.json());
    } catch {
      setError('Не удалось загрузить медиатеку');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить файл?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/media/${id}?identifier=${encodeURIComponent(adminIdentifier ?? '')}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError('Не удалось удалить файл');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
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
      <h2 className="text-xl font-semibold">Медиатека</h2>
      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}
      {items.length === 0 ? (
        <p className="text-gray-500">Файлы пока не загружены</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.filename} className="w-full h-32 object-cover" />
              <div className="p-2 space-y-1">
                <p className="text-xs text-gray-700 truncate" title={item.filename}>{item.filename}</p>
                <p className="text-xs text-gray-400">{formatSize(item.size_bytes)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(item.url)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Копировать URL
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
