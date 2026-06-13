'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { compressImage, checkImageSize } from '@/utils/imageCompression';

interface SocialLinks {
  website?: string;
  twitter?: string;
  github?: string;
}

interface Profile {
  identifier: string;
  created_at: string;
  avatar_url?: string | null;
  username?: string | null;
  display_name?: string | null;
  bio?: string | null;
  social_links?: SocialLinks;
  role: string;
  has_password: boolean;
}

export default function AccountProfile() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');

  const [usernameStatus, setUsernameStatus] = useState<{ available: boolean; error: string | null } | null>(null);
  const usernameCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveInfo, setSaveInfo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordInfo, setPasswordInfo] = useState<string | null>(null);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  useEffect(() => {
    const storedIdentifier = localStorage.getItem('adminIdentifier') || '';
    if (!storedIdentifier) {
      router.push('/admin/login');
      return;
    }
    setIdentifier(storedIdentifier);

    fetch(`/api/auth/profile?identifier=${encodeURIComponent(storedIdentifier)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Profile | null) => {
        if (!data) return;
        setProfile(data);
        setUsername(data.username || '');
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        setWebsite(data.social_links?.website || '');
        setTwitter(data.social_links?.twitter || '');
        setGithub(data.social_links?.github || '');
      });
  }, [router]);

  const handleUsernameChange = (value: string) => {
    const normalized = value.toLowerCase();
    setUsername(normalized);
    setUsernameStatus(null);

    if (usernameCheckTimer.current) clearTimeout(usernameCheckTimer.current);

    if (!normalized) return;

    usernameCheckTimer.current = setTimeout(async () => {
      const res = await fetch(
        `/api/account/username-check?username=${encodeURIComponent(normalized)}&identifier=${encodeURIComponent(identifier)}`
      );
      const result = await res.json();
      setUsernameStatus(result);
    }, 400);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveInfo(null);

    if (username && usernameStatus && !usernameStatus.available) {
      setSaveError(usernameStatus.error || 'Этот username уже занят');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          username: username || null,
          display_name: displayName || null,
          bio: bio || null,
          social_links: {
            ...(website ? { website } : {}),
            ...(twitter ? { twitter } : {}),
            ...(github ? { github } : {}),
          },
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setSaveError(result.error || 'Не удалось сохранить профиль');
        return;
      }

      setSaveInfo('Профиль сохранён');
      setProfile((prev) => (prev ? { ...prev, ...result } : prev));
    } catch {
      setSaveError('Не удалось сохранить профиль. Попробуйте позже');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError(null);
    setUploadingAvatar(true);

    try {
      const compressed = await compressImage(file);
      const sizeError = checkImageSize(compressed);
      if (sizeError) {
        setAvatarError(sizeError);
        return;
      }

      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('identifier', identifier);

      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (!res.ok) {
        setAvatarError(result.error || 'Не удалось загрузить фото');
        return;
      }

      setProfile((prev) => (prev ? { ...prev, avatar_url: result.avatar_url } : prev));
    } catch {
      setAvatarError('Не удалось загрузить фото. Попробуйте позже');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordInfo(null);
    setSubmittingPassword(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, currentPassword, newPassword }),
      });
      const result = await res.json();

      if (!res.ok) {
        setPasswordError(result.error || 'Не удалось изменить пароль');
        return;
      }

      setPasswordInfo('Пароль успешно изменён');
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      setPasswordError('Не удалось изменить пароль. Попробуйте позже');
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (!profile) {
    return <div className="text-sm text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Фото профиля</h3>

          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt="Фото профиля"
                className="w-16 h-16 rounded-full object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">
                ?
              </div>
            )}

            <div>
              <label className="inline-block text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                {uploadingAvatar ? 'Загрузка...' : 'Загрузить фото'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
              {avatarError && <p className="text-sm text-red-600 mt-1">{avatarError}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Профиль</h3>

          {saveError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{saveError}</div>
          )}
          {saveInfo && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{saveInfo}</div>
          )}

          <p className="text-sm text-gray-600">
            Email / телефон: <span className="font-medium text-gray-900">{profile.identifier}</span>
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="latin_letters_digits"
              className="w-full p-2 border rounded"
            />
            {usernameStatus && (
              <p className={`text-sm mt-1 ${usernameStatus.available ? 'text-green-600' : 'text-red-600'}`}>
                {usernameStatus.available ? 'Доступно' : usernameStatus.error}
              </p>
            )}
            {profile.username && (
              <p className="text-sm text-gray-500 mt-1">
                Публичный профиль: <a href={`/u/${profile.username}`} className="text-blue-600 hover:underline">/u/{profile.username}</a>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Отображаемое имя</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">О себе</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Сайт</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Twitter / X</label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://x.com/username"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">GitHub</label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пароль</h3>

          {profile.has_password ? (
            !showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Изменить пароль
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
                {passwordError && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{passwordError}</div>
                )}
                {passwordInfo && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{passwordInfo}</div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Текущий пароль</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Новый пароль</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingPassword ? 'Сохранение...' : 'Сохранить пароль'}
                </button>
              </form>
            )
          ) : (
            <p className="text-sm text-gray-500">
              У вас не установлен пароль — вход выполняется по ссылке на почту.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
