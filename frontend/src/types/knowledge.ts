export interface Article {
  _id: string;
  title: string;
  body: string;
  summary: string;
  category: string;
  tags: string[];
  publishedAt?: string;
  viewCount: number;
  helpful: number;
  notHelpful: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleFilters {
  q?: string;
  category?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

export interface CreateArticleInput {
  title: string;
  body: string;
  summary: string;
  category: string;
  tags?: string[];
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {}
