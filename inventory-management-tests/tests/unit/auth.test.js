const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};

describe('Authentication & Authorization Tests', () => {
  describe('Role-based Access Control', () => {
    test('Admin can access all inventory endpoints', async () => {
      const adminToken = generateToken({ 
        userId: 1, 
        role: 'admin', 
        email: 'admin@test.com' 
      });

      const response = await request(app)
        .get('/api/admin/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
    });

    test('Manager can access inventory but not user management', async () => {
      const managerToken = generateToken({ 
        userId: 2, 
        role: 'manager', 
        email: 'manager@test.com' 
      });

      // Should access inventory
      const inventoryResponse = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${managerToken}`);
      expect(inventoryResponse.status).toBe(200);

      // Should not access user management
      const userResponse = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${managerToken}`);
      expect(userResponse.status).toBe(403);
    });

    test('User cannot access admin endpoints', async () => {
      const userToken = generateToken({ 
        userId: 3, 
        role: 'user', 
        email: 'user@test.com' 
      });

      const response = await request(app)
        .get('/api/admin/inventory')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Access denied. Admin role required.');
    });

    test('Invalid token should return 401', async () => {
      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });

    test('Missing token should return 401', async () => {
      const response = await request(app)
        .get('/api/inventory');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Access token required');
    });
  });

  describe('Token Validation', () => {
    test('Expired token should return 401', async () => {
      const expiredToken = jwt.sign(
        { userId: 1, role: 'admin' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Token expired');
    });

    test('Valid token should allow access', async () => {
      const validToken = generateToken({ 
        userId: 1, 
        role: 'admin',
        email: 'admin@test.com'
      });

      const response = await request(app)
        .get('/api/inventory')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
    });
  });
});
