import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserByIdentifier, canManagePosts, AUTHOR_ALLOWED_STATUSES, POST_STATUSES } from '@/lib/admin';
import { slugify, ensureUniqueSlug } from '@/lib/slug';
import { logAudit } from '@/lib/audit';
import { dispatchWebhooks } from '@/lib/webhooks';
import type { PostStatus } from '@/utils/supabase';

export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:categories(*),
        author_user:users(avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error in blog posts API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const user = await getUserByIdentifier(body.identifier);
    if (!user || user.role === 'reader') {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const isManager = canManagePosts(user.role);
    let status: PostStatus = POST_STATUSES.includes(body.status) ? body.status : 'draft';
    if (!isManager && !AUTHOR_ALLOWED_STATUSES.includes(status as 'draft' | 'review')) {
      status = 'draft';
    }
    if (status === 'scheduled' && !body.scheduled_at) {
      return NextResponse.json({ error: 'Укажите дату публикации' }, { status: 400 });
    }

    const slugSource = typeof body.slug === 'string' && body.slug.trim() ? body.slug : body.title;
    const slug = await ensureUniqueSlug(slugify(slugSource || ''));

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([
        {
          title: body.title,
          content: body.content,
          author: body.author,
          author_id: user.id,
          image_url: body.image_url,
          category_id: body.category_id,
          tags: body.tags,
          slug,
          status,
          scheduled_at: status === 'scheduled' ? body.scheduled_at : null,
          excerpt: body.excerpt || null,
          meta_title: body.meta_title || null,
          meta_description: body.meta_description || null,
          og_image: body.og_image || null,
          updated_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        category:categories(*),
        author_user:users(avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
    }

    await logAudit({
      actorId: user.id,
      actorIdentifier: body.identifier,
      action: 'post.created',
      entityType: 'blog_post',
      entityId: data.id,
      details: { title: data.title, status: data.status },
    });

    if (status === 'published') {
      await dispatchWebhooks('post.published', { post: data });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in blog post creation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 