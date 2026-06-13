import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserByIdentifier } from '@/lib/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');

  const user = await getUserByIdentifier(identifier);
  if (!user || user.role === 'reader') {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('media')
    .select('id, url, filename, mime_type, size_bytes, uploaded_by, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }

  return NextResponse.json(data);
}
