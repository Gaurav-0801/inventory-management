const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Inventory API Tests', () => {
  beforeEach(async () => {
    await prisma.inventory.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/inventory', () => {
    test('should return all inventory items', async () => {
      // Create test data
      await prisma.inventory.create({
        data: { name: 'Test Item 1', quantity: 10, price: 99.99 }
      });

      const response = await request(app).get('/api/inventory');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].name).toBe('Test Item 1');
    });

    test('should return empty array when no items exist', async () => {
      const response = await request(app).get('/api/inventory');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toHaveLength(0);
    });
  });

  describe('POST /api/inventory', () => {
    test('should create new inventory item', async () => {
      const newItem = { 
        name: 'New Test Item', 
        quantity: 15, 
        price: 149.99,
        category: 'Electronics'
      };

      const response = await request(app)
        .post('/api/inventory')
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Test Item');
      expect(response.body.quantity).toBe(15);
      expect(response.body.price).toBe(149.99);
    });

    test('should reject invalid item data', async () => {
      const invalidItem = { name: '', quantity: -1 };

      const response = await request(app)
        .post('/api/inventory')
        .send(invalidItem);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/inventory/:id', () => {
    test('should update existing item', async () => {
      const item = await prisma.inventory.create({
        data: { name: 'Original Item', quantity: 5, price: 50.00 }
      });

      const updateData = { quantity: 10, price: 75.00 };

      const response = await request(app)
        .put(`/api/inventory/${item.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(10);
      expect(response.body.price).toBe(75.00);
    });
  });

  describe('DELETE /api/inventory/:id', () => {
    test('should delete inventory item', async () => {
      const item = await prisma.inventory.create({
        data: { name: 'Item to Delete', quantity: 3, price: 25.00 }
      });

      const response = await request(app)
        .delete(`/api/inventory/${item.id}`);

      expect(response.status).toBe(204);

      // Verify item is deleted
      const deletedItem = await prisma.inventory.findUnique({
        where: { id: item.id }
      });
      expect(deletedItem).toBeNull();
    });
  });
});
