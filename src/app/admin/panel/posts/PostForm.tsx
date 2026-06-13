'use client';

import { useState } from 'react';
import { marked } from 'marked';
import type { BlogPost, Category, PostStatus } from '@/utils/supabase';
import MediaPicker from './MediaPicker';

export interface PostFormValues {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  image_url: string;
  category_id: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  og_image: string;
  status?: PostStatus;
  scheduled_at?: string | null;
}

export const STATUS_LABELS: Record<PostStatus, string> = {
  draft: 'Черновик',
  review: 'На проверке',
  scheduled: 'Запланировано',
  published: 'Опубликовано',
  archived: 'В архиве',
};

const AUTHOR_STATUSES: PostStatus[] = ['draft', 'review'];
const ALL_STATUSES: PostStatus[] = ['draft', 'review', 'scheduled', 'published', 'archived'];
export const ALL_POST_STATUSES = ALL_STATUSES;

function toLocalDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface PostFormProps {
  initial?: Partial<BlogPost>;
  categories: Category[];
  role: string;
  submitting: boolean;
  error?: string | null;
  submitLabel: string;
  onSubmit: (values: PostFormValues, imageFile: File | null) => void;
}

export default function PostForm({ initial, categories, role, submitting, error, submitLabel, onSubmit }: PostFormProps) {
  const currentStatus = initial?.status ?? 'draft';
  const canEditStatus = role !== 'author' || AUTHOR_STATUSES.includes(currentStatus);
  const availableStatuses = role === 'author' ? AUTHOR_STATUSES : ALL_STATUSES;

  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    content: initial?.content ?? '',
    excerpt: initial?.excerpt ?? '',
    author: initial?.author ?? '',
    image_url: initial?.image_url ?? '',
    category_id: initial?.category_id ?? '',
    tags: initial?.tags ?? [],
    meta_title: initial?.meta_title ?? '',
    meta_description: initial?.meta_description ?? '',
    og_image: initial?.og_image ?? '',
    status: (initial?.status ?? 'draft') as PostStatus,
    scheduled_at: toLocalDateTimeInput(initial?.scheduled_at),
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'image_url' | 'og_image' | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const values: PostFormValues = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      excerpt: form.excerpt,
      author: form.author,
      image_url: form.image_url,
      category_id: form.category_id,
      tags: form.tags,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      og_image: form.og_image,
    };

    if (canEditStatus) {
      values.status = form.status;
      values.scheduled_at = form.status === 'scheduled' && form.scheduled_at
        ? new Date(form.scheduled_at).toISOString()
        : null;
    }

    onSubmit(values, imageFile);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
      {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1">Заголовок</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Слаг (URL)</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          placeholder="сгенерируется автоматически из заголовка"
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Краткое описание</label>
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="w-full p-2 border rounded h-20"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium">Содержание (Markdown)</label>
          <button type="button" onClick={() => setPreview((p) => !p)} className="text-sm text-blue-600 hover:underline">
            {preview ? 'Редактировать' : 'Предпросмотр'}
          </button>
        </div>
        {preview ? (
          <div
            className="prose max-w-none border rounded p-3 min-h-[12rem]"
            dangerouslySetInnerHTML={{ __html: marked.parse(form.content) as string }}
          />
        ) : (
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full p-2 border rounded h-48 font-mono text-sm"
            required
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Автор</label>
        <input
          type="text"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Изображение</label>
        {form.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.image_url} alt="" className="h-24 mb-2 rounded object-cover" />
        )}
        <div className="flex items-center gap-2">
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
          <button
            type="button"
            onClick={() => setPickerTarget('image_url')}
            className="px-3 py-2 text-sm border rounded hover:bg-gray-50 whitespace-nowrap"
          >
            Из медиатеки
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Категория</label>
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Выберите категорию</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Теги (через запятую)</label>
        <input
          type="text"
          value={form.tags.join(', ')}
          onChange={(e) =>
            setForm({ ...form, tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Статус</label>
          {canEditStatus ? (
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as PostStatus })}
              className="w-full p-2 border rounded"
            >
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-2 text-sm text-gray-600 bg-gray-100 rounded">{STATUS_LABELS[currentStatus]}</div>
          )}
        </div>
        {canEditStatus && form.status === 'scheduled' && (
          <div>
            <label className="block text-sm font-medium mb-1">Дата публикации</label>
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}
      </div>

      <fieldset className="border rounded p-4 space-y-3">
        <legend className="text-sm font-medium px-1">SEO</legend>
        <div>
          <label className="block text-sm font-medium mb-1">Meta-заголовок</label>
          <input
            type="text"
            value={form.meta_title}
            onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Meta-описание</label>
          <textarea
            value={form.meta_description}
            onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
            className="w-full p-2 border rounded h-20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">OG-изображение (URL)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={form.og_image}
              onChange={(e) => setForm({ ...form, og_image: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <button
              type="button"
              onClick={() => setPickerTarget('og_image')}
              className="px-3 py-2 text-sm border rounded hover:bg-gray-50 whitespace-nowrap"
            >
              Из медиатеки
            </button>
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {submitting ? 'Сохранение...' : submitLabel}
      </button>

      {pickerTarget && (
        <MediaPicker
          onClose={() => setPickerTarget(null)}
          onSelect={(url) => {
            setForm((f) => ({ ...f, [pickerTarget]: url }));
            setPickerTarget(null);
          }}
        />
      )}
    </form>
  );
}
