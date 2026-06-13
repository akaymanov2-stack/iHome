import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');

  if (!(await isAdmin(identifier))) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  const [usersCount, authorsCount, adminsCount, postsCount, commentsCount] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'author'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
  ]);

  return NextResponse.json({
    usersCount: usersCount.count ?? 0,
    authorsCount: authorsCount.count ?? 0,
    adminsCount: adminsCount.count ?? 0,
    postsCount: postsCount.count ?? 0,
    commentsCount: commentsCount.count ?? 0,
  });
}
