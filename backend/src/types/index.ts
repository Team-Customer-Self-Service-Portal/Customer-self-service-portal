export * from './auth';
export * from './salesforce';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
}

export interface QueryFilters {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}
