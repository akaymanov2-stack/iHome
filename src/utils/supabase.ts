import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: string;
  image_url?: string;
  category_id: string;
  tags: string[];
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    created_at: string;
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const response = await fetch('/api/blog');
  if (!response.ok) {
    throw new Error('Failed to fetch blog posts');
  }
  return response.json();
}

export async function createBlogPost(post: Omit<BlogPost, 'id' | 'created_at'>): Promise<BlogPost> {
  const response = await fetch('/api/blog', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    throw new Error('Failed to create blog post');
  }

  return response.json();
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const response = await fetch(`/api/blog/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch blog post');
  }
  return response.json();
} 