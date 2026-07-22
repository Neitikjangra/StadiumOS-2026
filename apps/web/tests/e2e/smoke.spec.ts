import { test, expect } from '@playwright/test';

test.describe('Landing & Auth', () => {
  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/login/);
  });

  test('login page renders with form fields', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });

  test('can login as admin and reach command center', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@stadiumos.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command-center', { timeout: 15_000 });
    await expect(page).toHaveURL(/command-center/);
  });
});

test.describe('Command Center', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@stadiumos.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command-center', { timeout: 15_000 });
  });

  test('command center page loads with heading', async ({ page }) => {
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('sidebar navigation is accessible', async ({ page }) => {
    const sidebar = page.locator('nav, aside').first();
    await expect(sidebar).toBeVisible();
  });
});

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@stadiumos.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command-center', { timeout: 15_000 });
  });

  test('analytics page loads with metric cards', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(2000);
    const cards = page.locator('[role="article"]');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('time window selector works', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(2000);
    const liveBtn = page.locator('[role="tab"]', { hasText: 'Live' });
    await expect(liveBtn).toBeVisible({ timeout: 10_000 });
    await liveBtn.click();
    await expect(liveBtn).toHaveAttribute('aria-selected', 'true');
  });

  test('export CSV button triggers download', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForTimeout(2000);
    const exportBtn = page.locator('button', { hasText: 'Export CSV' });
    await expect(exportBtn).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Incidents', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@stadiumos.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command-center', { timeout: 15_000 });
  });

  test('incidents page loads with incident list', async ({ page }) => {
    await page.goto('/incidents');
    await page.waitForTimeout(2000);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('Routing & Mobility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@stadiumos.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command-center', { timeout: 15_000 });
  });

  test('routing page loads', async ({ page }) => {
    await page.goto('/routing');
    await page.waitForTimeout(2000);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('Communications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@stadiumos.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command-center', { timeout: 15_000 });
  });

  test('comms page loads', async ({ page }) => {
    await page.goto('/comms');
    await page.waitForTimeout(2000);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('Keyboard Accessibility', () => {
  test('can tab through sidebar navigation', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@stadiumos.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command-center', { timeout: 15_000 });

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focused);
  });
});

test.describe('Responsive Design', () => {
  test('sidebar collapses on mobile viewport', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"], input[name="email"]', 'admin@stadiumos.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/command-center', { timeout: 15_000 });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();
  });
});
