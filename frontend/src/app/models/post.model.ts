export interface Comment {
  id: number;
  content: string;
  post_id: number;
  author_id: number;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  is_misleading: boolean;
  created_at: string;
  comments: Comment[];
  likes_count: number;
  vibe_label?: string;
  vibe_emoji?: string;
}

export interface PostCreate {
  title: string;
  content: string;
}

export interface CommentCreate {
  content: string;
}
