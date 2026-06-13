import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');

  if (!identifier) {
    return NextResponse.json({ error: 'Не указан идентификатор пользователя' }, { status: 400 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, identifier, created_at, avatar_url, username, display_name, bio, social_links, role, password_hash')
    .eq('identifier', identifier)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const { password_hash: _password_hash, ...profile } = user;

  return NextResponse.json({ ...profile, has_password: !!_password_hash });
}
