import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { communityApi } from '@/api';
import { CreatePostInput, PostFilters } from '@/types';

export const useGetPosts = (filters: PostFilters) =>
  useQuery({ queryKey: ['posts', filters], queryFn: () => communityApi.getPosts(filters) });

export const useGetPost = (id: string) =>
  useQuery({ queryKey: ['post', id], queryFn: () => communityApi.getPost(id), enabled: Boolean(id) });

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostInput) => communityApi.createPost(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useAddComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, body }: { postId: string; body: string }) => communityApi.addComment(postId, body),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ['post', post._id] });
      toast.success('Comment added');
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useToggleUpvote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => communityApi.toggleUpvote(postId),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ['post', post._id] });
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useMarkAnswer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) => communityApi.markAnswer(postId, commentId),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ['post', post._id] });
      qc.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Marked as answer');
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
