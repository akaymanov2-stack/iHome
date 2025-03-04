'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({ author: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function loadComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading comments:', error);
    } else {
      setComments(data || []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          author: newComment.author,
          content: newComment.content
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
    } else {
      setComments([data, ...comments]);
      setNewComment({ author: '', content: '' });
    }
  }

  if (loading) {
    return <div className="animate-pulse">Загрузка комментариев...</div>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Комментарии</h3>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ваше имя</label>
            <input
              type="text"
              value={newComment.author}
              onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Комментарий</label>
            <textarea
              value={newComment.content}
              onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Отправить
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <span>{comment.author}</span>
              <span className="mx-2">•</span>
              <span>{new Date(comment.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
            <p className="text-gray-900">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 