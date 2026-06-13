import { supabase } from './supabase';

interface LogAuditParams {
  actorId?: string | null;
  actorIdentifier?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}

export async function logAudit({ actorId, actorIdentifier, action, entityType, entityId, details }: LogAuditParams): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    actor_id: actorId ?? null,
    actor_identifier: actorIdentifier ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    details: details ?? null,
  });

  if (error) {
    console.error('Failed to write audit log:', error);
  }
}
