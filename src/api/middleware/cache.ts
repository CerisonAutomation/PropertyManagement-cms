// Cache Middleware - Response caching with Redis/in-memory support

import { createHash } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

interface CacheOptions {
	ttl?: number; // Time to live in seconds
	key?: string; // Custom cache key
	condition?: (req: Request) => boolean; // Cache condition function
	skipCache?: boolean; // Skip caching
	invalidateOn?: string[]; // Invalidate these keys on cache hit
	tags?: string[]; // Cache tags for invalidation
}

// In-memory cache store (in production, use Redis)
const cacheStore = new Map<string, { data: any; expires: number; tags: string[] }>();

// Cache middleware factory
export const cache = (options: CacheOptions = {}) => {
	const {
		ttl = 300, // 5 minutes default
		key,
		condition,
		skipCache = false,
		invalidateOn = [],
		tags = [],
	} = options;

	return (req: Request, res: Response, next: NextFunction) => {
		// Skip caching if explicitly disabled
		if (skipCache) {
			return next();
		}

		// Check cache condition
		if (condition && !condition(req)) {
			return next();
		}

		// Don't cache non-GET requests
		if (req.method !== 'GET') {
			return next();
		}

		// Don't cache if there are errors in query
		if (req.query && Object.keys(req.query).includes('error')) {
			return next();
		}

		const cacheKey = key || generateCacheKey(req);
		const now = Date.now();

		// Check cache
		const cached = cacheStore.get(cacheKey);
		if (cached && cached.expires > now) {
			// Invalidate other keys if specified
			if (invalidateOn.length > 0) {
				invalidateOn.forEach((invalidateKey) => {
					cacheStore.delete(invalidateKey);
				});
			}

			// Set cache headers
			res.set({
				'X-Cache': 'HIT',
				'X-Cache-Key': cacheKey,
				'X-Cache-TTL': Math.max(0, Math.ceil((cached.expires - now) / 1000)).toString(),
				'Cache-Control': `public, max-age=${Math.floor((cached.expires - now) / 1000)}`,
			});

			// Send cached response
			return res.json(cached.data);
		}

		// Cache miss - continue to handler
		const originalSend = res.json;
		let responseData: any;
		let statusCode: number;

		// Override res.json to capture response
		res.json = function (data) {
			responseData = data;
			statusCode = res.statusCode;

			// Only cache successful responses
			if (statusCode >= 200 && statusCode < 300) {
				const expires = now + ttl * 1000;

				cacheStore.set(cacheKey, {
					data,
					expires,
					tags,
				});
			}

			return originalSend.call(this, data);
		};

		// Set cache headers for miss
		res.set({
			'X-Cache': 'MISS',
			'X-Cache-Key': cacheKey,
			'Cache-Control': `public, max-age=${ttl}`,
		});

		next();
	};
};

// Generate cache key from request
const generateCacheKey = (req: Request): string => {
	const url = req.originalUrl || req.url;
	const method = req.method;
	const query = JSON.stringify(req.query);
	const headers = req.headers['accept'] || '';

	const keyString = `${method}:${url}:${query}:${headers}`;
	return createHash('md5').update(keyString).digest('hex');
};

// Cache invalidation
export const invalidateCache = (pattern: string | string[] | ((key: string) => boolean)) => {
	const keysToDelete: string[] = [];

	for (const [key] of cacheStore.entries()) {
		if (typeof pattern === 'string') {
			// String pattern match
			if (key.includes(pattern)) {
				keysToDelete.push(key);
			}
		} else if (Array.isArray(pattern)) {
			// Array of patterns
			if (pattern.some((p) => key.includes(p))) {
				keysToDelete.push(key);
			}
		} else if (typeof pattern === 'function') {
			// Function pattern
			if (pattern(key)) {
				keysToDelete.push(key);
			}
		}
	}

	keysToDelete.forEach((key) => cacheStore.delete(key));

	return keysToDelete.length;
};

// Invalidate by tags
export const invalidateByTags = (tags: string[]) => {
	const keysToDelete: string[] = [];

	for (const [key, value] of cacheStore.entries()) {
		if (value.tags.some((tag) => tags.includes(tag))) {
			keysToDelete.push(key);
		}
	}

	keysToDelete.forEach((key) => cacheStore.delete(key));

	return keysToDelete.length;
};

// Cache warming
export const warmCache = async (
	requests: Array<{
		url: string;
		method?: string;
		query?: any;
		ttl?: number;
	}>
) => {
	// This would typically make actual HTTP requests to warm the cache
	// For now, we'll just log what would be warmed
	console.log('Cache warming requests:', requests);

	const warmedKeys = requests.map((req) => ({
		key: generateCacheKey(req as any),
		expires: Date.now() + (req.ttl || 300) * 1000,
	}));

	return warmedKeys;
};

// Cache statistics
export const getCacheStats = () => {
	const now = Date.now();
	let totalEntries = 0;
	let expiredEntries = 0;
	let validEntries = 0;
	const tagCounts: Record<string, number> = {};

	for (const [key, value] of cacheStore.entries()) {
		totalEntries++;

		if (now > value.expires) {
			expiredEntries++;
		} else {
			validEntries++;

			// Count tags
			value.tags.forEach((tag) => {
				tagCounts[tag] = (tagCounts[tag] || 0) + 1;
			});
		}
	}

	return {
		totalEntries,
		validEntries,
		expiredEntries,
		hitRate: 0, // Would need tracking to calculate
		tagCounts,
		memoryUsage: JSON.stringify([...cacheStore.entries()]).length, // Rough estimate
	};
};

// Clean up expired entries
export const cleanupExpiredCache = () => {
	const now = Date.now();
	let cleaned = 0;

	for (const [key, value] of cacheStore.entries()) {
		if (now > value.expires) {
			cacheStore.delete(key);
			cleaned++;
		}
	}

	return cleaned;
};

// Cache middleware for different scenarios
export const cacheStrategies = {
	// Short-lived cache for frequently changing data
	short: cache({ ttl: 60 }), // 1 minute

	// Medium-lived cache for semi-static data
	medium: cache({ ttl: 300 }), // 5 minutes

	// Long-lived cache for static data
	long: cache({ ttl: 3600 }), // 1 hour

	// Very long-lived cache for rarely changing data
	veryLong: cache({ ttl: 86400 }), // 24 hours

	// Cache only for successful responses
	successOnly: cache({
		ttl: 300,
		condition: (req) => req.method === 'GET',
	}),

	// Cache with custom key
	customKey: (keyGenerator: (req: Request) => string) =>
		cache({
			ttl: 300,
			key: keyGenerator,
		}),

	// Conditional cache based on query parameters
	conditional: (condition: (req: Request) => boolean) =>
		cache({
			ttl: 300,
			condition,
		}),

	// Cache with invalidation
	withInvalidation: (invalidateOn: string[]) =>
		cache({
			ttl: 300,
			invalidateOn,
		}),

	// Tagged cache for bulk invalidation
	tagged: (tags: string[]) =>
		cache({
			ttl: 300,
			tags,
		}),
};

// Cache warming for common endpoints
export const commonCacheWarmers = {
	// Warm homepage cache
	homepage: () =>
		warmCache([
			{ url: '/api/pages', query: { slug: 'home' }, ttl: 300 },
			{ url: '/api/settings', query: { group: 'hero' }, ttl: 600 },
		]),

	// Warm navigation cache
	navigation: () => warmCache([{ url: '/api/navigation', ttl: 600 }]),

	// Warm blog posts cache
	blogPosts: () =>
		warmCache([
			{ url: '/api/blog-posts', query: { limit: 10, status: 'published' }, ttl: 300 },
			{ url: '/api/blog-posts', query: { limit: 10, category: 'PropertyManagement' }, ttl: 300 },
		]),

	// Warm properties cache
	properties: () =>
		warmCache([
			{ url: '/api/properties', query: { limit: 20, status: 'available' }, ttl: 300 },
			{ url: '/api/properties', query: { limit: 10, type: 'apartment' }, ttl: 300 },
		]),
};

// Cache monitoring
export const monitorCache = () => {
	const stats = getCacheStats();

	console.log('Cache Statistics:', {
		total: stats.totalEntries,
		valid: stats.validEntries,
		expired: stats.expiredEntries,
		memoryUsage: `${(stats.memoryUsage / 1024 / 1024).toFixed(2)} MB`,
		tags: Object.keys(stats.tagCounts).length,
		topTags: Object.entries(stats.tagCounts)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([tag, count]) => ({ tag, count })),
	});

	// Alert if cache is getting full
	if (stats.totalEntries > 10000) {
		console.warn('Cache is getting full, consider cleanup or increasing memory');
	}

	// Alert if many expired entries
	if (stats.expiredEntries > stats.validEntries) {
		console.warn('Many expired cache entries, consider running cleanup');
	}

	return stats;
};

// Periodic cleanup (call this every few minutes)
export const startCacheCleanup = (intervalMs: number = 5 * 60 * 1000) => {
	setInterval(() => {
		const cleaned = cleanupExpiredCache();
		if (cleaned > 0) {
			console.log(`Cleaned up ${cleaned} expired cache entries`);
		}
	}, intervalMs);
};
