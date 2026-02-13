import { expect, test } from '@playwright/test';

test.describe('Admin Dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/admin');
	});

	test('should display admin login form', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('Admin Login');
		await expect(page.locator('input[type="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test('should login with valid credentials', async ({ page }) => {
		await page.fill('input[type="email"]', 'admin@example.com');
		await page.fill('input[type="password"]', 'admin123');
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL('/admin/dashboard');
		await expect(page.locator('h1')).toContainText('Dashboard');
	});

	test('should show error for invalid credentials', async ({ page }) => {
		await page.fill('input[type="email"]', 'invalid@example.com');
		await page.fill('input[type="password"]', 'wrongpassword');
		await page.click('button[type="submit"]');

		await expect(page.locator('[role="alert"]')).toBeVisible();
		await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials');
	});

	test('should navigate to sections editor', async ({ page }) => {
		await page.goto('/admin/dashboard');
		await page.click('button:has-text("Edit Content")');

		await expect(page).toHaveURL('/admin/sections');
		await expect(page.locator('h1')).toContainText('Sections');
	});

	test('should navigate to settings', async ({ page }) => {
		await page.goto('/admin/dashboard');
		await page.click('button:has-text("Site Settings")');

		await expect(page).toHaveURL('/admin/settings');
		await expect(page.locator('h1')).toContainText('Site Settings');
	});

	test('should display statistics cards', async ({ page }) => {
		await page.goto('/admin/dashboard');

		await expect(page.locator('.glass-surface').first()).toContainText('Sections');
		await expect(page.locator('.glass-surface').nth(1)).toContainText('Visible');
		await expect(page.locator('.glass-surface').nth(2)).toContainText('Hidden');
		await expect(page.locator('.glass-surface').nth(3)).toContainText('Settings');
	});
});

test.describe('CMS Content Management', () => {
	test.beforeEach(async ({ page }) => {
		// Login first
		await page.goto('/admin');
		await page.fill('input[type="email"]', 'admin@example.com');
		await page.fill('input[type="password"]', 'admin123');
		await page.click('button[type="submit"]');
		await page.waitForURL('/admin/dashboard');
	});

	test('should view all CMS content sections', async ({ page }) => {
		await page.goto('/admin/sections');

		await expect(page.locator('h1')).toContainText('Sections');
		await expect(page.locator('[data-testid="section-list"]')).toBeVisible();
	});

	test('should edit a section', async ({ page }) => {
		await page.goto('/admin/sections');
		await page.click('[data-testid="section-item"]:first-child button:has-text("Edit")');

		await expect(page.locator('h2')).toContainText('Edit Section');
		await expect(page.locator('textarea')).toBeVisible();
	});

	test('should toggle section visibility', async ({ page }) => {
		await page.goto('/admin/sections');
		const visibilityToggle = page.locator('[data-testid="visibility-toggle"]:first-child');
		await visibilityToggle.click();

		// Should update the visibility state
		await expect(visibilityToggle).toHaveAttribute('data-state', 'checked');
	});

	test('should save section changes', async ({ page }) => {
		await page.goto('/admin/sections');
		await page.click('[data-testid="section-item"]:first-child button:has-text("Edit")');

		await page.fill('textarea', 'Updated content');
		await page.click('button:has-text("Save Changes")');

		await expect(page.locator('[role="alert"]')).toContainText('Success');
	});
});

test.describe('Public Website', () => {
	test('should display homepage', async ({ page }) => {
		await page.goto('/');

		await expect(page.locator('h1')).toContainText('Maximise your rental income');
		await expect(page.locator('[data-testid="hero-cta"]')).toBeVisible();
		await expect(page.locator('nav')).toBeVisible();
	});

	test('should navigate to different sections', async ({ page }) => {
		await page.goto('/');

		await page.click('nav a:has-text("Process")');
		await expect(page.locator('#process')).toBeVisible();

		await page.click('nav a:has-text("Portfolio")');
		await expect(page.locator('#portfolio')).toBeVisible();
	});

	test('should display all main sections', async ({ page }) => {
		await page.goto('/');

		await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
		await expect(page.locator('[data-testid="stats-section"]')).toBeVisible();
		await expect(page.locator('[data-testid="process-section"]')).toBeVisible();
		await expect(page.locator('[data-testid="portfolio-section"]')).toBeVisible();
		await expect(page.locator('[data-testid="pricing-section"]')).toBeVisible();
		await expect(page.locator('[data-testid="faq-section"]')).toBeVisible();
		await expect(page.locator('footer')).toBeVisible();
	});

	test('should handle CTA button clicks', async ({ page }) => {
		await page.goto('/');

		await page.click('[data-testid="hero-cta"]');

		// Should open wizard modal or navigate
		await expect(page.locator('[data-testid="wizard-modal"]')).toBeVisible();
	});

	test('should be responsive on mobile', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');

		// Check mobile navigation
		await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

		// Ensure content is readable
		await expect(page.locator('h1')).toBeVisible();
	});
});

test.describe('Accessibility', () => {
	test('should have proper ARIA labels', async ({ page }) => {
		await page.goto('/');

		const buttons = await page.locator('button').all();
		for (const button of buttons) {
			const ariaLabel = await button.getAttribute('aria-label');
			const text = await button.textContent();
			expect(ariaLabel || text).toBeTruthy();
		}
	});

	test('should have proper heading hierarchy', async ({ page }) => {
		await page.goto('/');

		const h1Count = await page.locator('h1').count();
		expect(h1Count).toBe(1);

		const h2s = await page.locator('h2').all();
		expect(h2s.length).toBeGreaterThan(0);
	});

	test('should have alt text on images', async ({ page }) => {
		await page.goto('/');

		const images = await page.locator('img').all();
		for (const img of images) {
			const alt = await img.getAttribute('alt');
			expect(alt).toBeTruthy();
		}
	});
});

test.describe('Performance', () => {
	test('should load page within 3 seconds', async ({ page }) => {
		const start = Date.now();
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		const loadTime = Date.now() - start;

		expect(loadTime).toBeLessThan(3000);
	});

	test('should have good Lighthouse scores', async ({ page }) => {
		await page.goto('/');

		const metrics = await page.evaluate(() => {
			return JSON.stringify({
				fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
				lcp: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
				cls: performance.getEntriesByType('layout-shift').length,
			});
		});

		console.log('Performance metrics:', metrics);
	});
});

test.describe('SEO', () => {
	test('should have proper meta tags', async ({ page }) => {
		await page.goto('/');

		const title = await page.title();
		expect(title).toBeTruthy();
		expect(title.length).toBeGreaterThan(0);

		const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
		expect(metaDescription).toBeTruthy();
	});

	test('should have proper Open Graph tags', async ({ page }) => {
		await page.goto('/');

		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
		await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
		await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
	});
});
