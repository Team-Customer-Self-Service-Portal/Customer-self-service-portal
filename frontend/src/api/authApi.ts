import api from './axios';
import { ApiResponse, LoginInput, RegisterInput, User } from '@/types';

interface AuthPayload {
  token: string;
  user: User;
}

export const register = async (data: RegisterInput): Promise<AuthPayload> => {
  const res = await api.post<ApiResponse<AuthPayload>>('/auth/register', data);
  return res.data.data;
};

export const login = async (data: LoginInput): Promise<AuthPayload> => {
  const res = await api.post<ApiResponse<AuthPayload>>('/auth/login', data);
  return res.data.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const getMe = async (): Promise<User> => {
  const res = await api.get<ApiResponse<User>>('/auth/me');
  return res.data.data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  await api.post('/auth/forgot-password', { email });
  return { message: 'If the account exists, reset instructions were sent.' };
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  await api.post('/auth/reset-password', { token, password });
  return { message: 'Password reset successful.' };
};
