import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface PublicProfilePageProps {
  params: {
    username: string;
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { data: user } = await supabase
    .from('users')
    .select('id, username, display_name, bio, social_links, avatar_url, role')
    .eq('username', params.username)
    .maybeSingle();

  if (!user) {
    notFound();
  }

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, created_at, image_url')
    .eq('author_id', user.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const socialLinks: { website?: string; twitter?: string; github?: string } = user.social_links || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt={user.display_name || user.username}
            className="w-20 h-20 rounded-full object-cover border"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">
            ?
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.display_name || user.username}</h1>
          <p className="text-gray-500">@{user.username}</p>
          {user.role === 'author' && (
            <span className="inline-block mt-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full px-2 py-0.5">
              Автор
            </span>
          )}
        </div>
      </div>

      {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

      {(socialLinks.website || socialLinks.twitter || socialLinks.github) && (
        <div className="flex flex-wrap gap-4 mb-8 text-sm text-blue-600">
          {socialLinks.website && (
            <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Сайт
            </a>
          )}
          {socialLinks.twitter && (
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Twitter / X
            </a>
          )}
          {socialLinks.github && (
            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
              GitHub
            </a>
          )}
        </div>
      )}

      {posts && posts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Публикации</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="block p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900">{post.title}</h3>
                <time className="text-sm text-gray-500" dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
