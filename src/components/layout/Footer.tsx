import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">О компании</h3>
            <p className="text-gray-400">
              uRema - ваш надежный партнер в создании умного маркетинга будущего
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Инструменты</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products/smart-lighting" className="text-gray-400 hover:text-white transition-colors">
                  Big Data маркетинг
                </Link>
              </li>
              <li>
                <Link href="/products/security" className="text-gray-400 hover:text-white transition-colors">
                  AI маркетинг
                </Link>
              </li>
              <li>
                <Link href="/products/climate" className="text-gray-400 hover:text-white transition-colors">
                  SEO и трафик 3.0
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Экосистемы</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support/faq" className="text-gray-400 hover:text-white transition-colors">
                  CJM как Путь Героя
                </Link>
              </li>
              <li>
                <Link href="/support/documentation" className="text-gray-400 hover:text-white transition-colors">
                  JTBD как Трикстер
                </Link>
              </li>
              <li>
                <Link href="/support/contact" className="text-gray-400 hover:text-white transition-colors">
                  Маркетинг Экосистем
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@urema.ru</li>
              <li>Телефон: +7 (800) 123-45-67</li>
              <li>Адрес: г. Москва, ул. Простинская, 123</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 uRema. Все права защищены.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 