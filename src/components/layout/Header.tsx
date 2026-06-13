'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const identifier = localStorage.getItem('adminIdentifier');
    if (!localStorage.getItem('adminAuth') || !identifier) {
      setLoggedIn(false);
      setAvatarUrl(null);
      return;
    }

    setLoggedIn(true);
    fetch(`/api/auth/profile?identifier=${encodeURIComponent(identifier)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAvatarUrl(data?.avatar_url ?? null));
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminIdentifier');
    setLoggedIn(false);
    setAvatarUrl(null);
    setMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <Image
              src="/urema333.jpg"
              alt="uRema Cognitiv's"
              width={100}
              height={100}
              className="h-20 w-auto pl-2"
            />
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors">
              Инструменты
            </Link>
            <Link href="/solutions" className="text-gray-700 hover:text-blue-600 transition-colors">
              Кейсы
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              О нас
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 transition-colors">
              Блог о WEB3
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {loggedIn ? (
              <div className="relative hidden md:block" ref={menuRef}>
                <button onClick={() => setMenuOpen((open) => !open)} className="block">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="Профиль"
                      className="h-10 w-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      ?
                    </div>
                  )}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border py-1 z-50">
                    <Link
                      href="/account/posts"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Мои публикации
                    </Link>
                    <Link
                      href="/account/likes"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Понравилось
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Личный кабинет
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/admin/login" className="hidden md:block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                Войти
              </Link>
            )}
            <button className="hidden md:block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
              Связаться с нами
            </button>
            <button className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
