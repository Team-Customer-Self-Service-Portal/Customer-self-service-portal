export type CommunityStatus = 'open' | 'answered' | 'closed';

export interface CommunityComment {
  _id: string;
  body: string;
  authorId: string;
  upvotes: string[];
  createdAt: string;
  isAnswer: boolean;
}

export interface Post {
  _id: string;
  title: string;
  body: string;
  authorId: string;
  category: string;
  tags: string[];
  views: number;
  upvotes: string[];
  status: CommunityStatus;
  comments: CommunityComment[];
  createdAt: string;
  updatedAt: string;
}

export interface PostFilters {
  category?: string;
  status?: CommunityStatus;
  tags?: string;
  page?: number;
  limit?: number;
}

export interface CreatePostInput {
  title: string;
  body: string;
  category: string;
  tags?: string[];
}
