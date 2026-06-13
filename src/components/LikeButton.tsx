'use client';

import { useEffect, useState } from 'react';

interface LikeButtonProps {
  postId: string;
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const identifier = localStorage.getItem('adminIdentifier');
    const params = new URLSearchParams({ post_id: postId });
    if (identifier) params.set('identifier', identifier);

    fetch(`/api/likes?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setLiked(data.liked);
          setCount(data.count);
        }
      });
  }, [postId]);

  async function handleClick() {
    const identifier = localStorage.getItem('adminIdentifier');
    if (!identifier) {
      window.location.href = '/admin/login';
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, post_id: postId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.count);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors disabled:opacity-50 ${
        liked ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span>{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </button>
  );
}
