process.env.JWT_SECRET = 'test_secret_key';

const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth.routes');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API', () => {
  it('should reject invalid email values', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/valid email/i);
  });

  it('should reject short passwords', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor@biotwin.ai', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/at least 8 characters/i);
  });

  it('should accept the demo credentials and issue a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'doctor@biotwin.ai', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('doctor@biotwin.ai');
  });
});
