import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
  const { identifier, currentPassword, newPassword } = await request.json();

  if (!identifier || !currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Новый пароль должен содержать минимум 6 символов' }, { status: 400 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, password_hash')
    .eq('identifier', identifier)
    .maybeSingle();

  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    return NextResponse.json({ error: 'Текущий пароль указан неверно' }, { status: 401 });
  }

  const { error } = await supabase
    .from('users')
    .update({ password_hash: hashPassword(newPassword) })
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
