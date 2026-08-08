export type PostStatus = 'Draft' | 'Published' | 'Archived';
export type PostVisibility = 'Public' | 'Private' | 'Unlisted';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface PostImage {
  id: string;
  postId: string;
  imageUrl: string;
  altText?: string;
  displayOrder: number;
}

export interface Author {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface CommentAuthor {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface CommentItem {
  id: string;
  postId: string;
  userId: string;
  parentId?: string;
  content: string;
  author?: CommentAuthor;
  replies?: CommentItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface CommentListResponse {
  items: CommentItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

export interface SaveResponse {
  saved: boolean;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  author?: Author;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  status: PostStatus;
  visibility: PostVisibility;
  readingTime: number;
  viewCount: number;
  giftItemId?: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  categories: Category[];
  tags: Tag[];
  images: PostImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostListResponse {
  items: CommunityPost[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Collection {
  id: string;
  userId: string;
  author?: Author;
  title: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  coverImageUrl?: string;
  postsCount: number;
  posts: CommunityPost[];
  createdAt: string;
  updatedAt: string;
}

export interface CollectionListResponse {
  items: Collection[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AutocompleteSuggestion {
  type: 'post' | 'category' | 'tag' | 'gift' | 'author';
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  imageUrl?: string;
}

export interface CommunityPostFilterParams {
  page?: number;
  limit?: number;
  status?: PostStatus;
  visibility?: PostVisibility;
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  sortBy?: 'created_at' | 'view_count' | 'reading_time' | 'title' | 'likes_count';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  dateRange?: 'today' | 'this_week' | 'this_month' | 'this_year';
  readingTimeBucket?: 'short' | 'medium' | 'long';
}

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'hate_speech'
  | 'misinformation'
  | 'other';

export interface ReportCreatePayload {
  target_type: 'post' | 'comment' | 'user';
  target_id: string;
  reason: string;
  details?: string;
}

export interface ReportResponse {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
  status: string;
  createdAt: string;
}
