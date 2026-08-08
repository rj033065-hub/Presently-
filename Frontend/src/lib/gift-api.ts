import apiClient from './api-client';
import {
  GiftItem,
  GiftListResponse,
  GiftCategory,
  GiftTag,
  CandidateMatchItem,
  SearchResponse,
} from '@/types/gift';

export async function getGifts(params?: {
  category?: string;
  tag?: string;
  q?: string;
  min_price?: number;
  max_price?: number;
  is_handmade?: boolean;
  gift_type?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}): Promise<GiftListResponse> {
  const response = await apiClient.get('/gifts', { params });
  return response.data;
}

export async function getGiftById(id: string): Promise<GiftItem> {
  const response = await apiClient.get(`/gifts/${id}`);
  return response.data;
}

export async function getCategories(): Promise<GiftCategory[]> {
  const response = await apiClient.get('/categories');
  return response.data;
}

export async function getTags(): Promise<GiftTag[]> {
  const response = await apiClient.get('/tags');
  return response.data;
}

export async function getTrendingGifts(limit: number = 10): Promise<GiftItem[]> {
  const response = await apiClient.get('/trending', { params: { limit } });
  return response.data;
}

export async function getFeaturedGifts(limit: number = 10): Promise<GiftItem[]> {
  const response = await apiClient.get('/featured', { params: { limit } });
  return response.data;
}

export async function searchGifts(q: string, limit: number = 20): Promise<SearchResponse> {
  const response = await apiClient.get('/search', { params: { q, limit } });
  return response.data;
}

export async function getRecommendationCandidates(
  surveyId: string,
  limit: number = 10
): Promise<CandidateMatchItem[]> {
  const response = await apiClient.get('/recommendation-candidates', {
    params: { survey_id: surveyId, limit },
  });
  return response.data;
}
