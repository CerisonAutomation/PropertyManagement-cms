/**
 * Vercel Analytics and Performance Monitoring
 * Optimized for Vercel deployment with Core Web Vitals tracking
 */

interface PerformanceMetrics {
	FCP?: number; // First Contentful Paint
	LCP?: number; // Largest Contentful Paint
	CLS?: number; // Cumulative Layout Shift
	FID?: number; // First Input Delay
	TTFB?: number; // Time to First Byte
}

/**
 * Track Web Vitals
 * Automatically send metrics to Vercel Analytics
 */
export function trackWebVitals(): void {
	if (!('web-vital' in window)) {
		// Use Vercel Web Analytics integration if available
		if (typeof window !== 'undefined' && (window as any).va) {
			const metrics: PerformanceMetrics = {};

			// Track navigation timing using PerformanceNavigationTiming
			if ('navigation' in performance) {
				const nav = (performance as any).getEntriesByType('navigation')[0];
				if (nav?.responseStart) {
					metrics.TTFB = nav.responseStart - nav.fetchStart;
				}
			}

			// Track using PerformanceObserver for modern metrics
			if ('PerformanceObserver' in window) {
				try {
					// Observe LCP (Largest Contentful Paint)
					new PerformanceObserver((list) => {
						const entries = list.getEntries();
						const lastEntry = entries[entries.length - 1];
						if (lastEntry) {
							metrics.LCP = lastEntry.startTime;
						}
						reportMetrics(metrics);
					}).observe({ entryTypes: ['largest-contentful-paint'] });

					// Observe CLS (Cumulative Layout Shift)
					new PerformanceObserver((list) => {
						const entries = list.getEntries();
						let cls = 0;
						entries.forEach((entry: any) => {
							if (!entry.hadRecentInput) {
								cls += entry.value;
							}
						});
						metrics.CLS = cls;
						reportMetrics(metrics);
					}).observe({ entryTypes: ['layout-shift'] });

					// Observe FID (First Input Delay)
					new PerformanceObserver((list) => {
						const entries = list.getEntries();
						entries.forEach((entry: any) => {
							metrics.FID = entry.processingStart - entry.startTime;
							reportMetrics(metrics);
						});
					}).observe({ entryTypes: ['first-input'] });
				} catch (e) {
					console.debug('Performance Observer not fully supported');
				}
			}
		}
	}
}

/**
 * Report metrics to Vercel Analytics
 */
function reportMetrics(metrics: PerformanceMetrics): void {
	// This will be automatically picked up by Vercel Web Analytics
	if (typeof window !== 'undefined' && (window as any).va) {
		(window as any).va('event', {
			name: 'web-vitals',
			metrics,
		});
	}
}

/**
 * Track API performance
 */
export function trackAPICall(endpoint: string, duration: number, status: number): void {
	if (typeof window !== 'undefined' && (window as any).va) {
		(window as any).va('event', {
			name: 'api-call',
			endpoint,
			duration,
			status,
		});
	}
}

/**
 * Track user interactions
 */
export function trackUserInteraction(action: string, metadata?: Record<string, any>): void {
	if (typeof window !== 'undefined' && (window as any).va) {
		(window as any).va('event', {
			name: 'user-interaction',
			action,
			...metadata,
		});
	}
}

/**
 * Measure execution time for async operations
 */
export async function measureAsyncOperation<T>(
	name: string,
	operation: () => Promise<T>
): Promise<T> {
	const start = performance.now();
	try {
		const result = await operation();
		const duration = performance.now() - start;
		trackAPICall(name, duration, 200);
		return result;
	} catch (error) {
		const duration = performance.now() - start;
		trackAPICall(name, duration, 500);
		throw error;
	}
}
