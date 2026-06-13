import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.toLowerCase() || '';
  const identifier = searchParams.get('identifier') || '';

  if (!USERNAME_PATTERN.test(username)) {
    return NextResponse.json({
      available: false,
      error: 'От 3 до 20 символов: латинские буквы, цифры, подчёркивание',
    });
  }

  const { data: existing } = await supabase
    .from('users')
    .select('identifier')
    .eq('username', username)
    .maybeSingle();

  const available = !existing || existing.identifier === identifier;

  return NextResponse.json({
    available,
    error: available ? null : 'Этот username уже занят',
  });
}
