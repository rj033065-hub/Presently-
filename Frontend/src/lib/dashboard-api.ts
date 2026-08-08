import { apiClient } from './api-client';

export interface UserActivity {
  id: string;
  activity_type: string;
  title: string;
  description?: string;
  target_url?: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_wishlists: number;
  saved_gifts: number;
  saved_recommendations: number;
  upcoming_occasions: number;
  community_posts: number;
  completed_surveys: number;
}

export interface UnfinishedSurvey {
  id: string;
  occasion: string;
  recipient_name?: string;
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  updated_at: string;
}

export interface RecentRecommendation {
  id: string;
  recommendation_id: string;
  gift_title: string;
  gift_image_url?: string;
  match_score: number;
  estimated_price: number;
  currency: string;
  ai_reasoning: string;
  recipient_name?: string;
  occasion?: string;
  is_favorite: boolean;
  buy_url?: string;
}

export interface UpcomingOccasion {
  id: string;
  recipient_name: string;
  recipient_relationship?: string;
  occasion: string;
  event_date: string;
  days_remaining: number;
  planned_budget: number;
  actual_spending: number;
  remaining_budget: number;
  currency: string;
  status: string;
}

export interface DashboardOverview {
  user_name: string;
  user_avatar?: string;
  metrics: DashboardMetrics;
  recent_activities: UserActivity[];
  unfinished_surveys: UnfinishedSurvey[];
  recommended_for_you: RecentRecommendation[];
  upcoming_occasions: UpcomingOccasion[];
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  gift_item_id: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  target_price?: number;
  status: 'considering' | 'planned' | 'purchased' | 'reserved';
  display_order: number;
  added_at: string;
  updated_at: string;
  gift_title?: string;
  gift_image_url?: string;
  gift_price?: number;
  buy_url?: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  share_token?: string;
  items: WishlistItem[];
  created_at: string;
  updated_at: string;
}

export interface GiftPlan {
  id: string;
  user_id: string;
  recipient_name: string;
  recipient_relationship?: string;
  occasion: string;
  event_date: string;
  days_remaining: number;
  planned_budget: number;
  actual_spending: number;
  remaining_budget: number;
  currency: string;
  status: 'planning' | 'gift_selected' | 'purchased' | 'delivered' | 'completed';
  gift_idea?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedItem {
  id: string;
  item_type: 'post' | 'collection' | 'gift';
  title: string;
  subtitle?: string;
  image_url?: string;
  target_url: string;
  created_at: string;
  metadata_json?: Record<string, any>;
}

// API Methods
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const data: any = await apiClient.get('/dashboard/overview');
  return data;
}

export async function getDashboardActivities(limit = 20, offset = 0): Promise<UserActivity[]> {
  const data: any = await apiClient.get(`/dashboard/activity?limit=${limit}&offset=${offset}`);
  return data;
}

// Wishlist APIs
export async function getWishlists(): Promise<Wishlist[]> {
  const data: any = await apiClient.get('/wishlists');
  return data;
}

export async function createWishlist(payload: { name: string; description?: string; is_public?: boolean }): Promise<Wishlist> {
  const data: any = await apiClient.post('/wishlists', payload);
  return data;
}

export async function updateWishlist(id: string, payload: { name?: string; description?: string; is_public?: boolean }): Promise<Wishlist> {
  const data: any = await apiClient.put(`/wishlists/${id}`, payload);
  return data;
}

export async function deleteWishlist(id: string): Promise<void> {
  await apiClient.delete(`/wishlists/${id}`);
}

export async function addWishlistItem(wishlistId: string, payload: { gift_item_id: string; notes?: string; priority?: string; target_price?: number; status?: string }): Promise<WishlistItem> {
  const data: any = await apiClient.post(`/wishlists/${wishlistId}/items`, payload);
  return data;
}

export async function updateWishlistItem(wishlistId: string, itemId: string, payload: { notes?: string; priority?: string; target_price?: number; status?: string; display_order?: number }): Promise<WishlistItem> {
  const data: any = await apiClient.put(`/wishlists/${wishlistId}/items/${itemId}`, payload);
  return data;
}

export async function removeWishlistItem(wishlistId: string, itemId: string): Promise<void> {
  await apiClient.delete(`/wishlists/${wishlistId}/items/${itemId}`);
}

export async function generateWishlistShareToken(wishlistId: string): Promise<{ share_token: string; share_url: string; is_public: boolean }> {
  const data: any = await apiClient.post(`/wishlists/${wishlistId}/share`, {});
  return data;
}

export async function disableWishlistSharing(wishlistId: string): Promise<void> {
  await apiClient.delete(`/wishlists/${wishlistId}/share`);
}

export async function getPublicWishlist(token: string): Promise<Wishlist> {
  const data: any = await apiClient.get(`/wishlists/public/${token}`);
  return data;
}

// Planner APIs
export async function getGiftPlans(): Promise<GiftPlan[]> {
  const data: any = await apiClient.get('/planner');
  return data;
}

export async function createGiftPlan(payload: Partial<GiftPlan>): Promise<GiftPlan> {
  const data: any = await apiClient.post('/planner', payload);
  return data;
}

export async function updateGiftPlan(id: string, payload: Partial<GiftPlan>): Promise<GiftPlan> {
  const data: any = await apiClient.put(`/planner/${id}`, payload);
  return data;
}

export async function deleteGiftPlan(id: string): Promise<void> {
  await apiClient.delete(`/planner/${id}`);
}

// Saved Content API
export async function getSavedContent(type?: 'post' | 'collection' | 'gift'): Promise<SavedItem[]> {
  const url = type ? `/saved?type=${type}` : '/saved';
  const data: any = await apiClient.get(url);
  return data;
}
