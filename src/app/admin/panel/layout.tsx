'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin/panel', label: 'Обзор', roles: ['admin'] },
  { href: '/admin/panel/users', label: 'Пользователи', roles: ['admin'] },
  { href: '/admin/panel/posts', label: 'Посты', roles: ['admin', 'editor', 'author'] },
  { href: '/admin/panel/media', label: 'Медиатека', roles: ['admin', 'editor', 'author'] },
  { href: '/admin/panel/comments', label: 'Комментарии', roles: ['admin'] },
  { href: '/admin/panel/audit', label: 'Журнал аудита', roles: ['admin'] },
  { href: '/admin/panel/webhooks', label: 'Вебхуки', roles: ['admin'] },
];

const ALLOWED_ROLES = ['admin', 'editor', 'author'];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [role, setRole] = useState('reader');

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }

    const identifier = localStorage.getItem('adminIdentifier');
    if (!identifier) {
      router.push('/account');
      return;
    }

    fetch(`/api/auth/profile?identifier=${encodeURIComponent(identifier)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ALLOWED_ROLES.includes(data?.role)) {
          router.push('/account');
          return;
        }
        if (data.role !== 'admin' && pathname === '/admin/panel') {
          router.replace('/admin/panel/posts');
          return;
        }
        setRole(data.role);
        setChecked(true);
      })
      .catch(() => router.push('/account'));
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminIdentifier');
    router.push('/admin/login');
  };

  if (!checked) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Личный кабинет
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Выйти
              </button>
            </div>
          </div>

          <nav className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
            {NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-t-md ${
                    active
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {children}
        </div>
      </div>
    </div>
  );
}
