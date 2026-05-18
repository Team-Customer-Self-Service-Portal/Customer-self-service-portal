import request from 'supertest';
import { app } from '../../src/server';

jest.mock('../../src/services/salesforce/salesforceService', () => ({
  salesforceService: {
    createCase: jest.fn().mockResolvedValue('sf-case-id'),
    updateCase: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('cases integration', () => {
  const registerAndLogin = async (email: string): Promise<string> => {
    await request(app).post('/api/auth/register').send({ email, password: 'Password123', firstName: 'Test', lastName: 'User' });
    const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'Password123' });
    return loginRes.body.data.token as string;
  };

  it('creates and lists own cases with pagination', async () => {
    const token = await registerAndLogin('case1@example.com');
    const createRes = await request(app).post('/api/cases').set('Authorization', `Bearer ${token}`).send({
      subject: 'Issue',
      description: 'Details',
      category: 'Technical',
      priority: 'High',
    });
    expect(createRes.status).toBe(201);

    const listRes = await request(app).get('/api/cases?page=1&limit=10').set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.pagination).toBeDefined();
  });

  it('enforces ownership checks for case retrieval', async () => {
    const ownerToken = await registerAndLogin('owner@example.com');
    const otherToken = await registerAndLogin('other@example.com');

    const createRes = await request(app).post('/api/cases').set('Authorization', `Bearer ${ownerToken}`).send({
      subject: 'Private',
      description: 'Only owner can access',
      category: 'General',
      priority: 'Low',
    });

    const caseId = createRes.body.data._id;
    const forbiddenRes = await request(app).get(`/api/cases/${caseId}`).set('Authorization', `Bearer ${otherToken}`);
    expect(forbiddenRes.status).toBe(403);
  });

  it('updates and comments on case', async () => {
    const token = await registerAndLogin('commenter@example.com');
    const createRes = await request(app).post('/api/cases').set('Authorization', `Bearer ${token}`).send({
      subject: 'Comment Target',
      description: 'Needs comment',
      category: 'Billing',
      priority: 'Medium',
    });
    const caseId = createRes.body.data._id;

    const updateRes = await request(app).put(`/api/cases/${caseId}`).set('Authorization', `Bearer ${token}`).send({ status: 'Open' });
    expect(updateRes.status).toBe(200);

    const commentRes = await request(app).post(`/api/cases/${caseId}/comments`).set('Authorization', `Bearer ${token}`).send({ text: 'First comment' });
    expect(commentRes.status).toBe(201);
    expect(commentRes.body.data.comments.length).toBe(1);
  });
});
