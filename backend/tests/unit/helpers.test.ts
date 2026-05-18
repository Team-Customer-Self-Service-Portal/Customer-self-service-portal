import { generateCaseNumber, sanitizeUser } from '../../src/utils/helpers';

describe('helpers', () => {
  it('generateCaseNumber returns expected format', () => {
    expect(generateCaseNumber()).toMatch(/^CS-\d{13}-\d{4}$/);
  });

  it('sanitizeUser removes password', () => {
    const user = { email: 'a@b.com', password: 'secret', firstName: 'A' };
    const sanitized = sanitizeUser(user);
    expect((sanitized as { password?: string }).password).toBeUndefined();
    expect(sanitized.email).toBe('a@b.com');
  });

  it('paginate shape validation via mocked query', async () => {
    const query = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      model: { countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(2) }) },
      getFilter: jest.fn().mockReturnValue({}),
    };
    const { paginate } = await import('../../src/utils/helpers');
    const result = await paginate(query as never, 1, 20);
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.pages).toBe(1);
  });
});
