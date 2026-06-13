import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserByIdentifier } from '@/lib/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');
  const postId = searchParams.get('post_id');

  if (postId) {
    const user = await getUserByIdentifier(identifier);

    const { count } = await supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);

    let liked = false;
    if (user) {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();
      liked = !!data;
    }

    return NextResponse.json({ liked, count: count ?? 0 });
  }

  const user = await getUserByIdentifier(identifier);
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('likes')
    .select('post:blog_posts(id, title, created_at, image_url, status)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Не удалось загрузить публикации' }, { status: 500 });
  }

  return NextResponse.json(data.map((row) => row.post).filter(Boolean));
}

export async function POST(request: Request) {
  const { identifier, post_id } = await request.json();

  const user = await getUserByIdentifier(identifier);
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', post_id)
    .maybeSingle();

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id);
  } else {
    await supabase.from('likes').insert({ user_id: user.id, post_id });
  }

  const { count } = await supabase
    .from('likes')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', post_id);

  return NextResponse.json({ liked: !existing, count: count ?? 0 });
}
