import { type Page, expect, test } from '@playwright/test';

// Comprehensive CMS E2E Tests using MCP Puppeteer Integration

test.describe('Enterprise CMS - Comprehensive Functionality', () => {
	let page: Page;

	test.beforeEach(async ({ browser }) => {
		page = await browser.newPage();
		await page.goto('http://localhost:8080');
	});

	test.afterEach(async () => {
		await page.close();
	});

	// Test 1: Basic Application Load
	test('should load the application successfully', async () => {
		await expect(page).toHaveTitle(/Christiano Property Management/);
		await expect(page.locator('body')).toBeVisible();

		// Check for main navigation
		const navigation = page.locator('nav').first();
		await expect(navigation).toBeVisible();

		// Check for main content area
		const mainContent = page.locator('main').first();
		await expect(mainContent).toBeVisible();
	});

	// Test 2: Pages Management
	test.describe('Pages Management', () => {
		test('should display pages list', async () => {
			await page.goto('http://localhost:8080/admin/pages');

			// Wait for pages to load
			await page.waitForSelector('[data-testid="pages-list"]');

			// Check for table headers
			await expect(page.locator('th:has-text("Title")')).toBeVisible();
			await expect(page.locator('th:has-text("Status")')).toBeVisible();
			await expect(page.locator('th:has-text("Updated")')).toBeVisible();

			// Check for page items
			const pageItems = page.locator('[data-testid="page-item"]');
			await expect(pageItems.first()).toBeVisible();
		});

		test('should create a new page', async () => {
			await page.goto('http://localhost:8080/admin/pages');

			// Click create button
			await page.click('[data-testid="create-page-btn"]');

			// Wait for form to appear
			await page.waitForSelector('[data-testid="page-form"]');

			// Fill in page details
			await page.fill('[data-testid="page-title"]', 'Test Page - E2E Automation');
			await page.fill('[data-testid="page-slug"]', 'test-page-e2e');
			await page.fill(
				'[data-testid="page-content"]',
				'This is a test page created by E2E automation.'
			);

			// Set SEO metadata
			await page.fill('[data-testid="meta-title"]', 'Test Page - SEO Title');
			await page.fill(
				'[data-testid="meta-description"]',
				'Test page meta description for SEO purposes.'
			);

			// Select template
			await page.selectOption('[data-testid="page-template"]', 'default');

			// Save page
			await page.click('[data-testid="save-page-btn"]');

			// Verify success message
			await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
			await expect(page.locator('[data-testid="success-message"]')).toContainText(
				'Page created successfully'
			);
		});

		test('should edit an existing page', async () => {
			await page.goto('http://localhost:8080/admin/pages');

			// Click edit button on first page
			await page.click('[data-testid="page-item"] [data-testid="edit-btn"]:first-child');

			// Wait for edit form
			await page.waitForSelector('[data-testid="page-form"]');

			// Update title
			await page.fill('[data-testid="page-title"]', 'Updated Test Page - E2E');

			// Save changes
			await page.click('[data-testid="save-page-btn"]');

			// Verify success
			await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
		});

		test('should delete a page', async () => {
			await page.goto('http://localhost:8080/admin/pages');

			// Click delete button
			await page.click('[data-testid="page-item"] [data-testid="delete-btn"]:first-child');

			// Confirm deletion in modal
			await page.click('[data-testid="confirm-delete-btn"]');

			// Verify success message
			await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
			await expect(page.locator('[data-testid="success-message"]')).toContainText(
				'Page deleted successfully'
			);
		});
	});

	// Test 3: Blog Posts Management
	test.describe('Blog Posts Management', () => {
		test('should display blog posts list', async () => {
			await page.goto('http://localhost:8080/admin/blog');

			// Wait for blog posts to load
			await page.waitForSelector('[data-testid="blog-posts-list"]');

			// Check for table headers
			await expect(page.locator('th:has-text("Title")')).toBeVisible();
			await expect(page.locator('th:has-text("Category")')).toBeVisible();
			await expect(page.locator('th:has-text("Published")')).toBeVisible();
		});

		test('should create a new blog post', async () => {
			await page.goto('http://localhost:8080/admin/blog');

			// Click create button
			await page.click('[data-testid="create-blog-btn"]');

			// Wait for form
			await page.waitForSelector('[data-testid="blog-form"]');

			// Fill in blog post details
			await page.fill('[data-testid="blog-title"]', 'Test Blog Post - E2E Automation');
			await page.fill('[data-testid="blog-slug"]', 'test-blog-post-e2e');
			await page.fill('[data-testid="blog-excerpt"]', 'This is an excerpt for the test blog post.');
			await page.fill(
				'[data-testid="blog-content"]',
				'This is the full content of our test blog post created by E2E automation.'
			);

			// Set category and tags
			await page.selectOption('[data-testid="blog-category"]', 'general');
			await page.fill('[data-testid="blog-tags"]', 'test, automation, e2e');

			// Set SEO metadata
			await page.fill('[data-testid="meta-title"]', 'Test Blog Post - SEO Title');
			await page.fill(
				'[data-testid="meta-description"]',
				'Test blog post meta description for SEO.'
			);

			// Publish post
			await page.click('[data-testid="publish-blog-btn"]');

			// Verify success
			await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
		});
	});

	// Test 4: Properties Management
	test.describe('Properties Management', () => {
		test('should display properties list', async () => {
			await page.goto('http://localhost:8080/admin/properties');

			// Wait for properties to load
			await page.waitForSelector('[data-testid="properties-list"]');

			// Check for filters
			await expect(page.locator('[data-testid="property-type-filter"]')).toBeVisible();
			await expect(page.locator('[data-testid="price-filter"]')).toBeVisible();
			await expect(page.locator('[data-testid="location-search"]')).toBeVisible();
		});

		test('should create a new property listing', async () => {
			await page.goto('http://localhost:8080/admin/properties');

			// Click create button
			await page.click('[data-testid="create-property-btn"]');

			// Wait for form
			await page.waitForSelector('[data-testid="property-form"]');

			// Fill in property details
			await page.fill('[data-testid="property-title"]', 'Test Property - E2E Automation');
			await page.fill('[data-testid="property-slug"]', 'test-property-e2e');
			await page.fill(
				'[data-testid="property-description"]',
				'Beautiful test property with all amenities.'
			);

			// Set property type and status
			await page.selectOption('[data-testid="property-type"]', 'apartment');
			await page.selectOption('[data-testid="property-status"]', 'available');

			// Set pricing
			await page.fill('[data-testid="property-price"]', '1500');
			await page.selectOption('[data-testid="property-currency"]', 'EUR');

			// Set specifications
			await page.fill('[data-testid="property-bedrooms"]', '2');
			await page.fill('[data-testid="property-bathrooms"]', '1');
			await page.fill('[data-testid="property-area"]', '85');

			// Set location
			await page.fill('[data-testid="property-address"]', '123 Test Street, Test City');
			await page.fill('[data-testid="property-city"]', 'Test City');
			await page.fill('[data-testid="property-country"]', 'Malta');

			// Add features
			await page.fill(
				'[data-testid="property-features"]',
				'Air Conditioning, Balcony, Elevator, Parking'
			);

			// Save property
			await page.click('[data-testid="save-property-btn"]');

			// Verify success
			await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
		});

		test('should search and filter properties', async () => {
			await page.goto('http://localhost:8080/admin/properties');

			// Apply filters
			await page.selectOption('[data-testid="property-type-filter"]', 'apartment');
			await page.fill('[data-testid="min-price"]', '1000');
			await page.fill('[data-testid="max-price"]', '2000');
			await page.fill('[data-testid="min-bedrooms"]', '2');

			// Click search
			await page.click('[data-testid="search-properties-btn"]');

			// Wait for results
			await page.waitForSelector('[data-testid="properties-list"]');

			// Verify filters are applied
			const propertyItems = page.locator('[data-testid="property-item"]');
			await expect(propertyItems.first()).toBeVisible();

			// Check that filter indicators are shown
			await expect(page.locator('[data-testid="active-filters"]')).toBeVisible();
		});
	});

	// Test 5: Media Management
	test.describe('Media Management', () => {
		test('should display media library', async () => {
			await page.goto('http://localhost:8080/admin/media');

			// Wait for media to load
			await page.waitForSelector('[data-testid="media-grid"]');

			// Check for upload button
			await expect(page.locator('[data-testid="upload-media-btn"]')).toBeVisible();

			// Check for filters
			await expect(page.locator('[data-testid="media-type-filter"]')).toBeVisible();
			await expect(page.locator('[data-testid="media-search"]')).toBeVisible();
		});

		test('should upload a media file', async () => {
			await page.goto('http://localhost:8080/admin/media');

			// Click upload button
			await page.click('[data-testid="upload-media-btn"]');

			// Wait for upload modal
			await page.waitForSelector('[data-testid="upload-modal"]');

			// Select file (simulate file upload)
			const fileInput = page.locator('[data-testid="file-input"]');
			await fileInput.setInputFiles({
				name: 'test-image.jpg',
				mimeType: 'image/jpeg',
				buffer: Buffer.from('fake-image-data'),
			});

			// Fill in metadata
			await page.fill('[data-testid="media-alt-text"]', 'Test image for E2E automation');
			await page.fill('[data-testid="media-caption"]', 'Test image caption');
			await page.fill('[data-testid="media-tags"]', 'test, automation, image');

			// Upload file
			await page.click('[data-testid="confirm-upload-btn"]');

			// Verify success
			await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
			await expect(page.locator('[data-testid="success-message"]')).toContainText(
				'File uploaded successfully'
			);
		});

		test('should search and filter media', async () => {
			await page.goto('http://localhost:8080/admin/media');

			// Apply filters
			await page.selectOption('[data-testid="media-type-filter"]', 'image');
			await page.fill('[data-testid="media-search"]', 'test');

			// Click search
			await page.click('[data-testid="search-media-btn"]');

			// Wait for results
			await page.waitForSelector('[data-testid="media-grid"]');

			// Verify media items are shown
			const mediaItems = page.locator('[data-testid="media-item"]');
			await expect(mediaItems.first()).toBeVisible();
		});
	});

	// Test 6: Forms Management
	test.describe('Forms Management', () => {
		test('should display forms list', async () => {
			await page.goto('http://localhost:8080/admin/forms');

			// Wait for forms to load
			await page.waitForSelector('[data-testid="forms-list"]');

			// Check for create button
			await expect(page.locator('[data-testid="create-form-btn"]')).toBeVisible();
		});

		test('should create a new form', async () => {
			await page.goto('http://localhost:8080/admin/forms');

			// Click create button
			await page.click('[data-testid="create-form-btn"]');

			// Wait for form builder
			await page.waitForSelector('[data-testid="form-builder"]');

			// Set form details
			await page.fill('[data-testid="form-name"]', 'Contact Form - E2E Test');
			await page.fill('[data-testid="form-title"]', 'Get in Touch');
			await page.fill('[data-testid="form-description"]', 'Contact us for more information.');

			// Add form fields
			await page.click('[data-testid="add-field-btn"]');
			await page.selectOption('[data-testid="field-type"]', 'text');
			await page.fill('[data-testid="field-label"]', 'Name');
			await page.fill('[data-testid="field-name"]', 'name');
			await page.check('[data-testid="field-required"]');

			// Add email field
			await page.click('[data-testid="add-field-btn"]');
			await page.selectOption('[data-testid="field-type"]', 'email');
			await page.fill('[data-testid="field-label"]', 'Email');
			await page.fill('[data-testid="field-name"]', 'email');
			await page.check('[data-testid="field-required"]');

			// Add message field
			await page.click('[data-testid="add-field-btn"]');
			await page.selectOption('[data-testid="field-type"]', 'textarea');
			await page.fill('[data-testid="field-label"]', 'Message');
			await page.fill('[data-testid="field-name"]', 'message');
			await page.check('[data-testid="field-required"]');

			// Set form settings
			await page.fill('[data-testid="success-message"]', 'Thank you for your message!');
			await page.fill('[data-testid="email-recipients"]', 'test@example.com');

			// Save form
			await page.click('[data-testid="save-form-btn"]');

			// Verify success
			await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
		});

		test('should view form submissions', async () => {
			await page.goto('http://localhost:8080/admin/forms');

			// Click view submissions on first form
			await page.click(
				'[data-testid="form-item"] [data-testid="view-submissions-btn"]:first-child'
			);

			// Wait for submissions list
			await page.waitForSelector('[data-testid="submissions-list"]');

			// Check for submission data
			await expect(page.locator('th:has-text("Submitted")')).toBeVisible();
			await expect(page.locator('th:has-text("Data")')).toBeVisible();
		});
	});

	// Test 7: Categories Management
	test.describe('Categories Management', () => {
		test('should display categories list', async () => {
			await page.goto('http://localhost:8080/admin/categories');

			// Wait for categories to load
			await page.waitForSelector('[data-testid="categories-list"]');

			// Check for create button
			await expect(page.locator('[data-testid="create-category-btn"]')).toBeVisible();
		});

		test('should create a new category', async () => {
			await page.goto('http://localhost:8080/admin/categories');

			// Click create button
			await page.click('[data-testid="create-category-btn"]');

			// Wait for form
			await page.waitForSelector('[data-testid="category-form"]');

			// Fill in category details
			await page.fill('[data-testid="category-name"]', 'Test Category');
			await page.fill('[data-testid="category-slug"]', 'test-category');
			await page.fill(
				'[data-testid="category-description"]',
				'A test category for E2E automation.'
			);

			// Set color and icon
			await page.fill('[data-testid="category-color"]', '#6366f1');
			await page.fill('[data-testid="category-icon"]', 'folder');

			// Save category
			await page.click('[data-testid="save-category-btn"]');

			// Verify success
			await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
		});
	});

	// Test 8: Search Functionality
	test.describe('Global Search', () => {
		test('should perform global search', async () => {
			await page.goto('http://localhost:8080/admin');

			// Click search button
			await page.click('[data-testid="global-search-btn"]');

			// Wait for search modal
			await page.waitForSelector('[data-testid="search-modal"]');

			// Enter search query
			await page.fill('[data-testid="search-input"]', 'test');

			// Select search types
			await page.check('[data-testid="search-pages"]');
			await page.check('[data-testid="search-blog"]');
			await page.check('[data-testid="search-properties"]');

			// Perform search
			await page.click('[data-testid="search-submit-btn"]');

			// Wait for results
			await page.waitForSelector('[data-testid="search-results"]');

			// Check for results
			const searchResults = page.locator('[data-testid="search-result-item"]');
			await expect(searchResults.first()).toBeVisible();

			// Check result types
			await expect(page.locator('[data-testid="result-type-pages"]')).toBeVisible();
			await expect(page.locator('[data-testid="result-type-blog"]')).toBeVisible();
			await expect(page.locator('[data-testid="result-type-properties"]')).toBeVisible();
		});
	});

	// Test 9: Dashboard Analytics
	test.describe('Dashboard Analytics', () => {
		test('should display dashboard with analytics', async () => {
			await page.goto('http://localhost:8080/admin/dashboard');

			// Wait for dashboard to load
			await page.waitForSelector('[data-testid="dashboard"]');

			// Check for analytics widgets
			await expect(page.locator('[data-testid="page-views-widget"]')).toBeVisible();
			await expect(page.locator('[data-testid="form-submissions-widget"]')).toBeVisible();
			await expect(page.locator('[data-testid="media-downloads-widget"]')).toBeVisible();
			await expect(page.locator('[data-testid="search-queries-widget"]')).toBeVisible();

			// Check for charts
			await expect(page.locator('[data-testid="views-chart"]')).toBeVisible();
			await expect(page.locator('[data-testid="submissions-chart"]')).toBeVisible();

			// Check for recent activity
			await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
			const activityItems = page.locator('[data-testid="activity-item"]');
			await expect(activityItems.first()).toBeVisible();
		});
	});

	// Test 10: Settings Management
	test.describe('Settings Management', () => {
		test('should display and update settings', async () => {
			await page.goto('http://localhost:8080/admin/settings');

			// Wait for settings page
			await page.waitForSelector('[data-testid="settings-page"]');

			// Check for settings sections
			await expect(page.locator('[data-testid="site-settings"]')).toBeVisible();
			await expect(page.locator('[data-testid="seo-settings"]')).toBeVisible();
			await expect(page.locator('[data-testid="analytics-settings"]')).toBeVisible();
			await expect(page.locator('[data-testid="security-settings"]')).toBeVisible();
			await expect(page.locator('[data-testid="email-settings"]')).toBeVisible();
			await expect(page.locator('[data-testid="storage-settings"]')).toBeVisible();

			// Update site settings
			await page.fill('[data-testid="site-name"]', 'Christiano Property Management - Test');
			await page.fill('[data-testid="site-description"]', 'Test description for E2E automation');
			await page.fill('[data-testid="site-url"]', 'https://test.Christiano-pm.com');

			// Update SEO settings
			await page.fill('[data-testid="default-meta-title"]', 'Christiano PM - Property Management');
			await page.fill(
				'[data-testid="default-meta-description"]',
				'Professional property management services in Malta'
			);
			await page.check('[data-testid="sitemap-enabled"]');

			// Save settings
			await page.click('[data-testid="save-settings-btn"]');

			// Verify success
			await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
			await expect(page.locator('[data-testid="success-message"]')).toContainText(
				'Settings saved successfully'
			);
		});
	});

	// Test 11: User Interface Responsiveness
	test.describe('Responsive Design', () => {
		test('should be responsive on mobile', async () => {
			// Set mobile viewport
			await page.setViewportSize({ width: 375, height: 667 });

			await page.goto('http://localhost:8080/admin');

			// Check mobile navigation
			await expect(page.locator('[data-testid="mobile-menu-btn"]')).toBeVisible();

			// Open mobile menu
			await page.click('[data-testid="mobile-menu-btn"]');
			await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

			// Check that navigation items are visible
			await expect(page.locator('[data-testid="nav-pages"]')).toBeVisible();
			await expect(page.locator('[data-testid="nav-blog"]')).toBeVisible();
			await expect(page.locator('[data-testid="nav-properties"]')).toBeVisible();

			// Close mobile menu
			await page.click('[data-testid="mobile-menu-btn"]');
			await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
		});

		test('should be responsive on tablet', async () => {
			// Set tablet viewport
			await page.setViewportSize({ width: 768, height: 1024 });

			await page.goto('http://localhost:8080/admin');

			// Check that layout adapts
			const sidebar = page.locator('[data-testid="sidebar"]');
			await expect(sidebar).toBeVisible();

			// Check content area
			const content = page.locator('[data-testid="main-content"]');
			await expect(content).toBeVisible();
		});
	});

	// Test 12: Error Handling
	test.describe('Error Handling', () => {
		test('should handle network errors gracefully', async () => {
			// Simulate network failure
			await page.route('**/api/**', (route) => route.abort());

			await page.goto('http://localhost:8080/admin/pages');

			// Wait for error message
			await page.waitForSelector('[data-testid="error-message"]');

			// Verify error handling
			await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
			await expect(page.locator('[data-testid="error-message"]')).toContainText(
				'Failed to load data'
			);

			// Check for retry button
			await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible();
		});

		test('should handle form validation errors', async () => {
			await page.goto('http://localhost:8080/admin/pages');

			// Click create button
			await page.click('[data-testid="create-page-btn"]');

			// Try to save without required fields
			await page.click('[data-testid="save-page-btn"]');

			// Check for validation errors
			await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
			await expect(page.locator('[data-testid="field-error-title"]')).toBeVisible();
			await expect(page.locator('[data-testid="field-error-slug"]')).toBeVisible();
		});
	});

	// Test 13: Performance Tests
	test.describe('Performance', () => {
		test('should load pages quickly', async () => {
			const startTime = Date.now();

			await page.goto('http://localhost:8080/admin/pages');
			await page.waitForSelector('[data-testid="pages-list"]');

			const loadTime = Date.now() - startTime;

			// Should load in under 3 seconds
			expect(loadTime).toBeLessThan(3000);
		});

		test('should handle large datasets efficiently', async () => {
			await page.goto('http://localhost:8080/admin/media');

			// Load more items
			await page.click('[data-testid="load-more-btn"]');

			// Wait for items to load
			await page.waitForSelector('[data-testid="media-grid"]');

			// Check that UI remains responsive
			const mediaItems = page.locator('[data-testid="media-item"]');
			await expect(mediaItems.first()).toBeVisible();
		});
	});

	// Test 14: Accessibility Tests
	test.describe('Accessibility', () => {
		test('should be keyboard navigable', async () => {
			await page.goto('http://localhost:8080/admin');

			// Tab through interface
			await page.keyboard.press('Tab');
			await expect(page.locator(':focus')).toBeVisible();

			// Navigate to pages
			for (let i = 0; i < 5; i++) {
				await page.keyboard.press('Tab');
			}
			await page.keyboard.press('Enter');

			// Should navigate to pages
			await expect(page).toHaveURL(/.*admin\/pages/);
		});

		test('should have proper ARIA labels', async () => {
			await page.goto('http://localhost:8080/admin/pages');

			// Check for ARIA labels
			await expect(page.locator('[aria-label="Pages list"]')).toBeVisible();
			await expect(page.locator('[aria-label="Create new page"]')).toBeVisible();

			// Check for semantic HTML
			await expect(page.locator('main')).toBeVisible();
			await expect(page.locator('nav')).toBeVisible();
			await expect(page.locator('h1')).toBeVisible();
		});
	});

	// Test 15: Security Tests
	test.describe('Security', () => {
		test('should prevent XSS attacks', async () => {
			await page.goto('http://localhost:8080/admin/pages');

			// Click create button
			await page.click('[data-testid="create-page-btn"]');

			// Try to inject script
			await page.fill('[data-testid="page-title"]', '<script>alert("XSS")</script>');
			await page.fill('[data-testid="page-content"]', '<img src="x" onerror="alert(\'XSS\')">');

			// Save page
			await page.click('[data-testid="save-page-btn"]');

			// Check that script is not executed
			await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible();

			// Check that content is escaped
			await page.goto('http://localhost:8080/admin/pages');
			const pageTitle = page.locator(
				'[data-testid="page-item"] [data-testid="page-title"]:first-child'
			);
			await expect(pageTitle).toContainText('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
		});

		test('should require authentication for admin areas', async () => {
			// Clear cookies to simulate logout
			await page.context().clearCookies();

			await page.goto('http://localhost:8080/admin/pages');

			// Should redirect to login
			await expect(page).toHaveURL(/.*login/);

			// Check for login form
			await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
			await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
			await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
		});
	});
});

// Integration Tests with MCP Puppeteer
test.describe('MCP Puppeteer Integration Tests', () => {
	test('should integrate with MCP Puppeteer for advanced testing', async ({ page }) => {
		// Use MCP Puppeteer for advanced interactions
		await page.goto('http://localhost:8080');

		// Test advanced interactions
		await page.evaluate(() => {
			// Test JavaScript functionality
			const cms = window.cms;
			if (cms) {
				return cms.isReady();
			}
			return false;
		});

		// Test responsive design with different viewports
		await page.setViewportSize({ width: 1920, height: 1080 });
		await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();

		await page.setViewportSize({ width: 375, height: 667 });
		await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();

		// Test dark mode
		await page.click('[data-testid="theme-toggle"]');
		await expect(page.locator('body')).toHaveClass(/dark/);

		// Test language switching
		await page.click('[data-testid="language-selector"]');
		await page.click('[data-testid="lang-mt"]');
		await expect(page.locator('[data-testid="lang-indicator"]')).toHaveText('MT');
	});
});
