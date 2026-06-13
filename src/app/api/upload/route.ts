import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserByIdentifier } from '@/lib/admin';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const identifier = formData.get('identifier') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(`images/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(data.path);

  const user = await getUserByIdentifier(identifier);
  await supabase.from('media').insert({
    url: publicUrl,
    storage_path: data.path,
    filename: file.name,
    mime_type: file.type || null,
    size_bytes: file.size || null,
    uploaded_by: user?.id ?? null,
  });

  return NextResponse.json({ url: publicUrl });
}