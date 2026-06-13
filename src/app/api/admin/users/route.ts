import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');

  if (!(await isAdmin(identifier))) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, identifier, username, display_name, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Не удалось загрузить пользователей' }, { status: 500 });
  }

  return NextResponse.json(data);
}
