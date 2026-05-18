import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { casesApi } from '@/api';
import { CaseFilters, CreateCaseInput, UpdateCaseInput } from '@/types';

export const useGetCases = (filters: CaseFilters) =>
  useQuery({ queryKey: ['cases', filters], queryFn: () => casesApi.getCases(filters) });

export const useGetCase = (id: string) =>
  useQuery({ queryKey: ['case', id], queryFn: () => casesApi.getCase(id), enabled: Boolean(id) });

export const useCreateCase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCaseInput) => casesApi.createCase(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Case created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateCase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCaseInput }) => casesApi.updateCase(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['cases'] });
      qc.invalidateQueries({ queryKey: ['case', vars.id] });
      toast.success('Case updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteCase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => casesApi.deleteCase(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cases'] });
      toast.success('Case deleted');
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useAddComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ caseId, text }: { caseId: string; text: string }) => casesApi.addComment(caseId, text),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['case', data._id] });
      toast.success('Comment added');
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
