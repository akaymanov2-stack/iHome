import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
  const { identifier, password } = await request.json();

  if (!identifier || !password) {
    return NextResponse.json({ error: 'Укажите email или телефон и пароль' }, { status: 400 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('password_hash')
    .eq('identifier', identifier)
    .maybeSingle();

  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
