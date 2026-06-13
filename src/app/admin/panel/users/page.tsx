'use client';

import { useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  identifier: string;
  username: string | null;
  display_name: string | null;
  role: string;
  created_at: string;
}

const ROLES = ['reader', 'author', 'editor', 'admin'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const adminIdentifier = typeof window !== 'undefined' ? localStorage.getItem('adminIdentifier') : null;

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?identifier=${encodeURIComponent(adminIdentifier ?? '')}`);
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      setError('Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(id: string, role: string) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: adminIdentifier, role }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch {
      setError('Не удалось обновить роль');
    } finally {
      setSavingId(null);
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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {error && <div className="p-4 bg-red-100 text-red-700">{error}</div>}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Идентификатор</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Имя пользователя</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Регистрация</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-2 text-sm text-gray-900">{user.identifier}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{user.username ?? '—'}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{user.display_name ?? '—'}</td>
              <td className="px-4 py-2 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-sm">
                <select
                  value={user.role}
                  disabled={savingId === user.id}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="border rounded p-1"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
