// Rate Limiting Middleware - Prevent API abuse and ensure fair usage

import { createError } from '@/api/utils/error';
import type { NextFunction, Request, Response } from 'express';

interface RateLimitOptions {
	windowMs: number; // Time window in milliseconds
	max: number; // Maximum number of requests per window
	message?: string; // Custom error message
	skipSuccessfulRequests?: boolean; // Don't count successful requests
	skipFailedRequests?: boolean; // Don't count failed requests
	keyGenerator?: (req: Request) => string; // Custom key generator
}

// In-memory store for rate limits (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware factory
export const rateLimit = (options: RateLimitOptions) => {
	const {
		windowMs,
		max,
		message = `Too many requests, please try again later.`,
		skipSuccessfulRequests = false,
		skipFailedRequests = false,
		keyGenerator = (req) => getDefaultKey(req),
	} = options;

	return (req: Request, res: Response, next: NextFunction) => {
		const key = keyGenerator(req);
		const now = Date.now();
		const resetTime = now + windowMs;

		// Get or create rate limit entry
		let entry = rateLimitStore.get(key);

		if (!entry || now > entry.resetTime) {
			// Create new entry or reset expired entry
			entry = { count: 0, resetTime };
			rateLimitStore.set(key, entry);
		}

		// Increment count
		entry.count++;

		// Check if limit exceeded
		if (entry.count > max) {
			const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

			// Set rate limit headers
			res.set({
				'X-RateLimit-Limit': max,
				'X-RateLimit-Remaining': Math.max(0, max - entry.count),
				'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
				'Retry-After': retryAfter,
			});

			throw createError('RATE_LIMIT_EXCEEDED', message, 429, { retryAfter });
		}

		// Set rate limit headers for successful requests
		res.set({
			'X-RateLimit-Limit': max,
			'X-RateLimit-Remaining': Math.max(0, max - entry.count),
			'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
		});

		// Track request outcome for skip options
		const originalSend = res.send;
		let statusCode: number;

		res.send = function (body) {
			statusCode = res.statusCode;
			return originalSend.call(this, body);
		};

		// Clean up based on outcome after response
		res.on('finish', () => {
			if (skipSuccessfulRequests && statusCode >= 200 && statusCode < 300) {
				entry.count--; // Don't count successful request
			}
			if (skipFailedRequests && statusCode >= 400) {
				entry.count--; // Don't count failed request
			}
		});

		next();
	};
};

// Default key generator
const getDefaultKey = (req: Request): string => {
	// Use IP address as default key
	const forwarded = req.headers['x-forwarded-for'];
	const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
	return ip || 'unknown';
};

// Predefined rate limit configurations
export const rateLimits = {
	// Very strict for authentication endpoints
	auth: rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 5, // 5 attempts per 15 minutes
		message: 'Too many authentication attempts, please try again later.',
		skipSuccessfulRequests: false,
		skipFailedRequests: false,
	}),

	// Strict for write operations
	write: rateLimit({
		windowMs: 60 * 1000, // 1 minute
		max: 50, // 50 requests per minute
		message: 'Too many write requests, please try again later.',
		skipSuccessfulRequests: false,
		skipFailedRequests: true,
	}),

	// Moderate for general API usage
	read: rateLimit({
		windowMs: 60 * 1000, // 1 minute
		max: 100, // 100 requests per minute
		message: 'Too many requests, please try again later.',
		skipSuccessfulRequests: false,
		skipFailedRequests: true,
	}),

	// Lenient for public endpoints
	public: rateLimit({
		windowMs: 60 * 1000, // 1 minute
		max: 200, // 200 requests per minute
		message: 'Too many requests, please try again later.',
		skipSuccessfulRequests: false,
		skipFailedRequests: true,
	}),

	// Very strict for file uploads
	upload: rateLimit({
		windowMs: 60 * 1000, // 1 minute
		max: 10, // 10 uploads per minute
		message: 'Too many upload requests, please try again later.',
		skipSuccessfulRequests: false,
		skipFailedRequests: false,
	}),

	// Search endpoint specific
	search: rateLimit({
		windowMs: 60 * 1000, // 1 minute
		max: 30, // 30 searches per minute
		message: 'Too many search requests, please try again later.',
		skipSuccessfulRequests: false,
		skipFailedRequests: true,
	}),
};

// User-specific rate limiting
export const createUserRateLimit = (userId: string, options: Partial<RateLimitOptions> = {}) => {
	return rateLimit({
		windowMs: 60 * 1000,
		max: 1000, // Higher limit for authenticated users
		keyGenerator: (req) => `user:${userId}`,
		...options,
	});
};

// Role-based rate limiting
export const createRoleRateLimit = (role: string, options: Partial<RateLimitOptions> = {}) => {
	const limits = {
		super_admin: { max: 5000, windowMs: 60 * 1000 },
		admin: { max: 2000, windowMs: 60 * 1000 },
		editor: { max: 1000, windowMs: 60 * 1000 },
		author: { max: 500, windowMs: 60 * 1000 },
		viewer: { max: 200, windowMs: 60 * 1000 },
	};

	const roleLimit = limits[role as keyof typeof limits] || limits.viewer;

	return rateLimit({
		...roleLimit,
		keyGenerator: (req) => `role:${role}:${getDefaultKey(req)}`,
		...options,
	});
};

// API key rate limiting
export const createApiKeyRateLimit = (options: Partial<RateLimitOptions> = {}) => {
	return rateLimit({
		windowMs: 60 * 1000,
		max: 1000,
		keyGenerator: (req) => {
			const apiKey = req.headers['x-api-key'] || req.query.api_key;
			return apiKey ? `apikey:${apiKey}` : getDefaultKey(req);
		},
		...options,
	});
};

// Burst rate limiting (allow short bursts)
export const createBurstRateLimit = (options: {
	burstMax: number;
	sustainedMax: number;
	windowMs: number;
}) => {
	const { burstMax, sustainedMax, windowMs } = options;

	return rateLimit({
		windowMs,
		max: sustainedMax,
		keyGenerator: (req) => {
			const key = getDefaultKey(req);
			const now = Date.now();
			const burstKey = `${key}:burst:${Math.floor(now / 10000)}`; // 10-second burst windows

			// Check burst limit first
			const burstEntry = rateLimitStore.get(burstKey);
			if (burstEntry && burstEntry.count < burstMax) {
				return burstKey;
			}

			return key; // Fall back to sustained limit
		},
	});
};

// Clean up expired entries (call this periodically)
export const cleanupExpiredEntries = () => {
	const now = Date.now();
	for (const [key, entry] of rateLimitStore.entries()) {
		if (now > entry.resetTime) {
			rateLimitStore.delete(key);
		}
	}
};

// Get rate limit status for a key
export const getRateLimitStatus = (key: string) => {
	const entry = rateLimitStore.get(key);
	if (!entry) {
		return { count: 0, resetTime: Date.now() + 60000, remaining: 100 };
	}

	return {
		count: entry.count,
		resetTime: entry.resetTime,
		remaining: Math.max(0, 100 - entry.count), // Default max of 100
	};
};

// Reset rate limit for a key (admin function)
export const resetRateLimit = (key: string) => {
	rateLimitStore.delete(key);
};

// Rate limit middleware for specific endpoints
export const endpointRateLimits = {
	// Authentication endpoints
	login: rateLimits.auth,
	register: rateLimits.auth,
	refreshToken: rateLimits.auth,

	// Content creation endpoints
	createPage: rateLimits.write,
	createBlogPost: rateLimits.write,
	createProperty: rateLimits.write,

	// File operations
	uploadFile: rateLimits.upload,

	// Search endpoints
	search: rateLimits.search,

	// General API
	default: rateLimits.read,
};
