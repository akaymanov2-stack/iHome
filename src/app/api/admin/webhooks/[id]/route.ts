import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { identifier, is_active } = body;

  if (!(await isAdmin(identifier))) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('webhooks')
    .update({ is_active })
    .eq('id', params.id)
    .select('id, url, event, secret, is_active, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Не удалось обновить вебхук' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');

  if (!(await isAdmin(identifier))) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  const { error } = await supabase.from('webhooks').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'Не удалось удалить вебхук' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
