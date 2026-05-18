import mongoose from 'mongoose';
import { isValidEmail, isValidObjectId } from '../../src/utils/validators';

describe('validators', () => {
  it('validates object id', () => {
    expect(isValidObjectId(new mongoose.Types.ObjectId().toString())).toBe(true);
    expect(isValidObjectId('invalid')).toBe(false);
  });

  it('validates email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('bad-email')).toBe(false);
  });
});
