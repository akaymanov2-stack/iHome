import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching blog post with ID:', params.id);
    
    if (!params.id) {
      console.error('No post ID provided');
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    console.log('Making Supabase query...');
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
    }

    if (!post) {
      console.error('No post found with ID:', params.id);
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    console.log('Successfully fetched post:', post.id);
    return NextResponse.json(post);
  } catch (error) {
    console.error('Unexpected error in blog post API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 