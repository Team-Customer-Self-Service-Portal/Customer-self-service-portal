import api from './axios';
import { ApiResponse, CreatePostInput, PaginatedResponse, Post, PostFilters } from '@/types';

export const getPosts = async (params: PostFilters): Promise<PaginatedResponse<Post>> => {
  const res = await api.get<PaginatedResponse<Post>>('/community', { params });
  return res.data;
};

export const getPost = async (id: string): Promise<Post> => {
  const res = await api.get<ApiResponse<Post>>(`/community/${id}`);
  return res.data.data;
};

export const createPost = async (data: CreatePostInput): Promise<Post> => {
  const res = await api.post<ApiResponse<Post>>('/community', data);
  return res.data.data;
};

export const addComment = async (postId: string, body: string): Promise<Post> => {
  const res = await api.post<ApiResponse<Post>>(`/community/${postId}/comments`, { body });
  return res.data.data;
};

export const toggleUpvote = async (postId: string): Promise<Post> => {
  const res = await api.put<ApiResponse<Post>>(`/community/${postId}/upvote`);
  return res.data.data;
};

export const markAnswer = async (postId: string, commentId: string): Promise<Post> => {
  const res = await api.put<ApiResponse<Post>>(`/community/${postId}/comments/${commentId}/answer`);
  return res.data.data;
};
