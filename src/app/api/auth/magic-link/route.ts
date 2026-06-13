import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { email, authUserId } = await request.json();

  if (!email || !authUserId) {
    return NextResponse.json({ error: 'Не указан email или идентификатор сессии' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id, identifier')
    .eq('identifier', email)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('users')
      .update({ auth_user_id: authUserId })
      .eq('id', existing.id);

    return NextResponse.json({ identifier: existing.identifier });
  }

  const { data: created, error } = await supabase
    .from('users')
    .insert({ identifier: email, auth_user_id: authUserId })
    .select('identifier')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ identifier: created.identifier });
}
