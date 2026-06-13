'use client';

import { useEffect, useState } from 'react';

interface Webhook {
  id: string;
  url: string;
  event: string;
  secret: string | null;
  is_active: boolean;
  created_at: string;
}

const EVENTS = ['post.published'];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ url: '', event: EVENTS[0], secret: '' });

  const adminIdentifier = typeof window !== 'undefined' ? localStorage.getItem('adminIdentifier') : null;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/webhooks?identifier=${encodeURIComponent(adminIdentifier ?? '')}`);
      if (!res.ok) throw new Error();
      setWebhooks(await res.json());
    } catch {
      setError('Не удалось загрузить вебхуки');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: adminIdentifier, ...form }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setWebhooks((prev) => [created, ...prev]);
      setForm({ url: '', event: EVENTS[0], secret: '' });
    } catch {
      setError('Не удалось создать вебхук');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(id: string, is_active: boolean) {
    try {
      const res = await fetch(`/api/admin/webhooks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: adminIdentifier, is_active }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setWebhooks((prev) => prev.map((w) => (w.id === id ? updated : w)));
    } catch {
      setError('Не удалось обновить вебхук');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить вебхук?')) return;
    try {
      const res = await fetch(`/api/admin/webhooks/${id}?identifier=${encodeURIComponent(adminIdentifier ?? '')}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    } catch {
      setError('Не удалось удалить вебхук');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Вебхуки</h2>
      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-4 space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">URL</label>
          <input
            type="url"
            required
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full p-2 border rounded"
            placeholder="https://example.com/webhook"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Событие</label>
            <select
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {EVENTS.map((event) => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Секрет (опционально)</label>
            <input
              type="text"
              value={form.secret}
              onChange={(e) => setForm({ ...form, secret: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="для подписи X-Webhook-Signature"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? 'Сохранение...' : 'Добавить вебхук'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Событие</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Активен</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {webhooks.map((webhook) => (
              <tr key={webhook.id}>
                <td className="px-4 py-2 text-sm text-gray-900 break-all">{webhook.url}</td>
                <td className="px-4 py-2 text-sm text-gray-500">{webhook.event}</td>
                <td className="px-4 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={webhook.is_active}
                    onChange={(e) => handleToggle(webhook.id, e.target.checked)}
                  />
                </td>
                <td className="px-4 py-2 text-sm text-right">
                  <button onClick={() => handleDelete(webhook.id)} className="text-red-600 hover:underline">
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
            {webhooks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  Вебхуки не настроены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
