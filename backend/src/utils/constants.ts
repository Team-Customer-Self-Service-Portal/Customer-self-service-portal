export const JWT_SECRET: string = process.env.JWT_SECRET || 'change-me-in-production';
export const JWT_EXPIRE: string = process.env.JWT_EXPIRE_TIME || '1d';

export enum CaseStatus {
  New = 'New',
  Open = 'Open',
  Pending = 'Pending',
  Resolved = 'Resolved',
  Closed = 'Closed',
}

export enum CasePriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export enum CaseCategory {
  Technical = 'Technical',
  Billing = 'Billing',
  Account = 'Account',
  General = 'General',
}

export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;
