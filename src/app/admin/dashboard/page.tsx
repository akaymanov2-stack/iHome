'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Панель управления</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              href="/admin/dashboard/blog"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Управление блогом</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Добавление и редактирование статей в разделе "Блог о WEB3"
                </p>
              </div>
            </Link>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Статистика</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Просмотры, комментарии и другие метрики
                </p>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Настройки</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Настройки сайта и профиля администратора
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 