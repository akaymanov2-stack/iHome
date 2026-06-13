import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

export async function POST(request: Request) {
  const body = await request.json();
  const { identifier, name, slug } = body;

  if (!(await isAdmin(identifier))) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  if (!name || !slug) {
    return NextResponse.json({ error: 'Укажите название и slug' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, slug }])
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Не удалось создать категорию' }, { status: 500 });
  }

  return NextResponse.json(data);
}
