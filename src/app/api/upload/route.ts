import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

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

  return NextResponse.json({ url: publicUrl });
} 