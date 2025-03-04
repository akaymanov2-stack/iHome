import Image from 'next/image';
import { getBlogPostById } from '@/utils/supabase';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Comments } from '@/components/blog/Comments';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { BlogPost } from '@/types/blog';

interface BlogPostPageProps {
  params: {
    id: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostById(params.id);

  if (!post) {
    notFound();
  }

  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.id}`;

  return (
    <article className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {post.image_url && (
            <div className="relative h-[400px] w-full">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <span>{new Date(post.created_at).toLocaleDateString('ru-RU')}</span>
              <span className="mx-2">•</span>
              <span>{post.author}</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            <div className="prose prose-lg max-w-none mb-8">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <ShareButtons title={post.title} url={postUrl} />
            </div>
          </div>
        </div>

        <Comments postId={post.id} />

        <RelatedPosts 
          currentPostId={post.id}
          categoryId={post.category_id}
          tags={post.tags}
        />
      </div>
    </article>
  );
} 