import apiClient from './api-client';
import {
  Category,
  Tag,
  CommunityPost,
  CommunityPostListResponse,
  CommunityPostFilterParams,
  CommentItem,
  CommentListResponse,
  LikeResponse,
  SaveResponse,
  Collection,
  CollectionListResponse,
  AutocompleteSuggestion,
  ReportCreatePayload,
  ReportResponse,
} from '@/types/community';


function mapCategory(c: any): Category {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    createdAt: c.created_at,
  };
}

function mapTag(t: any): Tag {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    createdAt: t.created_at,
  };
}

function mapComment(raw: any): CommentItem {
  return {
    id: raw.id,
    postId: raw.post_id,
    userId: raw.user_id,
    parentId: raw.parent_id,
    content: raw.content,
    author: raw.author
      ? {
          id: raw.author.id,
          username: raw.author.username,
          email: raw.author.email,
          avatarUrl: raw.author.avatar_url,
        }
      : undefined,
    replies: (raw.replies || []).map(mapComment),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapPost(raw: any): CommunityPost {
  return {
    id: raw.id,
    authorId: raw.author_id,
    author: raw.author
      ? {
          id: raw.author.id,
          username: raw.author.username,
          email: raw.author.email,
          avatarUrl: raw.author.avatar_url,
        }
      : undefined,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt,
    content: raw.content,
    coverImageUrl: raw.cover_image_url,
    status: raw.status,
    visibility: raw.visibility,
    readingTime: raw.reading_time ?? 1,
    viewCount: raw.view_count ?? 0,
    giftItemId: raw.gift_item_id,
    likesCount: raw.likes_count ?? 0,
    commentsCount: raw.comments_count ?? 0,
    isLiked: raw.is_liked ?? false,
    isSaved: raw.is_saved ?? false,
    categories: (raw.categories || []).map(mapCategory),
    tags: (raw.tags || []).map(mapTag),
    images: (raw.images || []).map((img: any) => ({
      id: img.id,
      postId: img.post_id,
      imageUrl: img.image_url,
      altText: img.alt_text,
      displayOrder: img.display_order ?? 0,
    })),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapCollection(raw: any): Collection {
  return {
    id: raw.id,
    userId: raw.user_id,
    author: raw.author
      ? {
          id: raw.author.id,
          username: raw.author.username,
          email: raw.author.email,
          avatarUrl: raw.author.avatar_url,
        }
      : undefined,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    isPublic: raw.is_public ?? true,
    coverImageUrl: raw.cover_image_url,
    postsCount: raw.posts_count ?? (raw.posts?.length || 0),
    posts: (raw.posts || []).map(mapPost),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export async function getPosts(
  params: CommunityPostFilterParams = {}
): Promise<CommunityPostListResponse> {
  const queryParams: Record<string, any> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    sort_by: params.sortBy ?? 'created_at',
    sort_order: params.sortOrder ?? 'desc',
  };

  if (params.status) queryParams.status = params.status;
  if (params.visibility) queryParams.visibility = params.visibility;
  if (params.categoryId) queryParams.category_id = params.categoryId;
  if (params.tagId) queryParams.tag_id = params.tagId;
  if (params.authorId) queryParams.author_id = params.authorId;
  if (params.search) queryParams.search = params.search;
  if (params.dateRange) queryParams.date_range = params.dateRange;
  if (params.readingTimeBucket) queryParams.reading_time_bucket = params.readingTimeBucket;

  const res = await apiClient.get('/community/posts', { params: queryParams });
  const data = res.data;

  return {
    items: (data.items || []).map(mapPost),
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 10,
    pages: data.pages ?? 1,
  };
}

export async function getPostBySlugOrId(idOrSlug: string): Promise<CommunityPost> {
  const res = await apiClient.get(`/community/posts/${encodeURIComponent(idOrSlug)}`);
  return mapPost(res.data);
}

export async function getCategories(): Promise<Category[]> {
  const res = await apiClient.get('/community/categories');
  return (res.data || []).map(mapCategory);
}

export async function getTags(): Promise<Tag[]> {
  const res = await apiClient.get('/community/tags');
  return (res.data || []).map(mapTag);
}

export async function createPost(payload: {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  status?: string;
  visibility?: string;
  category_ids?: string[];
  tag_ids?: string[];
  images?: Array<{ image_url: string; alt_text?: string; display_order?: number }>;
}): Promise<CommunityPost> {
  const res = await apiClient.post('/community/posts', payload);
  return mapPost(res.data);
}

export async function updatePost(
  postId: string,
  payload: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    cover_image_url?: string;
    status?: string;
    visibility?: string;
    category_ids?: string[];
    tag_ids?: string[];
    images?: Array<{ image_url: string; alt_text?: string; display_order?: number }>;
  }
): Promise<CommunityPost> {
  const res = await apiClient.put(`/community/posts/${postId}`, payload);
  return mapPost(res.data);
}

export async function publishPost(postId: string): Promise<CommunityPost> {
  const res = await apiClient.post(`/community/posts/${postId}/publish`);
  return mapPost(res.data);
}

export async function archivePost(postId: string): Promise<CommunityPost> {
  const res = await apiClient.post(`/community/posts/${postId}/archive`);
  return mapPost(res.data);
}

export async function deletePost(postId: string): Promise<void> {
  await apiClient.delete(`/community/posts/${postId}`);
}

export async function uploadImage(file: File, folder: string = 'community'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await apiClient.post('/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data.url;
}

// --- Likes & Saves ---
export async function likePost(postId: string): Promise<LikeResponse> {
  const res = await apiClient.post(`/community/posts/${postId}/like`);
  return {
    liked: res.data.liked,
    likesCount: res.data.likes_count,
  };
}

export async function unlikePost(postId: string): Promise<LikeResponse> {
  const res = await apiClient.delete(`/community/posts/${postId}/like`);
  return {
    liked: res.data.liked,
    likesCount: res.data.likes_count,
  };
}

export async function savePost(postId: string): Promise<SaveResponse> {
  const res = await apiClient.post(`/community/posts/${postId}/save`);
  return { saved: res.data.saved };
}

export async function unsavePost(postId: string): Promise<SaveResponse> {
  const res = await apiClient.delete(`/community/posts/${postId}/save`);
  return { saved: res.data.saved };
}

export async function getSavedPosts(page: number = 1, limit: number = 10): Promise<CommunityPostListResponse> {
  const res = await apiClient.get('/community/saved', { params: { page, limit } });
  const data = res.data;
  return {
    items: (data.items || []).map(mapPost),
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 10,
    pages: data.pages ?? 1,
  };
}

export async function recordShare(postId: string): Promise<void> {
  await apiClient.post(`/community/posts/${postId}/share`);
}

// --- Comments ---
export async function getComments(postId: string, page: number = 1, limit: number = 10): Promise<CommentListResponse> {
  const res = await apiClient.get(`/community/posts/${postId}/comments`, { params: { page, limit } });
  const data = res.data;
  return {
    items: (data.items || []).map(mapComment),
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 10,
    pages: data.pages ?? 1,
  };
}

export async function createComment(postId: string, content: string, parentId?: string): Promise<CommentItem> {
  const res = await apiClient.post(`/community/posts/${postId}/comments`, {
    content,
    parent_id: parentId || null,
  });
  return mapComment(res.data);
}

export async function updateComment(commentId: string, content: string): Promise<CommentItem> {
  const res = await apiClient.put(`/community/comments/${commentId}`, { content });
  return mapComment(res.data);
}

export async function deleteComment(commentId: string): Promise<void> {
  await apiClient.delete(`/community/comments/${commentId}`);
}

// --- Collections ---
export async function createCollection(payload: {
  title: string;
  slug?: string;
  description?: string;
  is_public?: boolean;
  cover_image_url?: string;
}): Promise<Collection> {
  const res = await apiClient.post('/community/collections', payload);
  return mapCollection(res.data);
}

export async function updateCollection(
  collectionId: string,
  payload: {
    title?: string;
    slug?: string;
    description?: string;
    is_public?: boolean;
    cover_image_url?: string;
  }
): Promise<Collection> {
  const res = await apiClient.put(`/community/collections/${collectionId}`, payload);
  return mapCollection(res.data);
}

export async function deleteCollection(collectionId: string): Promise<void> {
  await apiClient.delete(`/community/collections/${collectionId}`);
}

export async function getCollections(page: number = 1, limit: number = 10, userId?: string): Promise<CollectionListResponse> {
  const params: Record<string, any> = { page, limit };
  if (userId) params.user_id = userId;
  const res = await apiClient.get('/community/collections', { params });
  const data = res.data;
  return {
    items: (data.items || []).map(mapCollection),
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 10,
    pages: data.pages ?? 1,
  };
}

export async function getMyCollections(page: number = 1, limit: number = 10): Promise<CollectionListResponse> {
  const res = await apiClient.get('/community/collections/my', { params: { page, limit } });
  const data = res.data;
  return {
    items: (data.items || []).map(mapCollection),
    total: data.total ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 10,
    pages: data.pages ?? 1,
  };
}

export async function getCollectionBySlugOrId(idOrSlug: string): Promise<Collection> {
  const res = await apiClient.get(`/community/collections/${encodeURIComponent(idOrSlug)}`);
  return mapCollection(res.data);
}

export async function addPostToCollection(collectionId: string, postId: string): Promise<void> {
  await apiClient.post(`/community/collections/${collectionId}/posts/${postId}`);
}

export async function removePostFromCollection(collectionId: string, postId: string): Promise<void> {
  await apiClient.delete(`/community/collections/${collectionId}/posts/${postId}`);
}

// --- Autocomplete Search ---
export async function autocompleteSearch(query: string): Promise<AutocompleteSuggestion[]> {
  if (!query || query.trim().length < 2) return [];
  const res = await apiClient.get('/community/search/autocomplete', { params: { q: query } });
  return res.data.suggestions || [];
}

// --- Reporting ---
export async function submitReport(payload: ReportCreatePayload): Promise<ReportResponse> {
  const res = await apiClient.post('/community/reports', payload);
  const data = res.data;
  return {
    id: data.id,
    reporterId: data.reporter_id,
    targetType: data.target_type,
    targetId: data.target_id,
    reason: data.reason,
    details: data.details,
    status: data.status,
    createdAt: data.created_at,
  };
}

