const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jqcatuxejatjiuliqsel.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxY2F0dXhlamF0aml1bGlxc2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNjg2NzIsImV4cCI6MjA1NjY0NDY3Mn0.sIAJHiXKIE-Ok3mYnsJ8oThdgGd-LhfnXQ-FaRD_odU'
);

async function createPost() {
  const post = {
    title: 'Что такое Web3 и почему это важно?',
    content: 'Web3 представляет собой новое поколение интернета, основанное на блокчейн-технологиях. В отличие от Web2, где данные централизованно контролируются крупными компаниями, Web3 предлагает децентрализованный подход. Пользователи получают полный контроль над своими данными и могут участвовать в управлении платформами через токены и DAO. Это создает более справедливую и прозрачную цифровую экономику.',
    author: 'Александр Петров',
    image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop'
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([post])
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Post created:', data);
  }
}

createPost(); 