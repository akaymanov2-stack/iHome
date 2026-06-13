'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedBlogPosts, type BlogPost } from '@/utils/supabase';

export default function BlogComponent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const fetchedPosts = await getPublishedBlogPosts();
        setPosts(fetchedPosts);
      } catch (err) {
        setError('Ошибка при загрузке постов');
        console.error('Error loading posts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Блог о WEB3</h1>
          <p className="text-xl text-gray-600">
            Исследуйте мир Web3 технологий вместе с нами
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article 
              key={post.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {post.image_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>{new Date(post.created_at).toLocaleDateString('ru-RU')}</span>
                  <span className="mx-2">•</span>
                  {post.author_user?.avatar_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.author_user.avatar_url}
                      alt={post.author}
                      className="w-5 h-5 rounded-full object-cover mr-1"
                    />
                  )}
                  <span>{post.author}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt || post.content}
                </p>
                <Link 
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  Читать далее
                  <svg 
                    className="w-4 h-4 ml-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Пока нет статей. Следите за обновлениями!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 