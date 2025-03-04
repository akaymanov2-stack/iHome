import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:categories(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching blog posts:', error);
      return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error in blog posts API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('blog_posts')
      .insert([
        {
          title: body.title,
          content: body.content,
          author: body.author,
          image_url: body.image_url,
          category_id: body.category_id,
          tags: body.tags,
          updated_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        category:categories(*)
      `)
      .single();

    if (error) {
      console.error('Error creating blog post:', error);
      return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in blog post creation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 