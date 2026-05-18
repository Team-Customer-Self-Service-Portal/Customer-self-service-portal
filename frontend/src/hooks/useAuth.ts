import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '@/api';
import { LoginInput, RegisterInput } from '@/types';
import { AppDispatch, RootState } from '@/store';
import { logout as logoutAction, setCredentials, setLoading } from '@/store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (data: LoginInput) => {
      dispatch(setLoading(true));
      try {
        const payload = await authApi.login(data);
        dispatch(setCredentials(payload));
        navigate('/dashboard');
        toast.success('Logged in successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Login failed');
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async (data: RegisterInput) => {
      dispatch(setLoading(true));
      try {
        const payload = await authApi.register(data);
        dispatch(setCredentials(payload));
        navigate('/dashboard');
        toast.success('Account created successfully');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Registration failed');
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout server failure
    }
    dispatch(logoutAction());
    navigate('/login');
  }, [dispatch, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent' || user?.role === 'admin',
    login,
    register,
    logout,
  };
};
