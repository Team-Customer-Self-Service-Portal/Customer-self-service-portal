import api from './axios';
import { ApiResponse, Article, ArticleFilters, CreateArticleInput, PaginatedResponse, UpdateArticleInput } from '@/types';

export const getArticles = async (params: ArticleFilters): Promise<PaginatedResponse<Article>> => {
  const res = await api.get<PaginatedResponse<Article>>('/knowledge', { params });
  return res.data;
};

export const getArticle = async (id: string): Promise<Article> => {
  const res = await api.get<ApiResponse<Article>>(`/knowledge/${id}`);
  return res.data.data;
};

export const voteHelpful = async (id: string): Promise<Article> => {
  const res = await api.post<ApiResponse<Article>>(`/knowledge/${id}/helpful`, { vote: 'helpful' });
  return res.data.data;
};

export const createArticle = async (data: CreateArticleInput): Promise<Article> => {
  const res = await api.post<ApiResponse<Article>>('/knowledge', data);
  return res.data.data;
};

export const updateArticle = async (id: string, data: UpdateArticleInput): Promise<Article> => {
  const res = await api.put<ApiResponse<Article>>(`/knowledge/${id}`, data);
  return res.data.data;
};
