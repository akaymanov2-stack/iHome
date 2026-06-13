import Image from 'next/image';
import { getBlogPostById, BlogPost } from '@/utils/supabase';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Comments from '@/components/Comments';
import ShareButtons from '@/components/ShareButtons';
import RelatedPosts from '@/components/RelatedPosts';

interface BlogPostPageProps {
  params: {
    id: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const post = await getBlogPostById(params.id);
    
    if (!post) {
      notFound();
    }

    const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.id}`;

    return (
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            {post.author_user?.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author_user.avatar_url}
                alt={post.author}
                className="w-8 h-8 rounded-full object-cover mr-2"
              />
            )}
            <span>{post.author}</span>
            <span className="mx-2">•</span>
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
          {post.image_url && (
            <div className="relative w-full h-[400px] mb-8">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
          )}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <div className="border-t pt-8">
          <ShareButtons url={postUrl} title={post.title} />
        </div>

        <div className="mt-12">
          <Comments postId={post.id} />
        </div>

        <div className="mt-12">
          <RelatedPosts 
            currentPostId={post.id}
            categoryId={post.category_id}
            tags={post.tags}
          />
        </div>
      </article>
    );
  } catch (error) {
    console.error('Error in blog post page:', error);
    throw new Error('Failed to load blog post');
  }
} 