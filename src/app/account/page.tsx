'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Profile {
  identifier: string;
  created_at: string;
  avatar_url?: string | null;
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  role: string;
}

export default function AccountOverview() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const identifier = localStorage.getItem('adminIdentifier') || '';
    if (!identifier) return;

    fetch(`/api/auth/profile?identifier=${encodeURIComponent(identifier)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setProfile(data);
      });
  }, []);

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt="Фото профиля"
              className="w-16 h-16 rounded-full object-cover border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">
              ?
            </div>
          )}

          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {profile?.display_name || profile?.identifier || '—'}
            </h2>
            <p className="text-sm text-gray-500">
              {profile?.role === 'author' ? 'Автор' : 'Читатель'}
            </p>
          </div>
        </div>

        {profile?.bio && (
          <p className="text-sm text-gray-600 mb-4">{profile.bio}</p>
        )}

        <p className="text-sm text-gray-600">
          Email / телефон: <span className="font-medium text-gray-900">{profile?.identifier || '—'}</span>
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Дата регистрации:{' '}
          <span className="font-medium text-gray-900">
            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
          </span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/account/profile"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Редактировать профиль
          </Link>
          {profile?.username && (
            <Link
              href={`/u/${profile.username}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Открыть публичный профиль
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
