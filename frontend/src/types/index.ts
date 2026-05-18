export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ msg?: string; message?: string }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export * from './auth';
export * from './case';
export * from './knowledge';
export * from './community';
