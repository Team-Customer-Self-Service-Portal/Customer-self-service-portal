import api from './axios';
import { ApiResponse, ChangePasswordInput, PaginatedResponse, PaginationParams, UpdateProfileInput, User } from '@/types';

export const getProfile = async (): Promise<User> => {
  const res = await api.get<ApiResponse<User>>('/users/profile');
  return res.data.data;
};

export const updateProfile = async (data: UpdateProfileInput): Promise<User> => {
  const res = await api.put<ApiResponse<User>>('/users/profile', data);
  return res.data.data;
};

export const changePassword = async (data: ChangePasswordInput): Promise<{ message: string }> => {
  await api.put('/users/change-password', data);
  return { message: 'Password updated successfully.' };
};

export const getUsers = async (params: PaginationParams): Promise<PaginatedResponse<User>> => {
  const res = await api.get<PaginatedResponse<User>>('/users', { params });
  return res.data;
};

export const updateUserRole = async (id: string, role: string): Promise<User> => {
  const res = await api.put<ApiResponse<User>>(`/users/${id}/role`, { role });
  return res.data.data;
};
