import api from './axios';
import { ApiResponse, Case, CaseFilters, CreateCaseInput, PaginatedResponse, UpdateCaseInput } from '@/types';

export const getCases = async (params: CaseFilters): Promise<PaginatedResponse<Case>> => {
  const res = await api.get<PaginatedResponse<Case>>('/cases', { params });
  return res.data;
};

export const getCase = async (id: string): Promise<Case> => {
  const res = await api.get<ApiResponse<Case>>(`/cases/${id}`);
  return res.data.data;
};

export const createCase = async (data: CreateCaseInput): Promise<Case> => {
  const res = await api.post<ApiResponse<Case>>('/cases', data);
  return res.data.data;
};

export const updateCase = async (id: string, data: UpdateCaseInput): Promise<Case> => {
  const res = await api.put<ApiResponse<Case>>(`/cases/${id}`, data);
  return res.data.data;
};

export const deleteCase = async (id: string): Promise<void> => {
  await api.delete(`/cases/${id}`);
};

export const addComment = async (caseId: string, text: string): Promise<Case> => {
  const res = await api.post<ApiResponse<Case>>(`/cases/${caseId}/comments`, { text });
  return res.data.data;
};
