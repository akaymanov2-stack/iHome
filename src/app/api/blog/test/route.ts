import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const testPost = {
    title: 'Что такое Web3 и почему это важно?',
    content: 'Web3 представляет собой новое поколение интернета, основанное на блокчейн-технологиях. В отличие от Web2, где данные централизованно контролируются крупными компаниями, Web3 предлагает децентрализованный подход. Пользователи получают полный контроль над своими данными и могут участвовать в управлении платформами через токены и DAO. Это создает более справедливую и прозрачную цифровую экономику.',
    author: 'Александр Петров',
    image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop'
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([testPost])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
} 