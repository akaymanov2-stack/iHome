import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isAdmin, getUserByIdentifier } from '@/lib/admin';
import { logAudit } from '@/lib/audit';

const ROLES = ['reader', 'author', 'editor', 'admin'];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { identifier, role } = body;

  if (!(await isAdmin(identifier))) {
    return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 });
  }

  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: 'Некорректная роль' }, { status: 400 });
  }

  const { data: before } = await supabase
    .from('users')
    .select('role')
    .eq('id', params.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', params.id)
    .select('id, identifier, username, display_name, role, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Не удалось обновить роль' }, { status: 500 });
  }

  const actor = await getUserByIdentifier(identifier);
  await logAudit({
    actorId: actor?.id,
    actorIdentifier: identifier,
    action: 'user.role_changed',
    entityType: 'user',
    entityId: params.id,
    details: { from: before?.role, to: role },
  });

  return NextResponse.json(data);
}
