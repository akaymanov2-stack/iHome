'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const finish = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!active) return;

      if (sessionError || !data.session?.user?.email) {
        setError('Не удалось подтвердить вход по ссылке');
        return;
      }

      const { user } = data.session;

      try {
        const res = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, authUserId: user.id }),
        });
        const result = await res.json();

        if (!res.ok) {
          setError(result.error || 'Не удалось войти');
          return;
        }

        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminIdentifier', result.identifier);
        router.push('/account');
      } catch {
        setError('Не удалось войти. Попробуйте позже');
      }
    };

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        finish();
      }
    });

    finish();

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        {error ? (
          <>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <a href="/admin/login" className="text-blue-600 hover:text-blue-700 text-sm">
              Вернуться на страницу входа
            </a>
          </>
        ) : (
          <p className="text-sm text-gray-600">Подтверждаем вход...</p>
        )}
      </div>
    </div>
  );
}
