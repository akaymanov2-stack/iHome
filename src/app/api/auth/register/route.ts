import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/password';

export async function POST(request: Request) {
  const { identifier, password } = await request.json();

  if (!identifier || !password) {
    return NextResponse.json({ error: 'Укажите email или телефон и пароль' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Пароль должен содержать минимум 6 символов' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('identifier', identifier)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Пользователь с такими данными уже зарегистрирован' }, { status: 409 });
  }

  const { error } = await supabase
    .from('users')
    .insert({ identifier, password_hash: hashPassword(password) });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
