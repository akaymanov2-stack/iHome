import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header: React.FC = () => {
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
            <Link href="/admin/login" className="hidden md:block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
              Войти
            </Link>
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