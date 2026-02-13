/**
 * Security utilities and validation
 */

// Input sanitization and validation
export function sanitizeHTML(input: string): string {
	if (!input) {
		return '';
	}

	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		'/': '&#x2F;',
	};

	return input.replace(/[&<>"'/]/g, (char) => map[char] ?? '');
}

export function sanitizeFilename(filename: string): string {
	if (!filename) {
		return '';
	}

	return filename
		.replace(/[^a-zA-Z0-9.-]/g, '_')
		.replace(/_{2,}/g, '_')
		.substring(0, 255);
}

export function validateEmail(email: string): boolean {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
}

export function validateSlug(slug: string): boolean {
	const re = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	return re.test(slug);
}

export function validateUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export function isValidJson(str: string): boolean {
	try {
		JSON.parse(str);
		return true;
	} catch {
		return false;
	}
}

/**
 * Removes HTML/script content from user input while preserving readable text.
 */
export function sanitizeInput(input: string): string {
	if (!input) {
		return '';
	}

	return input
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
		.replace(/<[^>]+>/g, '')
		.trim();
}

/**
 * Deterministic, fast hash for lightweight client-side fingerprinting.
 * NOTE: This is not a password-storage hash for backend authentication.
 */
export function hashPassword(password: string): string {
	let hash = 2166136261;

	for (let i = 0; i < password.length; i++) {
		hash ^= password.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}

	return (hash >>> 0).toString(16).padStart(8, '0');
}

// Password strength validation
export function validatePasswordStrength(password: string): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (password.length < 12) {
		errors.push('Password must be at least 12 characters long');
	}

	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}

	if (!/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}

	if (!/[0-9]/.test(password)) {
		errors.push('Password must contain at least one number');
	}

	if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
		errors.push('Password must contain at least one special character');
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

// XSS prevention
export function escapeHtml(text: string): string {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

// CSRF protection
export function generateCSRFToken(): string {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Rate limiting
export class RateLimiter {
	private requests: Map<string, number[]> = new Map();

	constructor(
		private windowMs: number,
		private maxRequests: number
	) {}

	isBlocked(key: string): boolean {
		const now = Date.now();
		const requests = this.requests.get(key) || [];

		// Remove old requests outside the window
		const validRequests = requests.filter((time) => now - time < this.windowMs);

		if (validRequests.length >= this.maxRequests) {
			return true;
		}

		validRequests.push(now);
		this.requests.set(key, validRequests);

		return false;
	}

	reset(key: string): void {
		this.requests.delete(key);
	}
}

// Production-grade Content Security Policy with strict security
const getProductionCSP = (): string => {
	const isProduction = import.meta.env.PROD;

	const baseDirectives = [
		"default-src 'self'",
		// Use nonce in production, restrict unsafe-eval
		isProduction
			? "script-src 'self' 'nonce-{RANDOM}' 'strict-dynamic'"
			: "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
		isProduction ? "style-src 'self' 'nonce-{RANDOM}'" : "style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: https: blob: blob:",
		"font-src 'self' data:",
		"connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com",
		"frame-ancestors 'none'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		'upgrade-insecure-requests',
	];

	return baseDirectives.join('; ');
};

// Enhanced Security headers with production defaults
export const securityHeaders = {
	'X-DNS-Prefetch-Control': 'on',
	'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
	'X-Frame-Options': 'SAMEORIGIN',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
	'X-XSS-Protection': '1; mode=block',
	'Cross-Origin-Embedder-Policy': 'require-corp',
	'Cross-Origin-Opener-Policy': 'same-origin',
	'Content-Security-Policy': getProductionCSP(),
};

// Sanitize object recursively
export function sanitizeObject<T extends Record<string, unknown>>(
	obj: T,
	maxDepth = 5,
	currentDepth = 0
): T {
	if (currentDepth >= maxDepth) {
		return obj;
	}

	const sanitized = { ...obj };

	for (const key in sanitized) {
		const value = sanitized[key];

		if (typeof value === 'string') {
			sanitized[key] = sanitizeHTML(value) as T[Extract<keyof T, string>];
		} else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			sanitized[key] = sanitizeObject(
				value as Record<string, unknown>,
				maxDepth,
				currentDepth + 1
			) as T[Extract<keyof T, string>];
		} else if (Array.isArray(value)) {
			sanitized[key] = value.map((item) => {
				if (typeof item === 'object' && item !== null) {
					return sanitizeObject(item as Record<string, unknown>, maxDepth, currentDepth + 1);
				}

				return item;
			}) as T[Extract<keyof T, string>];
		}
	}

	return sanitized;
}
