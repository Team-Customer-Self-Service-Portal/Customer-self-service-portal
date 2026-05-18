import mongoose from 'mongoose';

export const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
