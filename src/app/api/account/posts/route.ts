import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserByIdentifier } from '@/lib/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');

  const user = await getUserByIdentifier(identifier);
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, status, created_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Не удалось загрузить публикации' }, { status: 500 });
  }

  return NextResponse.json(data);
}
