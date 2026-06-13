import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

const ALLOWED_EVENTS = ['post.published'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');

  if (!(await isAdmin(identifier))) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('webhooks')
    .select('id, url, event, secret, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { identifier, url, event, secret } = body;

  if (!(await isAdmin(identifier))) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  if (!url || !ALLOWED_EVENTS.includes(event)) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('webhooks')
    .insert({ url, event, secret: secret || null })
    .select('id, url, event, secret, is_active, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Не удалось создать вебхук' }, { status: 500 });
  }

  return NextResponse.json(data);
}
