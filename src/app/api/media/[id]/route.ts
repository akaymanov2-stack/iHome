import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserByIdentifier, canManagePosts } from '@/lib/admin';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');

  const user = await getUserByIdentifier(identifier);
  if (!user || user.role === 'reader') {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from('media')
    .select('storage_path, uploaded_by')
    .eq('id', params.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 404 });
  }

  if (!canManagePosts(user.role) && existing.uploaded_by !== user.id) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  await supabase.storage.from('blog-images').remove([existing.storage_path]);

  const { error } = await supabase.from('media').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
