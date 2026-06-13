'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/account', label: 'Обзор' },
  { href: '/account/profile', label: 'Профиль' },
];

const CAN_MANAGE_POSTS_ROLES = ['admin', 'editor', 'author'];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canManagePosts, setCanManagePosts] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      router.push('/admin/login');
      return;
    }
    setChecked(true);

    const identifier = localStorage.getItem('adminIdentifier');
    if (identifier) {
      fetch(`/api/auth/profile?identifier=${encodeURIComponent(identifier)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setIsAdmin(data?.role === 'admin');
          setCanManagePosts(CAN_MANAGE_POSTS_ROLES.includes(data?.role));
        });
    }
  }, [router]);

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
      <div className="max-w-7xl mx-auto pt-24 pb-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Выйти
            </button>
          </div>

          <nav className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
            {NAV_ITEMS.map((item) => {
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
            {canManagePosts && (
              <Link
                href="/admin/panel/posts"
                className="px-3 py-2 text-sm font-medium rounded-t-md text-gray-500 hover:text-gray-700"
              >
                Управление блогом
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin/panel"
                className="px-3 py-2 text-sm font-medium rounded-t-md text-gray-500 hover:text-gray-700"
              >
                Админ-панель
              </Link>
            )}
          </nav>

          {children}
        </div>
      </div>
    </div>
  );
}
