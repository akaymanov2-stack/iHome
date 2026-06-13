'use client';

import { useEffect, useState } from 'react';

interface AuditEntry {
  id: string;
  actor_id: string | null;
  actor_identifier: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const adminIdentifier = typeof window !== 'undefined' ? localStorage.getItem('adminIdentifier') : null;

  useEffect(() => {
    fetch(`/api/admin/audit?identifier=${encodeURIComponent(adminIdentifier ?? '')}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setEntries)
      .catch(() => setError('Не удалось загрузить журнал аудита'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Журнал аудита</h2>
      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Время</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Действие</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Объект</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Кто</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Детали</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(entry.created_at).toLocaleString('ru-RU')}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{entry.action}</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {entry.entity_type}
                  {entry.entity_id ? ` #${entry.entity_id.slice(0, 8)}` : ''}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">{entry.actor_identifier ?? '—'}</td>
                <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate" title={JSON.stringify(entry.details)}>
                  {entry.details ? JSON.stringify(entry.details) : '—'}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                  Записей пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
