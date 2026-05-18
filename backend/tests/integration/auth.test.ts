import request from 'supertest';
import { app } from '../../src/server';

describe('auth integration', () => {
  it('register/login/me/logout flow', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      email: 'john@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'Password123',
    });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.token;

    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe('john@example.com');

    const logoutRes = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
    expect(logoutRes.status).toBe(200);
  });

  it('forgot-password endpoint responds successfully', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'reset@example.com',
      password: 'Password123',
      firstName: 'Reset',
      lastName: 'User',
    });

    const forgotRes = await request(app).post('/api/auth/forgot-password').send({ email: 'reset@example.com' });
    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.success).toBe(true);
  });
});
