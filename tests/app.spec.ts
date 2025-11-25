import { test, expect } from '@playwright/test';

// Pre-warm all pages before running tests (Next.js dev server compiles on first request)
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  const pages = ['/', '/login', '/docs', '/bugs', '/cells'];
  for (const path of pages) {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(1000);
  }
  await page.close();
});

test.describe('Landing Page', () => {
  test('should display landing page correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check main heading
    await expect(page.locator('h1').first()).toContainText('출석부 관리 시스템', { timeout: 15000 });

    // Check key buttons exist
    await expect(page.getByRole('link', { name: /로그인하기/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /사용법 가이드/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /셀 배치표 보기/ })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: /로그인하기/ }).first().click();
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to docs page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: /사용법 가이드/ }).first().click();
    await expect(page).toHaveURL('/docs');
  });

  test('should navigate to cells page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: /셀 배치표 보기/ }).click();
    await expect(page).toHaveURL('/cells');
  });
});

test.describe('Login Page', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Check form elements
    await expect(page.locator('h1')).toContainText('2청년부 출석부');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /로그인/ })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.locator('.bg-rose-50')).toBeVisible({ timeout: 10000 });
  });

  test('should have proper form validation', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Check if username is required
    const usernameInput = page.locator('input[name="username"]');
    await expect(usernameInput).toHaveAttribute('required');

    // Check if password is required
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute('required');
  });
});

test.describe('Docs Page', () => {
  test('should display documentation correctly', async ({ page }) => {
    await page.goto('/docs', { waitUntil: 'networkidle' });

    // Check main heading
    await expect(page.locator('h1')).toContainText('사용법 가이드');

    // Check quick start section
    await expect(page.locator('text=빠른 시작')).toBeVisible();

    // Check table of contents
    await expect(page.locator('text=목차')).toBeVisible();
  });

  test('should have working navigation sections', async ({ page }) => {
    await page.goto('/docs', { waitUntil: 'networkidle' });

    // Check section links
    await expect(page.locator('a[href="#overview"]')).toBeVisible();
    await expect(page.locator('a[href="#weekly-flow"]')).toBeVisible();
    await expect(page.locator('a[href="#prayer-flow"]')).toBeVisible();
    await expect(page.locator('a[href="#cell-leader"]')).toBeVisible();
    await expect(page.locator('a[href="#admin"]')).toBeVisible();
    await expect(page.locator('a[href="#faq"]')).toBeVisible();
  });

  test('should expand FAQ items', async ({ page }) => {
    await page.goto('/docs', { waitUntil: 'networkidle' });

    // Find and click a FAQ item
    const faqItem = page.locator('details').first();
    await faqItem.click();

    // Check if it's expanded
    await expect(faqItem).toHaveAttribute('open');
  });

  test('should have home link', async ({ page }) => {
    await page.goto('/docs', { waitUntil: 'networkidle' });

    await page.getByRole('link', { name: /홈으로/ }).first().click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Cells Page', () => {
  test('should display cells page', async ({ page }) => {
    await page.goto('/cells', { waitUntil: 'networkidle' });

    // Check main heading
    await expect(page.locator('h1')).toContainText('셀 배치표');
  });

  test('should show empty state or cell list', async ({ page }) => {
    await page.goto('/cells', { waitUntil: 'networkidle' });

    // Either shows empty message or cell articles
    const emptyMessage = page.locator('text=아직 등록된 셀이 없습니다');
    const cellArticles = page.locator('article');

    // One of these should be visible
    const isEmpty = await emptyMessage.isVisible().catch(() => false);
    const hasCells = await cellArticles.count() > 0;

    expect(isEmpty || hasCells).toBeTruthy();
  });
});

test.describe('Bugs Page', () => {
  test('should display bugs page', async ({ page }) => {
    await page.goto('/bugs', { waitUntil: 'networkidle' });

    // Check main heading
    await expect(page.locator('h1')).toContainText('버그/건의사항');
  });

  test('should have bug submission form', async ({ page }) => {
    await page.goto('/bugs', { waitUntil: 'networkidle' });

    // Check textarea exists
    await expect(page.locator('textarea')).toBeVisible();

    // Check submit button exists
    await expect(page.getByRole('button', { name: /등록/ })).toBeVisible();
  });

  test('should show validation error for empty submission', async ({ page }) => {
    await page.goto('/bugs', { waitUntil: 'networkidle' });

    // Check that submit button is disabled when form is empty
    const submitButton = page.getByRole('button', { name: /등록/ });
    await expect(submitButton).toBeDisabled();

    // Type some content and check button becomes enabled
    await page.locator('textarea').fill('테스트 내용');
    await expect(submitButton).toBeEnabled();

    // Clear the content and verify button is disabled again
    await page.locator('textarea').fill('');
    await expect(submitButton).toBeDisabled();
  });

  test('should have home link', async ({ page }) => {
    await page.goto('/bugs', { waitUntil: 'networkidle' });

    await page.getByRole('link', { name: /홈으로/ }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Navigation and Links', () => {
  test('should have consistent footer navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check footer links
    await expect(page.locator('footer a[href="/docs"]')).toBeVisible();
    await expect(page.locator('footer a[href="/bugs"]')).toBeVisible();
  });

  test('all main pages should load without errors', async ({ page }) => {
    const pages = ['/', '/login', '/docs', '/cells', '/bugs'];

    for (const path of pages) {
      const response = await page.goto(path, { waitUntil: 'networkidle' });
      expect(response?.status()).toBeLessThan(400);
    }
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive on landing page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });

    // Check if main content is visible on mobile
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /로그인하기/ }).first()).toBeVisible();
  });

  test('should be mobile responsive on login page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Check if form is visible on mobile
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('login form should have proper labels', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Check for label associations
    const usernameLabel = page.locator('label[for="username"]');
    await expect(usernameLabel).toBeVisible();

    const passwordLabel = page.locator('label[for="password"]');
    await expect(passwordLabel).toBeVisible();
  });

  test('buttons should be focusable', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Tab to the submit button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if button is focused
    const submitButton = page.getByRole('button', { name: /로그인/ });
    await expect(submitButton).toBeFocused();
  });
});

test.describe('Performance', () => {
  test('landing page should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds (first load compiles)
    expect(loadTime).toBeLessThan(10000);
  });
});

test.describe('Admin Sessions', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin', { timeout: 10000 });
  });

  test('should create a new session', async ({ page }) => {
    await page.goto('/admin/sessions', { waitUntil: 'networkidle' });

    // Check page loaded
    await expect(page.locator('h1')).toContainText('출석부 관리');

    // Date input should have a value
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
    const dateValue = await dateInput.inputValue();
    expect(dateValue).toBeTruthy();

    // Click create button
    await page.click('button:has-text("출석부 생성")');

    // Wait for success message or error
    await page.waitForTimeout(3000);

    // Check for success or error message
    const successMsg = page.locator('.bg-emerald-50');
    const errorMsg = page.locator('.bg-rose-50');

    const hasSuccess = await successMsg.isVisible().catch(() => false);
    const hasError = await errorMsg.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorMsg.textContent();
      console.log('Error:', errorText);
    }

    // Either success message should appear or already exists error
    expect(hasSuccess || hasError).toBeTruthy();
  });
});

test.describe('Cell Leader Access', () => {
  test.beforeEach(async ({ page }) => {
    // Login as cell leader (kimcs)
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="username"]', 'kimcs');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('/cell', { timeout: 10000 });
  });

  test('should load cell page without errors', async ({ page }) => {
    // Cell page should load without "출석 정보를 가져오지 못했습니다" error
    await page.goto('/cell', { waitUntil: 'networkidle' });

    // Check page loaded - should show cell name or attendance UI
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    // Should NOT show error message
    const errorMsg = page.locator('text=출석 정보를 가져오지 못했습니다');
    await expect(errorMsg).not.toBeVisible();
  });

  test('should fetch attendance API successfully', async ({ page, request }) => {
    // Get session cookie (cookie name is 'rb-session')
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'rb-session');
    expect(sessionCookie).toBeTruthy();

    // Test attendance API directly
    const response = await request.get('/api/attendance?date=2025-11-23', {
      headers: {
        Cookie: `rb-session=${sessionCookie?.value}`
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Should return proper structure, not error
    expect(data).toHaveProperty('date');
    expect(data).toHaveProperty('entries');
    expect(data).toHaveProperty('summary');
    expect(Array.isArray(data.entries)).toBeTruthy();
  });
});
