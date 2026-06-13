import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');

  if (!(await isAdmin(identifier))) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  const { error } = await supabase.from('comments').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'Не удалось удалить комментарий' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
