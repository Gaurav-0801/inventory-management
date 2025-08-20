const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/inventory_test'
    }
  }
});

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Run migrations or seed data if needed
  console.log('Connected to test database');
});

afterAll(async () => {
  // Cleanup and disconnect
  await prisma.$disconnect();
  console.log('Disconnected from test database');
});

// Make prisma available globally in tests
global.prisma = prisma;
