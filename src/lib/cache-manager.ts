/**
 * Cache Management for Vercel Deployment
 * Handles request caching, cache invalidation, and TTL management
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

/**
 * In-memory cache for API responses
 * Useful for reducing database queries and API calls
 */
export class MemoryCache<T = any> {
	private cache = new Map<string, CacheEntry<T>>();

	/**
	 * Get cached value
	 */
	get(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		// Check if expired
		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	/**
	 * Set cache value
	 */
	set(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl: ttlMs,
		});
	}

	/**
	 * Delete cache entry
	 */
	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	/**
	 * Clear all cache
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get cache stats
	 */
	getStats() {
		let validEntries = 0;
		let expiredEntries = 0;

		this.cache.forEach((entry) => {
			if (Date.now() - entry.timestamp > entry.ttl) {
				expiredEntries++;
			} else {
				validEntries++;
			}
		});

		return { validEntries, expiredEntries, totalSize: this.cache.size };
	}

	/**
	 * Clean expired entries
	 */
	cleanExpired(): number {
		let removed = 0;
		this.cache.forEach((entry, key) => {
			if (Date.now() - entry.timestamp > entry.ttl) {
				this.cache.delete(key);
				removed++;
			}
		});
		return removed;
	}
}

/**
 * LocalStorage cache for browser persistence
 * Survives page refreshes but with storage limits
 */
export class LocalStorageCache {
	private prefix: string;
	private maxSize: number; // Max single item size in KB

	constructor(prefix = 'app_cache:', maxSizeKb = 5) {
		this.prefix = prefix;
		this.maxSize = maxSizeKb * 1024;
	}

	/**
	 * Get cached value
	 */
	get<T>(key: string): T | null {
		try {
			const item = localStorage.getItem(this.getKey(key));
			if (!item) return null;

			const entry = JSON.parse(item) as CacheEntry<T>;

			// Check expiration
			if (Date.now() - entry.timestamp > entry.ttl) {
				this.delete(key);
				return null;
			}

			return entry.data;
		} catch {
			return null;
		}
	}

	/**
	 * Set cache value
	 */
	set<T>(key: string, data: T, ttlMs = 24 * 60 * 60 * 1000): boolean {
		try {
			const entry: CacheEntry<T> = {
				data,
				timestamp: Date.now(),
				ttl: ttlMs,
			};

			const json = JSON.stringify(entry);
			if (json.length > this.maxSize) {
				console.warn(`Cache entry for ${key} exceeds max size`);
				return false;
			}

			localStorage.setItem(this.getKey(key), json);
			return true;
		} catch (e) {
			if (e instanceof Error && e.name === 'QuotaExceededError') {
				console.warn('LocalStorage quota exceeded');
				this.cleanExpired();
			}
			return false;
		}
	}

	/**
	 * Delete cache entry
	 */
	delete(key: string): void {
		localStorage.removeItem(this.getKey(key));
	}

	/**
	 * Clear all cached items
	 */
	clear(): void {
		const keys = Object.keys(localStorage);
		keys.forEach((key) => {
			if (key.startsWith(this.prefix)) {
				localStorage.removeItem(key);
			}
		});
	}

	/**
	 * Clean expired entries
	 */
	cleanExpired(): number {
		const keys = Object.keys(localStorage);
		let removed = 0;

		keys.forEach((key) => {
			if (key.startsWith(this.prefix)) {
				try {
					const item = localStorage.getItem(key);
					if (item) {
						const entry = JSON.parse(item) as CacheEntry<any>;
						if (Date.now() - entry.timestamp > entry.ttl) {
							localStorage.removeItem(key);
							removed++;
						}
					}
				} catch {
					// Ignore parse errors
				}
			}
		});

		return removed;
	}

	private getKey(key: string): string {
		return `${this.prefix}${key}`;
	}
}

/**
 * Two-level cache (Memory + LocalStorage)
 * Fast memory access with persistent fallback
 */
export class HybridCache<T = any> {
	private memoryCache: MemoryCache<T>;
	private storageCache: LocalStorageCache;

	constructor(namespace = 'default') {
		this.memoryCache = new MemoryCache();
		this.storageCache = new LocalStorageCache(`${namespace}:`);
	}

	/**
	 * Get with memory priority, fallback to storage
	 */
	get(key: string): T | null {
		// Try memory first (fast)
		let value = this.memoryCache.get(key);
		if (value !== null) return value;

		// Fallback to persistent storage
		value = this.storageCache.get<T>(key);
		if (value !== null) {
			// Restore to memory for fast access
			this.memoryCache.set(key, value, 5 * 60 * 1000);
		}

		return value;
	}

	/**
	 * Set in both caches
	 */
	set(key: string, data: T, memoryTtlMs = 5 * 60 * 1000, storageTtlMs = 24 * 60 * 60 * 1000): void {
		this.memoryCache.set(key, data, memoryTtlMs);
		this.storageCache.set(key, data, storageTtlMs);
	}

	/**
	 * Delete from both caches
	 */
	delete(key: string): void {
		this.memoryCache.delete(key);
		this.storageCache.delete(key);
	}

	/**
	 * Clear both caches
	 */
	clear(): void {
		this.memoryCache.clear();
		this.storageCache.clear();
	}
}

/**
 * HTTP Cache headers for server-side caching
 */
export function generateCacheHeaders(ttlSeconds: number, isPublic = true, mustRevalidate = false) {
	const visibility = isPublic ? 'public' : 'private';
	const revalidate = mustRevalidate ? ', must-revalidate' : '';

	return {
		'Cache-Control': `${visibility}, max-age=${ttlSeconds}${revalidate}`,
		Vary: 'Accept-Encoding',
	};
}
