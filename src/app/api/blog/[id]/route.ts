import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserByIdentifier, canManagePosts, AUTHOR_ALLOWED_STATUSES, POST_STATUSES } from '@/lib/admin';
import { slugify, ensureUniqueSlug } from '@/lib/slug';
import { logAudit } from '@/lib/audit';
import { dispatchWebhooks } from '@/lib/webhooks';
import type { PostStatus } from '@/utils/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching blog post with ID:', params.id);
    
    if (!params.id) {
      console.error('No post ID provided');
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    console.log('Making Supabase query...');
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
    }

    if (!post) {
      console.error('No post found with ID:', params.id);
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    console.log('Successfully fetched post:', post.id);
    return NextResponse.json(post);
  } catch (error) {
    console.error('Unexpected error in blog post API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { identifier, title, content, author, image_url, category_id, tags, excerpt, meta_title, meta_description, og_image } = body;

    const user = await getUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const { data: existing } = await supabase
      .from('blog_posts')
      .select('author_id, status, slug')
      .eq('id', params.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Пост не найден' }, { status: 404 });
    }

    const isManager = canManagePosts(user.role);
    const isOwner = existing.author_id === user.id;
    if (!isManager && !(user.role === 'author' && isOwner)) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const update: Record<string, unknown> = { title, content, author, image_url, category_id, tags };

    if (excerpt !== undefined) update.excerpt = excerpt || null;
    if (meta_title !== undefined) update.meta_title = meta_title || null;
    if (meta_description !== undefined) update.meta_description = meta_description || null;
    if (og_image !== undefined) update.og_image = og_image || null;

    if (body.status !== undefined) {
      const status = body.status as PostStatus;
      if (!POST_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Некорректный статус' }, { status: 400 });
      }
      if (!isManager && !AUTHOR_ALLOWED_STATUSES.includes(status as 'draft' | 'review')) {
        return NextResponse.json({ error: 'Недостаточно прав для изменения статуса' }, { status: 403 });
      }
      if (status === 'scheduled' && !body.scheduled_at) {
        return NextResponse.json({ error: 'Укажите дату публикации' }, { status: 400 });
      }
      update.status = status;
      update.scheduled_at = status === 'scheduled' ? body.scheduled_at : null;
    }

    if (typeof body.slug === 'string' && body.slug.trim() && slugify(body.slug) !== existing.slug) {
      update.slug = await ensureUniqueSlug(slugify(body.slug), params.id);
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(update)
      .eq('id', params.id)
      .select(`
        *,
        category:categories(*),
        author_user:users(avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
    }

    await logAudit({
      actorId: user.id,
      actorIdentifier: identifier,
      action: 'post.updated',
      entityType: 'blog_post',
      entityId: data.id,
      details: { title: data.title, status: data.status },
    });

    if (update.status === 'published' && existing.status !== 'published') {
      await logAudit({
        actorId: user.id,
        actorIdentifier: identifier,
        action: 'post.published',
        entityType: 'blog_post',
        entityId: data.id,
        details: { title: data.title },
      });
      await dispatchWebhooks('post.published', { post: data });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in blog post update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');

    const user = await getUserByIdentifier(identifier);
    if (!user) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const { data: existing } = await supabase
      .from('blog_posts')
      .select('author_id, status')
      .eq('id', params.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Пост не найден' }, { status: 404 });
    }

    const isManager = canManagePosts(user.role);
    const isOwnDraft = user.role === 'author'
      && existing.author_id === user.id
      && AUTHOR_ALLOWED_STATUSES.includes(existing.status as 'draft' | 'review');

    if (!isManager && !isOwnDraft) {
      return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const { error } = await supabase.from('blog_posts').delete().eq('id', params.id);

    if (error) {
      console.error('Error deleting blog post:', error);
      return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
    }

    await logAudit({
      actorId: user.id,
      actorIdentifier: identifier,
      action: 'post.deleted',
      entityType: 'blog_post',
      entityId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in blog post delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
