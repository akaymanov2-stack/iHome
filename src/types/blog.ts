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
  author: string;
  image_url: string | null;
  category_id: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
} 