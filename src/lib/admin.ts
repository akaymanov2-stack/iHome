import { supabase } from './supabase';

export async function isAdmin(identifier: string | null | undefined): Promise<boolean> {
  if (!identifier) return false;

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('identifier', identifier)
    .maybeSingle();

  return data?.role === 'admin';
}

export interface AuthUser {
  id: string;
  role: string;
}

export async function getUserByIdentifier(identifier: string | null | undefined): Promise<AuthUser | null> {
  if (!identifier) return null;

  const { data } = await supabase
    .from('users')
    .select('id, role')
    .eq('identifier', identifier)
    .maybeSingle();

  return data ?? null;
}

// editor и admin могут управлять статусом и публикацией любых постов
export function canManagePosts(role: string | undefined): boolean {
  return role === 'editor' || role === 'admin';
}

export const AUTHOR_ALLOWED_STATUSES = ['draft', 'review'] as const;
export const POST_STATUSES = ['draft', 'review', 'scheduled', 'published', 'archived'] as const;
