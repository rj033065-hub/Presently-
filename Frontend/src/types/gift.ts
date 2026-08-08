export interface GiftCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_name?: string;
  parent_id?: string | null;
}

export interface GiftTag {
  id: string;
  name: string;
  slug: string;
}

export interface GiftItem {
  id: string;
  title: string;
  slug: string;
  brand?: string;
  short_description?: string;
  description: string;
  estimated_price: number;
  currency: string;
  category_id: string;
  affiliate_url: string;
  purchase_url?: string;
  merchant_name: string;
  primary_image_url: string;
  is_verified: boolean;
  is_handmade: boolean;
  gift_type: 'Physical' | 'Digital' | 'Experience' | 'Subscription';
  shipping_info?: string;
  personalization_options?: string;
  popularity_score: number;
  rating_avg: number;
  rating_count: number;
  suitable_occasions?: string[];
  suitable_relationships?: string[];
  suitable_interests?: string[];
  suitable_personalities?: string[];
  created_at: string;
  category?: GiftCategory;
  tags?: GiftTag[];
}

export interface GiftListResponse {
  total: number;
  page: number;
  limit: number;
  items: GiftItem[];
}

export interface CandidateMatchItem {
  gift: GiftItem;
  match_score: number;
  strategy_label: string;
  reasoning: string;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  suggestions: string[];
  categories: { id: string; name: string; slug: string }[];
  gifts: GiftItem[];
}
