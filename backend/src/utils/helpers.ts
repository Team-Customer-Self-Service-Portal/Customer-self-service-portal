export const generateCaseNumber = (count: number): string => {
  return `CASE-${String(count + 1).padStart(6, '0')}`;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const formatDate = (date: Date): string => {
  return new Date(date).toISOString();
};

export const calculatePagination = (page: number, limit: number, total: number) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };
};

export const generateRandomString = (length: number = 32): string => {
  return require('crypto').randomBytes(length).toString('hex');
};

export const hashString = (str: string): string => {
  return require('crypto').createHash('sha256').update(str).digest('hex');
};

export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
