const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Prisma Database Operations', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await prisma.inventory.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Inventory CRUD Operations', () => {
    test('Create and retrieve inventory item', async () => {
      const itemData = {
        name: 'Integration Test Item',
        quantity: 5,
        price: 29.99,
        category: 'Test Category',
        sku: 'TEST-001'
      };

      const createdItem = await prisma.inventory.create({
        data: itemData
      });

      expect(createdItem).toMatchObject(itemData);
      expect(createdItem.id).toBeDefined();

      const retrievedItem = await prisma.inventory.findUnique({
        where: { id: createdItem.id }
      });

      expect(retrievedItem).toMatchObject(itemData);
    });

    test('Update inventory item quantity', async () => {
      const item = await prisma.inventory.create({
        data: {
          name: 'Update Test Item',
          quantity: 10,
          price: 49.99,
          category: 'Electronics'
        }
      });

      const updatedItem = await prisma.inventory.update({
        where: { id: item.id },
        data: { quantity: 15 }
      });

      expect(updatedItem.quantity).toBe(15);
      expect(updatedItem.name).toBe('Update Test Item');
    });

    test('Delete inventory item', async () => {
      const item = await prisma.inventory.create({
        data: {
          name: 'Delete Test Item',
          quantity: 3,
          price: 19.99
        }
      });

      await prisma.inventory.delete({
        where: { id: item.id }
      });

      const deletedItem = await prisma.inventory.findUnique({
        where: { id: item.id }
      });

      expect(deletedItem).toBeNull();
    });
  });

  describe('Query Optimization Tests', () => {
    test('Batch create multiple items efficiently', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        name: `Bulk Item ${i + 1}`,
        quantity: Math.floor(Math.random() * 50) + 1,
        price: Math.round((Math.random() * 100) * 100) / 100,
        category: i % 2 === 0 ? 'Electronics' : 'Clothing'
      }));

      const startTime = Date.now();
      await prisma.inventory.createMany({
        data: items
      });
      const endTime = Date.now();

      const createdItems = await prisma.inventory.findMany();
      expect(createdItems).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('Optimized query with filters and pagination', async () => {
      // Create test data
      await prisma.inventory.createMany({
        data: [
          { name: 'Electronics Item 1', quantity: 10, price: 99.99, category: 'Electronics' },
          { name: 'Electronics Item 2', quantity: 5, price: 149.99, category: 'Electronics' },
          { name: 'Clothing Item 1', quantity: 20, price: 29.99, category: 'Clothing' },
          { name: 'Clothing Item 2', quantity: 15, price: 39.99, category: 'Clothing' }
        ]
      });

      const startTime = Date.now();
      const result = await prisma.inventory.findMany({
        where: {
          category: 'Electronics',
          quantity: { gte: 5 }
        },
        orderBy: { price: 'desc' },
        take: 10,
        skip: 0
      });
      const endTime = Date.now();

      expect(result).toHaveLength(2);
      expect(result[0].price).toBeGreaterThan(result[1].price);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    });
  });

  describe('Data Consistency Tests', () => {
    test('Transaction rollback on error', async () => {
      try {
        await prisma.$transaction([
          prisma.inventory.create({
            data: { name: 'Valid Item', quantity: 10, price: 50.00 }
          }),
          prisma.inventory.create({
            data: { name: '', quantity: -1, price: 0 } // Invalid data
          })
        ]);
      } catch (error) {
        // Transaction should fail and rollback
        expect(error).toBeDefined();
      }

      // Verify no items were created
      const items = await prisma.inventory.findMany();
      expect(items).toHaveLength(0);
    });

    test('Concurrent updates maintain data consistency', async () => {
      const item = await prisma.inventory.create({
        data: { name: 'Concurrent Test', quantity: 100, price: 25.00 }
      });

      // Simulate concurrent updates
      const updates = Array.from({ length: 10 }, (_, i) =>
        prisma.inventory.update({
          where: { id: item.id },
          data: { quantity: { increment: 1 } }
        })
      );

      await Promise.all(updates);

      const finalItem = await prisma.inventory.findUnique({
        where: { id: item.id }
      });

      expect(finalItem.quantity).toBe(110); // 100 + 10 increments
    });
  });
});
