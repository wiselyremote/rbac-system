import { authenticate } from '@/middlewares/auth';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const app = express();

// Sample route to test middleware
app.use(authenticate());
app.get('/protected', (req, res) => {
  res.status(200).json({ message: 'Success' });
});

describe('Authenticate Middleware', () => {
  it('should return 401 if authorization header is missing', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authorization header is missing');
  });

  it('should return 401 if token is missing', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer '); // No token after 'Bearer'
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token is missing');
  });

  it('should return 403 if token is invalid', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidToken');
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Invalid or expired token');
  });

  // This test should not work
  it('should allow access with valid token', async () => {
    const payload = { userId: '123', company: '', roles: ['admin'] };
    const token = jwt.sign(payload, 'secret', { expiresIn: '1h' });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Success');
  });
});
