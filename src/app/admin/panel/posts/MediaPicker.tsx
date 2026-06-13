'use client';

import { useEffect, useState } from 'react';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
}

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminIdentifier = localStorage.getItem('adminIdentifier');
    fetch(`/api/media?identifier=${encodeURIComponent(adminIdentifier ?? '')}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Выбор изображения из медиатеки</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            Закрыть
          </button>
        </div>
        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">Медиатека пуста</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.url)}
                className="border rounded overflow-hidden hover:ring-2 hover:ring-blue-500"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.filename} className="w-full h-24 object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
