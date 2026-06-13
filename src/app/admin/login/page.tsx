'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AdminLogin() {
  const [mode, setMode] = useState<'login' | 'register' | 'magic'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      // Резервный вход для администратора по умолчанию
      if (identifier === 'admin' && password === 'admin123') {
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminIdentifier', identifier);
        router.push('/account');
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Не удалось войти');
        return;
      }

      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminIdentifier', identifier);
      router.push('/account');
    } catch {
      setError('Не удалось войти. Попробуйте позже');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Не удалось зарегистрироваться');
        return;
      }

      setInfo('Регистрация успешна. Теперь вы можете войти');
      setMode('login');
      setPassword('');
    } catch {
      setError('Не удалось зарегистрироваться. Попробуйте позже');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: identifier,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (otpError) {
        setError(otpError.message || 'Не удалось отправить ссылку для входа');
        return;
      }

      setInfo('Ссылка для входа отправлена на почту. Проверьте письмо');
    } catch {
      setError('Не удалось отправить ссылку для входа. Попробуйте позже');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: 'login' | 'register' | 'magic') => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const titles: Record<typeof mode, string> = {
    login: 'Вход в личный кабинет',
    register: 'Регистрация',
    magic: 'Вход по ссылке',
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {titles[mode]}
          </h2>
        </div>

        <div className="flex justify-center gap-4 text-sm border-b pb-4">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={mode === 'login' ? 'font-semibold text-blue-600' : 'text-gray-500 hover:text-gray-700'}
          >
            Пароль
          </button>
          <button
            type="button"
            onClick={() => switchMode('magic')}
            className={mode === 'magic' ? 'font-semibold text-blue-600' : 'text-gray-500 hover:text-gray-700'}
          >
            Ссылка на почту
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={mode === 'register' ? 'font-semibold text-blue-600' : 'text-gray-500 hover:text-gray-700'}
          >
            Регистрация
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {info && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
            {info}
          </div>
        )}

        {mode === 'magic' ? (
          <form className="mt-8 space-y-6" onSubmit={handleMagicLink}>
            <div>
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Отправка...' : 'Отправить ссылку'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email или телефон"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? 'Подождите...'
                  : mode === 'login'
                    ? 'Войти'
                    : 'Зарегистрироваться'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
