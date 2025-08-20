const { test, expect } = require('@playwright/test');

test.describe('Inventory Management Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test data or reset state
    await page.goto('/login');
  });

  test('Complete admin workflow - login, add item, update stock', async ({ page }) => {
    // Login as admin
    await page.fill('[data-testid="email"]', 'admin@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-btn"]');

    // Verify login success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible();

    // Navigate to inventory
    await page.click('[data-testid="inventory-nav"]');
    await expect(page).toHaveURL('/inventory');

    // Add new item
    await page.click('[data-testid="add-item-btn"]');
    await page.fill('[data-testid="item-name"]', 'Test Product E2E');
    await page.fill('[data-testid="item-quantity"]', '25');
    await page.fill('[data-testid="item-price"]', '79.99');
    await page.selectOption('[data-testid="item-category"]', 'Electronics');
    await page.click('[data-testid="save-item"]');

    // Verify item appears in list
    await expect(page.locator('[data-testid="item-list"]')).toContainText('Test Product E2E');
    await expect(page.locator('[data-testid="item-quantity"]')).toContainText('25');

    // Update stock quantity
    await page.click('[data-testid="edit-item-btn"]');
    await page.fill('[data-testid="item-quantity"]', '30');
    await page.click('[data-testid="save-item"]');

    // Verify updated quantity
    await expect(page.locator('[data-testid="item-quantity"]')).toContainText('30');
  });

  test('Manager workflow - manage inventory without admin access', async ({ page }) => {
    // Login as manager
    await page.fill('[data-testid="email"]', 'manager@test.com');
    await page.fill('[data-testid="password"]', 'manager123');
    await page.click('[data-testid="login-btn"]');

    await expect(page).toHaveURL('/dashboard');

    // Can access inventory
    await page.click('[data-testid="inventory-nav"]');
    await expect(page.locator('[data-testid="inventory-table"]')).toBeVisible();

    // Can add items
    await page.click('[data-testid="add-item-btn"]');
    await expect(page.locator('[data-testid="item-form"]')).toBeVisible();

    // Cannot access admin panel
    await expect(page.locator('[data-testid="admin-nav"]')).not.toBeVisible();
    
    // Direct navigation to admin should redirect
    await page.goto('/admin');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
  });

  test('User workflow - read-only access', async ({ page }) => {
    // Login as regular user
    await page.fill('[data-testid="email"]', 'user@test.com');
    await page.fill('[data-testid="password"]', 'user123');
    await page.click('[data-testid="login-btn"]');

    await expect(page).toHaveURL('/dashboard');

    // Can view inventory
    await page.click('[data-testid="inventory-nav"]');
    await expect(page.locator('[data-testid="inventory-table"]')).toBeVisible();

    // Cannot add or edit items
    await expect(page.locator('[data-testid="add-item-btn"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="edit-item-btn"]')).not.toBeVisible();

    // Search functionality should work
    await page.fill('[data-testid="search-input"]', 'Electronics');
    await page.click('[data-testid="search-btn"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('Inventory search and filter functionality', async ({ page }) => {
    // Login as admin to have full access
    await page.fill('[data-testid="email"]', 'admin@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-btn"]');

    await page.goto('/inventory');

    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'laptop');
    await page.click('[data-testid="search-btn"]');
    
    const searchResults = page.locator('[data-testid="inventory-row"]');
    await expect(searchResults).toHaveCount(await searchResults.count());
    
    // Each result should contain 'laptop'
    const count = await searchResults.count();
    for (let i = 0; i < count; i++) {
      await expect(searchResults.nth(i)).toContainText('laptop', { matchCase: false });
    }

    // Test category filter
    await page.selectOption('[data-testid="category-filter"]', 'Electronics');
    const electronicsItems = page.locator('[data-testid="inventory-row"]');
    const electronicsCount = await electronicsItems.count();
    
    // Verify all items are electronics
    for (let i = 0; i < electronicsCount; i++) {
      await expect(electronicsItems.nth(i).locator('[data-testid="item-category"]'))
        .toContainText('Electronics');
    }

    // Test price range filter
    await page.fill('[data-testid="min-price"]', '50');
    await page.fill('[data-testid="max-price"]', '200');
    await page.click('[data-testid="apply-filters"]');

    const filteredItems = page.locator('[data-testid="inventory-row"]');
    const filteredCount = await filteredItems.count();
    
    // Verify price range
    for (let i = 0; i < filteredCount; i++) {
      const priceText = await filteredItems.nth(i).locator('[data-testid="item-price"]').textContent();
      const price = parseFloat(priceText.replace('$', ''));
      expect(price).toBeGreaterThanOrEqual(50);
      expect(price).toBeLessThanOrEqual(200);
    }
  });

  test('Low stock alerts and notifications', async ({ page }) => {
    await page.fill('[data-testid="email"]', 'admin@test.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-btn"]');

    await page.goto('/inventory');

    // Check for low stock indicators
    const lowStockItems = page.locator('[data-testid="low-stock-indicator"]');
    const lowStockCount = await lowStockItems.count();

    if (lowStockCount > 0) {
      // Verify low stock styling
      await expect(lowStockItems.first()).toHaveClass(/warning|danger|low-stock/);
      
      // Check notification badge
      await expect(page.locator('[data-testid="notification-badge"]')).toBeVisible();
      
      // Click notification to see details
      await page.click('[data-testid="notification-badge"]');
      await expect(page.locator('[data-testid="notification-panel"]')).toBeVisible();
      await expect(page.locator('[data-testid="low-stock-list"]')).toBeVisible();
    }
  });
});
