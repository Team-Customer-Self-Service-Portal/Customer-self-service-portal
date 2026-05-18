import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from './constants';

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

interface QueryLike<T> {
  skip(n: number): QueryLike<T>;
  limit(n: number): QueryLike<T>;
  exec(): Promise<T[]>;
  model: {
    countDocuments(filter: Record<string, unknown>): { exec(): Promise<number> };
  };
  getFilter(): Record<string, unknown>;
}

export const paginate = async <T>(query: QueryLike<T>, page = 1, limit = PAGINATION_DEFAULT_LIMIT): Promise<PaginationResult<T>> => {
  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), PAGINATION_MAX_LIMIT);
  const skip = (safePage - 1) * safeLimit;
  const [data, total] = await Promise.all([
    query.skip(skip).limit(safeLimit).exec(),
    query.model.countDocuments(query.getFilter()).exec(),
  ]);

  return {
    data,
    total,
    page: safePage,
    pages: Math.max(Math.ceil(total / safeLimit), 1),
  };
};

export const generateCaseNumber = (): string => `CS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

type WithOptionalPassword = { password?: string };
type WithToObject<T> = { toObject: () => T };

export const sanitizeUser = <T extends WithOptionalPassword>(user: T | WithToObject<T>): Omit<T, 'password'> => {
  const maybeDoc = user as Partial<WithToObject<T>>;
  const plain: T = typeof maybeDoc.toObject === 'function' ? maybeDoc.toObject() : (user as T);
  const { password, ...sanitized } = plain;
  return sanitized;
};
