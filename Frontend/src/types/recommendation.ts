export type StrategyLabel =
  | 'Top Pick'
  | 'Best Value'
  | 'Most Personalized'
  | 'Luxury Choice'
  | 'Unique Gift'
  | 'Handmade Idea'
  | 'Experience Gift'
  | 'Budget Friendly'
  | 'AI Generated Idea';

export interface RecommendationItem {
  id: string;
  gift_item_id?: string | null;
  title: string;
  category: string;
  estimated_price: number;
  currency: string;
  match_score: number;
  strategy_label: StrategyLabel;
  ai_reasoning: string;
  pros?: string[];
  cons?: string[];
  personalization_tips?: string;
  buy_url?: string;
  image_url?: string;
  is_fallback: boolean;
}

export interface RecipientSummary {
  key_traits?: string[];
  gifting_angle?: string;
  confidence_score?: number;
}

export interface AIRecommendationRecord {
  id: string;
  survey_id: string;
  user_id?: string;
  recipient_name?: string;
  occasion?: string;
  ai_model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  execution_time_ms: number;
  is_favorite: boolean;
  share_token?: string;
  summary?: {
    recipient_summary?: RecipientSummary;
    suggested_follow_up_questions?: string[];
  };
  created_at: string;
  items: RecommendationItem[];
}

export interface ShareResponse {
  success: boolean;
  share_token: string;
  share_url: string;
}
