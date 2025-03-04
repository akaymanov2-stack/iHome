import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching blog post:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
    }

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error in blog post API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 