import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: string;
  author_id?: string;
  image_url?: string;
  category_id: string;
  tags: string[];
  updated_at: string;
  category?: Category;
  author_user?: { avatar_url?: string | null } | null;
}

export interface CreateBlogPostInput {
  title: string;
  content: string;
  author: string;
  author_id?: string;
  image_url?: string;
  category_id: string;
  tags: string[];
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    throw new Error('Failed to fetch categories');
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:categories(*),
        author_user:users(avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    throw new Error('Failed to fetch blog posts');
  }
}

export async function createBlogPost(post: CreateBlogPostInput): Promise<BlogPost> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blog`, {
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
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:categories(*),
        author_user:users(avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching blog post:', error);
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getBlogPostById:', error);
    throw new Error('Failed to fetch blog post');
  }
} 