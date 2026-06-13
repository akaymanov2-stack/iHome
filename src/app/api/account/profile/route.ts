import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export async function PATCH(request: Request) {
  const { identifier, username, display_name, bio, social_links } = await request.json();

  if (!identifier) {
    return NextResponse.json({ error: 'Не указан пользователь' }, { status: 400 });
  }

  if (username && !USERNAME_PATTERN.test(username)) {
    return NextResponse.json({ error: 'От 3 до 20 символов: латинские буквы, цифры, подчёркивание' }, { status: 400 });
  }

  if (username) {
    const { data: existing } = await supabase
      .from('users')
      .select('identifier')
      .eq('username', username)
      .maybeSingle();

    if (existing && existing.identifier !== identifier) {
      return NextResponse.json({ error: 'Этот username уже занят' }, { status: 409 });
    }
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      username: username || null,
      display_name: display_name || null,
      bio: bio || null,
      social_links: social_links || {},
    })
    .eq('identifier', identifier)
    .select('id, identifier, username, display_name, bio, social_links, avatar_url')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
