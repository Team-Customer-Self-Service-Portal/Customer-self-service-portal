import { format } from 'date-fns';

export const formatDateTime = (value: string): string => format(new Date(value), 'PPpp');
export const formatDate = (value: string): string => format(new Date(value), 'PP');
