import crypto from 'crypto';
import { supabase } from './supabase';

export async function dispatchWebhooks(event: string, payload: Record<string, unknown>): Promise<void> {
  const { data: webhooks, error } = await supabase
    .from('webhooks')
    .select('url, secret')
    .eq('event', event)
    .eq('is_active', true);

  if (error) {
    console.error('Failed to load webhooks:', error);
    return;
  }

  if (!webhooks || webhooks.length === 0) return;

  const body = JSON.stringify({ event, ...payload });

  await Promise.allSettled(
    webhooks.map(async (webhook) => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (webhook.secret) {
        headers['X-Webhook-Signature'] = crypto.createHmac('sha256', webhook.secret).update(body).digest('hex');
      }

      try {
        await fetch(webhook.url, { method: 'POST', headers, body });
      } catch (err) {
        console.error(`Webhook delivery failed for ${webhook.url}:`, err);
      }
    })
  );
}
