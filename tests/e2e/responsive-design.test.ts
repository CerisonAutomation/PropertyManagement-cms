import { type Page, expect, test } from '@playwright/test';

// Comprehensive Responsive Design Testing - All Screen Sizes Perfect Fit

const VIEWPORTS = [
	// Mobile devices
	{ name: 'iPhone SE', width: 375, height: 667 },
	{ name: 'iPhone 12', width: 390, height: 844 },
	{ name: 'iPhone 12 Pro Max', width: 428, height: 926 },
	{ name: 'Samsung Galaxy S21', width: 384, height: 854 },
	{ name: 'Small Mobile', width: 320, height: 568 },

	// Tablet devices
	{ name: 'iPad Mini', width: 768, height: 1024 },
	{ name: 'iPad', width: 820, height: 1180 },
	{ name: 'iPad Pro', width: 1024, height: 1366 },
	{ name: 'Surface Pro', width: 912, height: 1368 },
	{ name: 'Small Tablet', width: 600, height: 800 },

	// Desktop devices
	{ name: 'Small Desktop', width: 1024, height: 768 },
	{ name: 'Standard Desktop', width: 1280, height: 720 },
	{ name: 'Large Desktop', width: 1440, height: 900 },
	{ name: 'Widescreen', width: 1680, height: 1050 },
	{ name: 'Ultra Wide', width: 1920, height: 1080 },
	{ name: '4K Monitor', width: 2560, height: 1440 },
	{ name: 'Ultra Wide 4K', width: 3440, height: 1440 },

	// Special aspect ratios
	{ name: 'Square Tablet', width: 768, height: 768 },
	{ name: 'Portrait Desktop', width: 1080, height: 1920 },
	{ name: 'Ultra Mobile', width: 280, height: 653 },
];

test.describe('Responsive Design - Perfect Fit Across All Screen Sizes', () => {
	VIEWPORTS.forEach((viewport) => {
		test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
			let page: Page;

			test.beforeEach(async ({ browser }) => {
				page = await browser.newPage();
				await page.setViewportSize({ width: viewport.width, height: viewport.height });
			});

			test.afterEach(async () => {
				await page.close();
			});

			test('should load homepage perfectly', async () => {
				await page.goto('http://localhost:8080');

				// Wait for full load
				await page.waitForLoadState('networkidle');

				// Check viewport dimensions
				const viewportSize = page.viewportSize();
				expect(viewportSize.width).toBe(viewport.width);
				expect(viewportSize.height).toBe(viewport.height);

				// Check that main content fits without horizontal scroll
				const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
				expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 1); // Allow 1px tolerance

				// Check that content is visible
				await expect(page.locator('body')).toBeVisible();

				// Check for responsive navigation
				if (viewport.width < 768) {
					// Mobile navigation
					await expect(page.locator('[data-testid="mobile-menu-btn"]')).toBeVisible();
				} else {
					// Desktop navigation
					await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
				}

				// Take screenshot for visual verification
				await page.screenshot({
					path: `test-results/responsive/${viewport.name.replace(/\s+/g, '_')}_homepage.png`,
					fullPage: true,
				});
			});

			test('should handle admin interface perfectly', async () => {
				await page.goto('http://localhost:8080/admin');

				// Check login form fits
				await expect(page.locator('[data-testid="login-form"]')).toBeVisible();

				// Verify no horizontal scroll
				const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
				expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 1);

				// Check form elements are properly sized
				const emailInput = page.locator('input[type="email"]');
				await expect(emailInput).toBeVisible();

				const inputBox = await emailInput.boundingBox();
				if (inputBox) {
					expect(inputBox.width).toBeGreaterThan(100); // Minimum usable width
					expect(inputBox.width).toBeLessThanOrEqual(viewport.width - 40); // With padding
				}

				await page.screenshot({
					path: `test-results/responsive/${viewport.name.replace(/\s+/g, '_')}_admin_login.png`,
					fullPage: true,
				});
			});

			test('should display content sections perfectly', async () => {
				// Navigate to a page with content sections
				await page.goto('http://localhost:8080');

				// Wait for content to load
				await page.waitForSelector('[data-testid="main-content"]');

				// Check each section fits properly
				const sections = page.locator('[data-testid^="section-"]');
				const sectionCount = await sections.count();

				for (let i = 0; i < sectionCount; i++) {
					const section = sections.nth(i);
					await expect(section).toBeVisible();

					// Check section doesn't overflow horizontally
					const sectionBox = await section.boundingBox();
					if (sectionBox) {
						expect(sectionBox.x + sectionBox.width).toBeLessThanOrEqual(viewport.width + 1);
					}
				}

				// Check text readability
				const textElements = page.locator('p, h1, h2, h3, h4, h5, h6');
				const textCount = await textElements.count();

				for (let i = 0; i < Math.min(textCount, 10); i++) {
					// Check first 10 text elements
					const textElement = textElements.nth(i);
					const textContent = await textElement.textContent();

					if (textContent && textContent.trim()) {
						// Check font size is reasonable for viewport
						const fontSize = await textElement.evaluate((el) => {
							return window.getComputedStyle(el).fontSize;
						});

						const fontSizeNum = Number.parseFloat(fontSize);
						const minFontSize = viewport.width < 768 ? 12 : 14;
						expect(fontSizeNum).toBeGreaterThanOrEqual(minFontSize);
					}
				}

				await page.screenshot({
					path: `test-results/responsive/${viewport.name.replace(/\s+/g, '_')}_content_sections.png`,
					fullPage: true,
				});
			});

			test('should handle navigation perfectly', async () => {
				await page.goto('http://localhost:8080');

				// Test navigation behavior
				if (viewport.width < 768) {
					// Mobile navigation test
					const mobileMenuBtn = page.locator('[data-testid="mobile-menu-btn"]');
					await expect(mobileMenuBtn).toBeVisible();

					// Check button is touch-friendly (minimum 44px)
					const btnBox = await mobileMenuBtn.boundingBox();
					if (btnBox) {
						expect(btnBox.width).toBeGreaterThanOrEqual(44);
						expect(btnBox.height).toBeGreaterThanOrEqual(44);
					}

					// Test mobile menu toggle
					await mobileMenuBtn.click();
					await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

					// Check menu items are properly sized
					const menuItems = page.locator('[data-testid="mobile-menu"] [data-testid="nav-item"]');
					const itemCount = await menuItems.count();

					for (let i = 0; i < itemCount; i++) {
						const item = menuItems.nth(i);
						const itemBox = await item.boundingBox();
						if (itemBox) {
							expect(itemBox.height).toBeGreaterThanOrEqual(44); // Touch target size
						}
					}
				} else {
					// Desktop navigation test
					const desktopNav = page.locator('[data-testid="desktop-nav"]');
					await expect(desktopNav).toBeVisible();

					// Check nav items are horizontally aligned
					const navItems = page.locator('[data-testid="desktop-nav"] [data-testid="nav-item"]');
					const itemCount = await navItems.count();

					if (itemCount > 0) {
						const firstItem = navItems.first();
						const lastItem = navItems.last();

						const firstBox = await firstItem.boundingBox();
						const lastBox = await lastItem.boundingBox();

						if (firstBox && lastBox) {
							// Items should be arranged horizontally
							expect(lastBox.y).toBeCloseTo(firstBox.y, 5); // Within 5px tolerance
						}
					}
				}

				await page.screenshot({
					path: `test-results/responsive/${viewport.name.replace(/\s+/g, '_')}_navigation.png`,
					fullPage: true,
				});
			});

			test('should handle forms perfectly', async () => {
				await page.goto('http://localhost:8080/admin');

				// Check form layout
				const form = page.locator('[data-testid="login-form"]');
				await expect(form).toBeVisible();

				// Check form doesn't overflow
				const formBox = await form.boundingBox();
				if (formBox) {
					expect(formBox.x + formBox.width).toBeLessThanOrEqual(viewport.width + 1);
				}

				// Check input fields are properly sized
				const inputs = page.locator('input');
				const inputCount = await inputs.count();

				for (let i = 0; i < inputCount; i++) {
					const input = inputs.nth(i);
					const inputBox = await input.boundingBox();

					if (inputBox) {
						// Input should have reasonable width
						expect(inputBox.width).toBeGreaterThan(50);
						expect(inputBox.width).toBeLessThanOrEqual(viewport.width - 40);

						// Input should have reasonable height for touch/click
						expect(inputBox.height).toBeGreaterThan(30);
					}
				}

				// Check button sizing
				const buttons = page.locator('button');
				const buttonCount = await buttons.count();

				for (let i = 0; i < buttonCount; i++) {
					const button = buttons.nth(i);
					const buttonBox = await button.boundingBox();

					if (buttonBox) {
						// Button should be touch-friendly on mobile
						const minSize = viewport.width < 768 ? 44 : 32;
						expect(buttonBox.height).toBeGreaterThanOrEqual(minSize);
					}
				}

				await page.screenshot({
					path: `test-results/responsive/${viewport.name.replace(/\s+/g, '_')}_forms.png`,
					fullPage: true,
				});
			});

			test('should handle images and media perfectly', async () => {
				await page.goto('http://localhost:8080');

				// Wait for images to load
				await page.waitForLoadState('networkidle');

				// Check images are responsive
				const images = page.locator('img');
				const imageCount = await images.count();

				for (let i = 0; i < Math.min(imageCount, 5); i++) {
					// Check first 5 images
					const image = images.nth(i);

					// Check image is loaded
					const isLoaded = await image.evaluate((img) => img.complete && img.naturalHeight !== 0);
					expect(isLoaded).toBe(true);

					// Check image doesn't overflow container
					const imageBox = await image.boundingBox();
					if (imageBox) {
						expect(imageBox.width).toBeLessThanOrEqual(viewport.width);
					}
				}

				await page.screenshot({
					path: `test-results/responsive/${viewport.name.replace(/\s+/g, '_')}_media.png`,
					fullPage: true,
				});
			});

			test('should handle text readability perfectly', async () => {
				await page.goto('http://localhost:8080');

				// Check text readability
				const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div');
				const textCount = await textElements.count();

				let readableTextCount = 0;

				for (let i = 0; i < Math.min(textCount, 20); i++) {
					// Check first 20 text elements
					const textElement = textElements.nth(i);
					const textContent = await textElement.textContent();

					if (textContent && textContent.trim().length > 0) {
						const styles = await textElement.evaluate((el) => {
							const computed = window.getComputedStyle(el);
							return {
								fontSize: computed.fontSize,
								lineHeight: computed.lineHeight,
								color: computed.color,
								backgroundColor: computed.backgroundColor,
							};
						});

						// Check font size is appropriate for viewport
						const fontSize = Number.parseFloat(styles.fontSize);
						const minFontSize = viewport.width < 768 ? 12 : 14;
						const maxFontSize = viewport.width < 768 ? 32 : 48;

						expect(fontSize).toBeGreaterThanOrEqual(minFontSize);
						expect(fontSize).toBeLessThanOrEqual(maxFontSize);

						// Check line height is reasonable
						const lineHeight = Number.parseFloat(styles.lineHeight);
						expect(lineHeight).toBeGreaterThanOrEqual(1.2);
						expect(lineHeight).toBeLessThanOrEqual(2);

						readableTextCount++;
					}
				}

				// Ensure we have readable text
				expect(readableTextCount).toBeGreaterThan(0);

				await page.screenshot({
					path: `test-results/responsive/${viewport.name.replace(/\s+/g, '_')}_text_readability.png`,
					fullPage: true,
				});
			});

			test('should handle scrolling perfectly', async () => {
				await page.goto('http://localhost:8080');

				// Check vertical scrolling behavior
				const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
				const viewportHeight = viewport.height;

				if (documentHeight > viewportHeight) {
					// Page should be scrollable
					expect(documentHeight).toBeGreaterThan(viewportHeight);

					// Scroll to bottom
					await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
					await page.waitForTimeout(1000);

					// Check content at bottom is visible
					const bottomContent = page.locator('body').last();
					await expect(bottomContent).toBeInViewport();

					// Scroll back to top
					await page.evaluate(() => window.scrollTo(0, 0));
					await page.waitForTimeout(1000);
				}

				// Check no horizontal scrolling is needed
				const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
				expect(documentWidth).toBeLessThanOrEqual(viewport.width + 1);

				await page.screenshot({
					path: `test-results/responsive/${viewport.name.replace(/\s+/g, '_')}_scrolling.png`,
					fullPage: true,
				});
			});

			test('should handle touch interactions perfectly on mobile', async () => {
				if (viewport.width >= 768) {
					test.skip(); // Skip touch tests on desktop
					return;
				}

				await page.goto('http://localhost:8080');

				// Test touch targets
				const touchTargets = page.locator('button, a, input, [role="button"]');
				const targetCount = await touchTargets.count();

				for (let i = 0; i < Math.min(targetCount, 10); i++) {
					// Check first 10 targets
					const target = touchTargets.nth(i);
					const targetBox = await target.boundingBox();

					if (targetBox) {
						// Touch targets should be at least 44x44px
						expect(targetBox.width).toBeGreaterThanOrEqual(44);
						expect(targetBox.height).toBeGreaterThanOrEqual(44);

						// Check adequate spacing between targets
						const nextTarget = touchTargets.nth(i + 1);
						if (nextTarget) {
							const nextBox = await nextTarget.boundingBox();
							if (nextBox) {
								const horizontalSpacing = Math.abs(nextBox.x - targetBox.x);
								const verticalSpacing = Math.abs(nextBox.y - targetBox.y);

								// Should have reasonable spacing
								expect(horizontalSpacing > 0 || verticalSpacing > 0).toBe(true);
							}
						}
					}
				}

				await page.screenshot({
					path: `test-results/responsive/${viewport.name.replace(/\s+/g, '_')}_touch_targets.png`,
					fullPage: true,
				});
			});

			test('should handle layout shifts perfectly', async () => {
				await page.goto('http://localhost:8080');

				// Wait for initial load
				await page.waitForLoadState('networkidle');

				// Get initial layout
				const initialLayout = await page.evaluate(() => {
					const elements = document.querySelectorAll('[data-testid^="section-"]');
					return Array.from(elements).map((el) => ({
						id: el.getAttribute('data-testid'),
						rect: el.getBoundingClientRect(),
					}));
				});

				// Wait a bit more for any delayed content
				await page.waitForTimeout(2000);

				// Check for layout shifts
				const finalLayout = await page.evaluate(() => {
					const elements = document.querySelectorAll('[data-testid^="section-"]');
					return Array.from(elements).map((el) => ({
						id: el.getAttribute('data-testid'),
						rect: el.getBoundingClientRect(),
					}));
				});

				// Compare layouts
				for (const initial of initialLayout) {
					const final = finalLayout.find((f) => f.id === initial.id);
					if (final) {
						// Allow minimal movement (less than 5px)
						const xDiff = Math.abs(initial.rect.x - final.rect.x);
						const yDiff = Math.abs(initial.rect.y - final.rect.y);

						expect(xDiff).toBeLessThanOrEqual(5);
						expect(yDiff).toBeLessThanOrEqual(5);
					}
				}

				await page.screenshot({
					path: `test-results/responsive/${viewport.name.replace(/\s+/g, '_')}_layout_stability.png`,
					fullPage: true,
				});
			});
		});
	});

	test.describe('Cross-viewport Consistency', () => {
		test('should maintain consistent functionality across all viewports', async ({ browser }) => {
			const results = [];

			for (const viewport of VIEWPORTS) {
				const page = await browser.newPage();
				await page.setViewportSize({ width: viewport.width, height: viewport.height });

				try {
					await page.goto('http://localhost:8080');
					await page.waitForLoadState('networkidle');

					// Check core functionality
					const hasNavigation = await page.locator('nav').isVisible();
					const hasMainContent = await page.locator('main').isVisible();
					const hasFooter = await page.locator('footer').isVisible();
					const noHorizontalScroll = await page.evaluate(
						() => document.body.scrollWidth <= window.innerWidth
					);

					results.push({
						viewport: viewport.name,
						size: `${viewport.width}x${viewport.height}`,
						hasNavigation,
						hasMainContent,
						hasFooter,
						noHorizontalScroll,
						success: hasNavigation && hasMainContent && noHorizontalScroll,
					});
				} catch (error) {
					results.push({
						viewport: viewport.name,
						size: `${viewport.width}x${viewport.height}`,
						success: false,
						error: error.message,
					});
				}

				await page.close();
			}

			// Verify all viewports work correctly
			const failedViewports = results.filter((r) => !r.success);

			if (failedViewports.length > 0) {
				console.log('Failed viewports:', failedViewports);
			}

			expect(failedViewports.length).toBe(0);

			// Log results for verification
			console.log('Responsive Test Results:');
			results.forEach((result) => {
				console.log(`✅ ${result.viewport} (${result.size}): ${result.success ? 'PASS' : 'FAIL'}`);
			});
		});
	});

	test.describe('Performance Across Viewports', () => {
		VIEWPORTS.forEach((viewport) => {
			test(`should load quickly on ${viewport.name}`, async ({ page }) => {
				await page.setViewportSize({ width: viewport.width, height: viewport.height });

				// Measure load time
				const startTime = Date.now();
				await page.goto('http://localhost:8080');
				await page.waitForLoadState('networkidle');
				const loadTime = Date.now() - startTime;

				// Performance expectations based on viewport size
				const maxLoadTime =
					viewport.width < 768
						? 5000
						: // Mobile: 5s
							viewport.width < 1024
							? 4000
							: // Tablet: 4s
								3000; // Desktop: 3s

				expect(loadTime).toBeLessThan(maxLoadTime);

				console.log(`${viewport.name} load time: ${loadTime}ms (max: ${maxLoadTime}ms)`);
			});
		});
	});
});
