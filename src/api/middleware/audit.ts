// Audit Middleware - Comprehensive logging and audit trail

import { createHash } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

interface AuditEntry {
	id: string;
	timestamp: string;
	userId?: string;
	userRole?: string;
	action: string;
	resource: string;
	resourceId?: string;
	method: string;
	url: string;
	ip: string;
	userAgent?: string;
	requestBody?: any;
	responseStatus?: number;
	responseTime?: number;
	error?: string;
	metadata?: any;
}

// In-memory audit log (in production, use database or logging service)
const auditLog: AuditEntry[] = [];
const MAX_AUDIT_ENTRIES = 10000; // Prevent memory issues

// Audit middleware factory
export const audit = (action: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const startTime = Date.now();
		const auditId = generateAuditId();

		// Get user info from request (set by auth middleware)
		const userId = (req as any).user?.id;
		const userRole = (req as any).user?.role;

		// Get request details
		const ip = getClientIP(req);
		const userAgent = req.headers['user-agent'];
		const url = req.originalUrl || req.url;
		const method = req.method;

		// Extract resource information
		const resource = extractResource(req);
		const resourceId = extractResourceId(req);

		// Create audit entry
		const auditEntry: AuditEntry = {
			id: auditId,
			timestamp: new Date().toISOString(),
			userId,
			userRole,
			action,
			resource,
			resourceId,
			method,
			url,
			ip,
			userAgent,
			requestBody: shouldLogBody(req) ? sanitizeRequestBody(req.body) : undefined,
			metadata: {
				query: req.query,
				headers: sanitizeHeaders(req.headers),
			},
		};

		// Override res.end to capture response details
		const originalEnd = res.end;
		res.end = function (chunk?: any, encoding?: any) {
			auditEntry.responseStatus = res.statusCode;
			auditEntry.responseTime = Date.now() - startTime;

			if (res.statusCode >= 400) {
				auditEntry.error = res.statusMessage || 'Request failed';
			}

			// Add audit entry to log
			addAuditEntry(auditEntry);

			return originalEnd.call(this, chunk, encoding);
		};

		// Override res.json to capture JSON responses
		const originalJson = res.json;
		res.json = function (data: any) {
			auditEntry.responseStatus = res.statusCode;
			auditEntry.responseTime = Date.now() - startTime;

			if (res.statusCode >= 400) {
				auditEntry.error = res.statusMessage || 'Request failed';
			}

			// Add audit entry to log
			addAuditEntry(auditEntry);

			return originalJson.call(this, data);
		};

		next();
	};
};

// Generate unique audit ID
const generateAuditId = (): string => {
	return createHash('sha256')
		.update(Date.now().toString())
		.update(Math.random().toString())
		.digest('hex')
		.substring(0, 16);
};

// Get client IP address
const getClientIP = (req: Request): string => {
	const forwarded = req.headers['x-forwarded-for'];
	const realIP = req.headers['x-real-ip'];
	const remoteAddr = req.connection.remoteAddress;

	return forwarded ? forwarded.split(',')[0].trim() : realIP || remoteAddr || 'unknown';
};

// Extract resource type from request
const extractResource = (req: Request): string => {
	const path = req.path;

	// Extract resource from path
	const pathParts = path.split('/').filter(Boolean);
	if (pathParts.length >= 2 && pathParts[0] === 'api') {
		return pathParts[1];
	}

	return 'unknown';
};

// Extract resource ID from request
const extractResourceId = (req: Request): string | undefined => {
	const { id, slug } = req.params;
	return id || slug || undefined;
};

// Check if we should log request body
const shouldLogBody = (req: Request): boolean => {
	// Don't log sensitive endpoints
	const sensitiveEndpoints = ['/api/auth/login', '/api/auth/register'];

	if (sensitiveEndpoints.some((endpoint) => req.path.includes(endpoint))) {
		return false;
	}

	// Don't log file uploads
	if (req.headers['content-type']?.includes('multipart/form-data')) {
		return false;
	}

	// Don't log large bodies
	const contentLength = Number.parseInt(req.headers['content-length'] || '0');
	if (contentLength > 1024 * 1024) {
		// 1MB
		return false;
	}

	return true;
};

// Sanitize request body for logging
const sanitizeRequestBody = (body: any): any => {
	if (!body || typeof body !== 'object') {
		return body;
	}

	const sanitized = { ...body };

	// Remove sensitive fields
	const sensitiveFields = ['password', 'token', 'secret', 'key', 'credit_card'];
	sensitiveFields.forEach((field) => {
		delete sanitized[field];
	});

	// Truncate large strings
	Object.keys(sanitized).forEach((key) => {
		if (typeof sanitized[key] === 'string' && sanitized[key].length > 500) {
			sanitized[key] = sanitized[key].substring(0, 500) + '...';
		}
	});

	return sanitized;
};

// Sanitize headers for logging
const sanitizeHeaders = (headers: any): any => {
	const sanitized = { ...headers };

	// Remove sensitive headers
	const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
	sensitiveHeaders.forEach((header) => {
		delete sanitized[header];
	});

	return sanitized;
};

// Add audit entry to log
const addAuditEntry = (entry: AuditEntry) => {
	auditLog.push(entry);

	// Prevent memory issues by removing old entries
	if (auditLog.length > MAX_AUDIT_ENTRIES) {
		auditLog.splice(0, auditLog.length - MAX_AUDIT_ENTRIES);
	}

	// In production, you'd send this to a logging service
	if (process.env.NODE_ENV === 'production') {
		// Send to external logging service
		console.log('AUDIT:', JSON.stringify(entry));
	}
};

// Query audit log
export const queryAuditLog = (
	filters: {
		userId?: string;
		action?: string;
		resource?: string;
		resourceId?: string;
		startDate?: string;
		endDate?: string;
		ip?: string;
		limit?: number;
		offset?: number;
	} = {}
) => {
	let filtered = [...auditLog];

	// Apply filters
	if (filters.userId) {
		filtered = filtered.filter((entry) => entry.userId === filters.userId);
	}

	if (filters.action) {
		filtered = filtered.filter((entry) => entry.action === filters.action);
	}

	if (filters.resource) {
		filtered = filtered.filter((entry) => entry.resource === filters.resource);
	}

	if (filters.resourceId) {
		filtered = filtered.filter((entry) => entry.resourceId === filters.resourceId);
	}

	if (filters.startDate) {
		const startDate = new Date(filters.startDate);
		filtered = filtered.filter((entry) => new Date(entry.timestamp) >= startDate);
	}

	if (filters.endDate) {
		const endDate = new Date(filters.endDate);
		filtered = filtered.filter((entry) => new Date(entry.timestamp) <= endDate);
	}

	if (filters.ip) {
		filtered = filtered.filter((entry) => entry.ip === filters.ip);
	}

	// Sort by timestamp (newest first)
	filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

	// Apply pagination
	const offset = filters.offset || 0;
	const limit = filters.limit || 100;
	const paginated = filtered.slice(offset, offset + limit);

	return {
		data: paginated,
		total: filtered.length,
		offset,
		limit,
	};
};

// Get audit statistics
export const getAuditStats = () => {
	const now = new Date();
	const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

	const last24hEntries = auditLog.filter((entry) => new Date(entry.timestamp) >= last24h);
	const last7dEntries = auditLog.filter((entry) => new Date(entry.timestamp) >= last7d);

	// Count by action
	const actionCounts = last24hEntries.reduce(
		(acc, entry) => {
			acc[entry.action] = (acc[entry.action] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	// Count by resource
	const resourceCounts = last24hEntries.reduce(
		(acc, entry) => {
			acc[entry.resource] = (acc[entry.resource] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	// Count by status
	const statusCounts = last24hEntries.reduce(
		(acc, entry) => {
			const status = entry.responseStatus
				? entry.responseStatus < 400
					? 'success'
					: 'error'
				: 'unknown';
			acc[status] = (acc[status] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	// Average response time
	const responseTimes = last24hEntries
		.filter((entry) => entry.responseTime !== undefined)
		.map((entry) => entry.responseTime!);
	const avgResponseTime =
		responseTimes.length > 0
			? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
			: 0;

	// Top users by activity
	const userActivity = last24hEntries.reduce(
		(acc, entry) => {
			if (entry.userId) {
				acc[entry.userId] = (acc[entry.userId] || 0) + 1;
			}
			return acc;
		},
		{} as Record<string, number>
	);

	const topUsers = Object.entries(userActivity)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 10)
		.map(([userId, count]) => ({ userId, count }));

	return {
		totalEntries: auditLog.length,
		last24h: last24hEntries.length,
		last7d: last7dEntries.length,
		actionCounts,
		resourceCounts,
		statusCounts,
		avgResponseTime: Math.round(avgResponseTime),
		topUsers,
		timestamp: now.toISOString(),
	};
};

// Export audit log (for backup or analysis)
export const exportAuditLog = (format: 'json' | 'csv' = 'json') => {
	if (format === 'json') {
		return JSON.stringify(auditLog, null, 2);
	}

	if (format === 'csv') {
		const headers = [
			'id',
			'timestamp',
			'userId',
			'userRole',
			'action',
			'resource',
			'resourceId',
			'method',
			'url',
			'ip',
			'responseStatus',
			'responseTime',
			'error',
		];

		const csvRows = auditLog.map((entry) => [
			entry.id,
			entry.timestamp,
			entry.userId || '',
			entry.userRole || '',
			entry.action,
			entry.resource,
			entry.resourceId || '',
			entry.method,
			entry.url,
			entry.ip,
			entry.responseStatus || '',
			entry.responseTime || '',
			entry.error || '',
		]);

		return [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\n');
	}

	return auditLog;
};

// Clean up old audit entries
export const cleanupAuditLog = (daysToKeep = 30) => {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

	const initialLength = auditLog.length;

	for (let i = auditLog.length - 1; i >= 0; i--) {
		if (new Date(auditLog[i].timestamp) < cutoffDate) {
			auditLog.splice(i, 1);
		}
	}

	return initialLength - auditLog.length;
};

// Security monitoring
export const detectSuspiciousActivity = () => {
	const now = new Date();
	const last1h = new Date(now.getTime() - 60 * 60 * 1000);

	const recentEntries = auditLog.filter((entry) => new Date(entry.timestamp) >= last1h);

	const suspicious = {
		// Multiple failed login attempts from same IP
		failedLogins: {} as Record<string, number>,

		// Unusual request patterns
		unusualPatterns: [] as string[],

		// High frequency requests from same IP
		highFrequencyIPs: {} as Record<string, number>,

		// Suspicious user agents
		suspiciousUserAgents: [] as string[],
	};

	// Check for failed logins
	recentEntries.forEach((entry) => {
		if (entry.action === 'auth.login' && entry.responseStatus && entry.responseStatus >= 400) {
			suspicious.failedLogins[entry.ip] = (suspicious.failedLogins[entry.ip] || 0) + 1;
		}

		// Check for high frequency requests
		suspicious.highFrequencyIPs[entry.ip] = (suspicious.highFrequencyIPs[entry.ip] || 0) + 1;

		// Check for suspicious user agents
		if (
			entry.userAgent &&
			(entry.userAgent.includes('bot') ||
				entry.userAgent.includes('crawler') ||
				entry.userAgent.includes('scraper'))
		) {
			suspicious.suspiciousUserAgents.push(entry.userAgent);
		}
	});

	// Flag IPs with multiple failed logins
	const suspiciousIPs = Object.entries(suspicious.failedLogins)
		.filter(([, count]) => count >= 5)
		.map(([ip, count]) => ({ ip, failedLogins: count }));

	// Flag IPs with high frequency requests
	const highFreqIPs = Object.entries(suspicious.highFrequencyIPs)
		.filter(([, count]) => count >= 1000)
		.map(([ip, count]) => ({ ip, requests: count }));

	return {
		suspiciousIPs,
		highFreqIPs,
		suspiciousUserAgents: [...new Set(suspicious.suspiciousUserAgents)],
		timestamp: now.toISOString(),
	};
};
