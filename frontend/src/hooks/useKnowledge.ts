import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { knowledgeApi } from '@/api';
import { ArticleFilters } from '@/types';

export const useGetArticles = (filters: ArticleFilters) =>
  useQuery({ queryKey: ['articles', filters], queryFn: () => knowledgeApi.getArticles(filters) });

export const useGetArticle = (id: string) =>
  useQuery({ queryKey: ['article', id], queryFn: () => knowledgeApi.getArticle(id), enabled: Boolean(id) });

export const useVoteHelpful = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => knowledgeApi.voteHelpful(id),
    onSuccess: (article) => {
      qc.invalidateQueries({ queryKey: ['article', article._id] });
      qc.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Thanks for your feedback');
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
