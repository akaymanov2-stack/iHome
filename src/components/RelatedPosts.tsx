'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import type { BlogPost } from '@/utils/supabase';

interface RelatedPostsProps {
  currentPostId: string;
  categoryId?: string;
  tags?: string[];
}

export default function RelatedPosts({ currentPostId, categoryId, tags }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatedPosts();
  }, [currentPostId, categoryId, tags]);

  async function loadRelatedPosts() {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .neq('id', currentPostId)
      .limit(3);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading related posts:', error);
    } else {
      setRelatedPosts(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="animate-pulse">Загрузка похожих постов...</div>;
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6">Похожие посты</h3>
      <div className="grid gap-6 md:grid-cols-3">
        {relatedPosts.map((post) => (
          <Link 
            key={post.id} 
            href={`/blog/${post.id}`}
            className="block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
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
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {post.title}
              </h4>
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 