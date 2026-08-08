import apiClient from './api-client';
import { AIRecommendationRecord, ShareResponse } from '@/types/recommendation';

export async function generateRecommendations(
  surveyId: string,
  token?: string | null,
  forceRegenerate: boolean = false
): Promise<AIRecommendationRecord> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.post(
    '/recommendations/generate',
    {
      survey_id: surveyId,
      force_regenerate: forceRegenerate,
    },
    { headers }
  );
  return response.data;
}

export async function getRecommendationById(
  id: string,
  token?: string | null
): Promise<AIRecommendationRecord> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.get(`/recommendations/${id}`, { headers });
  return response.data;
}

export async function getSharedRecommendation(
  shareToken: string
): Promise<AIRecommendationRecord> {
  const response = await apiClient.get(`/recommendations/share/${shareToken}`);
  return response.data;
}

export async function getUserRecommendations(
  token: string,
  limit: number = 20,
  skip: number = 0
): Promise<AIRecommendationRecord[]> {
  const response = await apiClient.get('/recommendations', {
    headers: { Authorization: `Bearer ${token}` },
    params: { limit, skip },
  });
  return response.data;
}

export async function toggleFavorite(
  id: string,
  token?: string | null
): Promise<AIRecommendationRecord> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.post(`/recommendations/${id}/favorite`, {}, { headers });
  return response.data;
}

export async function regenerateRecommendation(
  id: string,
  token?: string | null
): Promise<AIRecommendationRecord> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.post(`/recommendations/${id}/regenerate`, {}, { headers });
  return response.data;
}

export async function shareRecommendation(
  id: string,
  token?: string | null
): Promise<ShareResponse> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.post(`/recommendations/${id}/share`, {}, { headers });
  return response.data;
}

export async function deleteRecommendation(
  id: string,
  token?: string | null
): Promise<void> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  await apiClient.delete(`/recommendations/${id}`, { headers });
}
