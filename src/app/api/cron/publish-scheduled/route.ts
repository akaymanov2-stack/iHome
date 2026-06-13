import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { dispatchWebhooks } from '@/lib/webhooks';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update({ status: 'published', scheduled_at: null })
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())
    .select('*');

  if (error) {
    console.error('Error publishing scheduled posts:', error);
    return NextResponse.json({ error: 'Failed to publish scheduled posts' }, { status: 500 });
  }

  for (const post of data ?? []) {
    await logAudit({
      actorIdentifier: 'cron',
      action: 'post.published',
      entityType: 'blog_post',
      entityId: post.id,
      details: { title: post.title, trigger: 'scheduled' },
    });
    await dispatchWebhooks('post.published', { post });
  }

  return NextResponse.json({ published: data?.length ?? 0 });
}
