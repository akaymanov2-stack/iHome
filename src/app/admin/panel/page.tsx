'use client';

import { useEffect, useState } from 'react';

interface Stats {
  usersCount: number;
  authorsCount: number;
  adminsCount: number;
  postsCount: number;
  commentsCount: number;
}

const CARDS: { key: keyof Stats; label: string }[] = [
  { key: 'usersCount', label: 'Пользователей всего' },
  { key: 'authorsCount', label: 'Авторов' },
  { key: 'adminsCount', label: 'Администраторов' },
  { key: 'postsCount', label: 'Постов блога' },
  { key: 'commentsCount', label: 'Комментариев' },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const identifier = localStorage.getItem('adminIdentifier');
    fetch(`/api/admin/stats?identifier=${encodeURIComponent(identifier ?? '')}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setStats)
      .catch(() => setError('Не удалось загрузить статистику'));
  }, []);

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {CARDS.map((card) => (
        <div key={card.key} className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">{card.label}</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{stats[card.key]}</div>
        </div>
      ))}
    </div>
  );
}
