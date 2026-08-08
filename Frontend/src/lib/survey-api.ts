import apiClient from './api-client';
import { SurveyStateData, SurveyRecord, SurveySubmitResponse } from '@/types/survey';

export async function createSurveyDraft(
  token?: string | null,
  surveyPayload?: Partial<SurveyStateData>
): Promise<SurveyRecord> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.post(
    '/surveys',
    {
      occasion: surveyPayload?.occasion || 'Other',
      min_budget: surveyPayload?.budget?.min || 0,
      max_budget: surveyPayload?.budget?.max || 100,
      status: 'draft',
      current_step: 1,
      survey_payload: surveyPayload || {},
    },
    { headers }
  );
  return response.data;
}

export async function updateSurveyDraft(
  surveyId: string,
  surveyPayload: SurveyStateData,
  currentStep: number,
  token?: string | null,
  status: string = 'draft'
): Promise<SurveyRecord> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.put(
    `/surveys/${surveyId}`,
    {
      occasion: surveyPayload.occasion || 'Other',
      min_budget: surveyPayload.budget.min,
      max_budget: surveyPayload.budget.max,
      status: status,
      current_step: currentStep,
      survey_payload: surveyPayload,
    },
    { headers }
  );
  return response.data;
}

export async function getActiveDraft(token?: string | null): Promise<SurveyRecord | null> {
  if (!token) return null;
  try {
    const response = await apiClient.get('/surveys/draft', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch {
    return null;
  }
}

export async function getSurveyById(
  surveyId: string,
  token?: string | null
): Promise<SurveyRecord> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.get(`/surveys/${surveyId}`, { headers });
  return response.data;
}

export async function getUserSurveys(
  token: string,
  statusFilter?: string
): Promise<SurveyRecord[]> {
  const params = statusFilter ? { status: statusFilter } : {};
  const response = await apiClient.get('/surveys', {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
}

export async function submitSurvey(
  surveyId: string,
  token?: string | null
): Promise<SurveySubmitResponse> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await apiClient.post(`/surveys/${surveyId}/submit`, {}, { headers });
  return response.data;
}

export async function deleteSurvey(
  surveyId: string,
  token?: string | null
): Promise<void> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  await apiClient.delete(`/surveys/${surveyId}`, { headers });
}
