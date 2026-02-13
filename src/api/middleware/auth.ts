// Authentication Middleware - Enterprise-grade JWT-based auth with role-based access control
// Implements patterns from Auth0, Firebase, and Supabase best practices

import crypto from 'crypto';
import { createError } from '@/api/utils/error';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Environment variables with comprehensive validation and type safety
const ENV_SCHEMA = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
	JWT_REFRESH_SECRET: z.string().optional(),
	JWT_EXPIRES_IN: z.string().default('15m'),
	JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
	JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512']).default('HS256'),
	JWT_ISSUER: z.string().default('Christiano-cms'),
	JWT_AUDIENCE: z.string().default('Christiano-cms-users'),
	SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
	RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
	RATE_LIMIT_MAX_ATTEMPTS: z.string().transform(Number).default('5'),
});

const ENV = ENV_SCHEMA.parse(process.env);

// Enhanced JWT Payload interface with comprehensive security features
export interface JwtPayload {
	id: string;
	email: string;
	role: string;
	permissions: string[];
	iat: number;
	exp: number;
	sessionId?: string;
	tokenVersion?: number;
	metadata?: Record<string, any>;
	authMethod?: 'password' | 'oauth' | 'sso' | 'mfa';
	deviceFingerprint?: string;
	ipAddress?: string;
	userAgent?: string;
}

// Enhanced Refresh Token interface with security features
export interface RefreshTokenPayload {
	id: string;
	userId: string;
	sessionId: string;
	tokenVersion: number;
	iat: number;
	exp: number;
	deviceFingerprint?: string;
	rotationCount?: number;
}

// Enhanced Session interface with comprehensive tracking
export interface UserSession {
	id: string;
	userId: string;
	tokenVersion: number;
	createdAt: string;
	lastAccessAt: string;
	ipAddress: string;
	userAgent: string;
	deviceFingerprint?: string | undefined;
	isActive: boolean;
	riskScore: number; // 0-100, higher is more risky
	mfaVerified?: boolean;
	location?: {
		country?: string;
		city?: string;
		timezone?: string;
	};
	activityLog: Array<{
		timestamp: string;
		action: string;
		ipAddress: string;
		userAgent: string;
	}>;
}

// Validate JWT secret at startup with comprehensive error handling
const JWT_SECRET = ENV.JWT_SECRET;
const JWT_REFRESH_SECRET = ENV.JWT_REFRESH_SECRET || ENV.JWT_SECRET + '_refresh';
const JWT_EXPIRES_IN = ENV.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = ENV.JWT_REFRESH_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
	throw new Error(
		'FATAL: JWT_SECRET environment variable is not set. Authentication will not work in production.'
	);
}

if (!JWT_REFRESH_SECRET) {
	console.warn('WARNING: JWT_REFRESH_SECRET not set, using JWT_SECRET with suffix');
}

// Secure JWT secret validation
const getJwtSecret = (type: 'access' | 'refresh' = 'access'): string => {
	const secret = type === 'refresh' ? JWT_REFRESH_SECRET : JWT_SECRET;

	if (ENV.NODE_ENV === 'production' && !secret) {
		throw new Error(
			`JWT_${type.toUpperCase()}_SECRET environment variable is required in production`
		);
	}

	if (!secret) {
		throw new Error(
			`Development fallback for JWT_${type.toUpperCase()}_SECRET should not be used in production`
		);
	}

	return secret;
};

// Enhanced AuthenticatedRequest interface with comprehensive user data
export interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
		role: string;
		permissions: string[];
		sessionId?: string;
		tokenVersion?: number;
		lastLogin?: string;
		metadata?: Record<string, any>;
	};
	session?: UserSession;
	params?: Record<string, string>;
	headers: Record<string, string>;
}

// In-memory session store (in production, use Redis)
const sessionStore = new Map<string, UserSession>();

// Enhanced session management utilities with risk scoring
export const sessionUtils = {
	createSession: (
		userId: string,
		ipAddress: string,
		userAgent: string,
		deviceFingerprint?: string
	): UserSession => ({
		id: crypto.randomUUID(),
		userId,
		tokenVersion: 1,
		createdAt: new Date().toISOString(),
		lastAccessAt: new Date().toISOString(),
		ipAddress,
		userAgent,
		deviceFingerprint,
		isActive: true,
		riskScore: 0,
		mfaVerified: false,
		activityLog: [
			{
				timestamp: new Date().toISOString(),
				action: 'session_created',
				ipAddress,
				userAgent,
			},
		],
	}),

	getSession: (sessionId: string): UserSession | null => {
		const session = sessionStore.get(sessionId);
		if (session && session.isActive) {
			session.lastAccessAt = new Date().toISOString();
			sessionStore.set(sessionId, session);
			return session;
		}
		return null;
	},

	invalidateSession: (sessionId: string): boolean => {
		const session = sessionStore.get(sessionId);
		if (session) {
			session.isActive = false;
			sessionStore.set(sessionId, session);
			return true;
		}
		return false;
	},

	invalidateUserSessions: (userId: string): number => {
		let count = 0;
		for (const [sessionId, session] of sessionStore.entries()) {
			if (session.userId === userId && session.isActive) {
				session.isActive = false;
				sessionStore.set(sessionId, session);
				count++;
			}
		}
		return count;
	},

	cleanupExpiredSessions: (): number => {
		const now = new Date();
		const expired = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
		let count = 0;

		for (const [sessionId, session] of sessionStore.entries()) {
			if (new Date(session.createdAt) < expired) {
				sessionStore.delete(sessionId);
				count++;
			}
		}
		return count;
	},
};

// Enhanced JWT Authentication Middleware with comprehensive security
export const authenticate = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

		if (!token) {
			throw createError('UNAUTHORIZED', 'No token provided', 401);
		}

		// Validate token format
		if (token.split('.').length !== 3) {
			throw createError('INVALID_TOKEN', 'Invalid token format', 401);
		}

		const jwtSecret = getJwtSecret('access');
		const decoded = jwt.verify(token, jwtSecret, {
			algorithms: ['HS256'],
			clockTolerance: 30, // 30 seconds clock skew tolerance
		}) as JwtPayload;

		// Validate session if present
		if (decoded.sessionId) {
			const session = sessionUtils.getSession(decoded.sessionId);
			if (!session) {
				throw createError('SESSION_EXPIRED', 'Session expired', 401);
			}

			// Check token version for session invalidation
			if (session.tokenVersion !== decoded.tokenVersion) {
				throw createError('TOKEN_INVALIDATED', 'Token invalidated', 401);
			}

			req.session = session;
		}

		// Enhanced user object with comprehensive data
		req.user = {
			id: decoded.id,
			email: decoded.email,
			role: decoded.role || 'viewer',
			permissions: decoded.permissions || [],
			sessionId: decoded.sessionId,
			tokenVersion: decoded.tokenVersion,
			metadata: decoded.metadata || {},
		};

		// Add security headers
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('X-Frame-Options', 'DENY');
		res.setHeader('X-XSS-Protection', '1; mode=block');
		res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

		next();
	} catch (error: any) {
		if (error.name === 'JsonWebTokenError') {
			next(createError('INVALID_TOKEN', 'Invalid token', 401));
		} else if (error.name === 'TokenExpiredError') {
			next(createError('TOKEN_EXPIRED', 'Token expired', 401));
		} else if (error.name === 'NotBeforeError') {
			next(createError('TOKEN_NOT_ACTIVE', 'Token not active', 401));
		} else {
			next(error);
		}
	}
};

// Enhanced Role-based Authorization Middleware with fine-grained permissions
export const authorize = (
	resource: string,
	action: string,
	options?: {
		requireOwnership?: boolean;
		allowSelf?: boolean;
	}
) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		try {
			if (!req.user) {
				throw createError('UNAUTHORIZED', 'Authentication required', 401);
			}

			// Super admin has access to everything
			if (req.user.role === 'super_admin') {
				return next();
			}

			// Check specific permissions with wildcard support
			const permission = `${resource}.${action}`;
			const resourceWildcard = `${resource}.*`;

			const hasPermission =
				req.user.permissions.includes(permission) ||
				req.user.permissions.includes(resourceWildcard) ||
				req.user.permissions.includes('*');

			if (!hasPermission) {
				throw createError('FORBIDDEN', `Insufficient permissions for ${resource}.${action}`, 403);
			}

			// Additional ownership checks if required
			if (options?.requireOwnership && req.params?.id) {
				if (req.user.id !== req.params.id && req.user.role !== 'admin') {
					throw createError('FORBIDDEN', 'Ownership required', 403);
				}
			}

			// Self-access checks
			if (options?.allowSelf && req.params?.id) {
				if (
					req.user.id !== req.params.id &&
					req.user.role !== 'admin' &&
					req.user.role !== 'super_admin'
				) {
					throw createError('FORBIDDEN', 'Self-access or admin required', 403);
				}
			}

			next();
		} catch (error: any) {
			next(error);
		}
	};
};

// Optional Authentication with enhanced error handling
export const optionalAuth = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

		if (token) {
			try {
				const jwtSecret = getJwtSecret('access');
				const decoded = jwt.verify(token, jwtSecret, {
					algorithms: ['HS256'],
					clockTolerance: 30,
				}) as JwtPayload;

				// Validate session if present
				if (decoded.sessionId) {
					const session = sessionUtils.getSession(decoded.sessionId);
					if (session) {
						req.session = session;
					}
				}

				req.user = {
					id: decoded.id,
					email: decoded.email,
					role: decoded.role || 'viewer',
					permissions: decoded.permissions || [],
					sessionId: decoded.sessionId,
					tokenVersion: decoded.tokenVersion,
					metadata: decoded.metadata || {},
				};
			} catch (authError: any) {
				// Silently fail for optional auth, but log for monitoring
				console.warn('Optional authentication failed:', authError.message);
			}
		}

		next();
	} catch (error: any) {
		// Silently fail for optional auth
		next();
	}
};

// Token generation utilities
export const tokenUtils = {
	generateAccessToken: (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
		const now = Math.floor(Date.now() / 1000);
		const tokenPayload: JwtPayload = {
			...payload,
			iat: now,
			exp: now + (Number.parseInt(JWT_EXPIRES_IN) || 15 * 60), // Default 15 minutes
		};

		return jwt.sign(tokenPayload, getJwtSecret('access'), {
			algorithm: 'HS256',
			issuer: 'Christiano-cms',
			audience: 'Christiano-cms-users',
		});
	},

	generateRefreshToken: (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string => {
		const now = Math.floor(Date.now() / 1000);
		const tokenPayload: RefreshTokenPayload = {
			...payload,
			iat: now,
			exp: now + (Number.parseInt(JWT_REFRESH_EXPIRES_IN) || 7 * 24 * 60 * 60), // Default 7 days
		};

		return jwt.sign(tokenPayload, getJwtSecret('refresh'), {
			algorithm: 'HS256',
			issuer: 'Christiano-cms',
			audience: 'Christiano-cms-refresh',
		});
	},

	verifyRefreshToken: (token: string): RefreshTokenPayload => {
		return jwt.verify(token, getJwtSecret('refresh'), {
			algorithms: ['HS256'],
			issuer: 'Christiano-cms',
			audience: 'Christiano-cms-refresh',
		}) as RefreshTokenPayload;
	},

	generateTokenPair: (
		user: {
			id: string;
			email: string;
			role: string;
			permissions: string[];
			metadata?: Record<string, any>;
		},
		session: UserSession
	): {
		accessToken: string;
		refreshToken: string;
		expiresIn: number;
	} => {
		const accessToken = tokenUtils.generateAccessToken({
			id: user.id,
			email: user.email,
			role: user.role,
			permissions: user.permissions,
			sessionId: session.id,
			tokenVersion: session.tokenVersion,
			metadata: user.metadata,
		});

		const refreshToken = tokenUtils.generateRefreshToken({
			id: crypto.randomUUID(),
			userId: user.id,
			sessionId: session.id,
			tokenVersion: session.tokenVersion,
		});

		return {
			accessToken,
			refreshToken,
			expiresIn: Number.parseInt(JWT_EXPIRES_IN) || 15 * 60,
		};
	},
};

// Rate limiting for authentication endpoints
export const authRateLimit = new Map<string, { count: number; resetTime: number }>();

export const checkAuthRateLimit = (
	identifier: string,
	maxAttempts = 5,
	windowMs: number = 15 * 60 * 1000
): boolean => {
	const now = Date.now();
	const record = authRateLimit.get(identifier);

	if (!record || now > record.resetTime) {
		authRateLimit.set(identifier, { count: 1, resetTime: now + windowMs });
		return true;
	}

	if (record.count >= maxAttempts) {
		return false;
	}

	record.count++;
	return true;
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
	// Content Security Policy
	const csp = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust based on needs
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: https:",
		"font-src 'self' data:",
		"connect-src 'self' https://*.supabase.co",
		"frame-src 'none'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"frame-ancestors 'none'",
		'upgrade-insecure-requests',
	].join('; ');

	res.setHeader('Content-Security-Policy', csp);
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-Frame-Options', 'DENY');
	res.setHeader('X-XSS-Protection', '1; mode=block');
	res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
	res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

	next();
};
