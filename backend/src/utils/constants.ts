export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export const ROLE = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUPPORT: 'support',
} as const;

export const CASE_STATUS = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  PENDING: 'Pending',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
} as const;

export const CASE_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
} as const;

export const CASE_TYPE = {
  QUESTION: 'Question',
  PROBLEM: 'Problem',
  FEATURE_REQUEST: 'Feature Request',
  BUG_REPORT: 'Bug Report',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const CACHE_TTL = {
  SHORT: 300,
  MEDIUM: 1800,
  LONG: 3600,
  VERY_LONG: 86400,
} as const;
