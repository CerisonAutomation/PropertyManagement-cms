// Error Utilities - Custom error classes and error handling

export class APIError extends Error {
	public code: string;
	public statusCode: number;
	public details?: any;

	constructor(code: string, message: string, statusCode = 500, details?: any) {
		super(message);
		this.name = 'APIError';
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, APIError);
		}
	}
}

// Create error helper function
export const createError = (
	code: string,
	message: string,
	statusCode = 500,
	details?: any
): APIError => {
	return new APIError(code, message, statusCode, details);
};

// Common error types
export const errors = {
	// Authentication & Authorization
	UNAUTHORIZED: (message = 'Authentication required') => createError('UNAUTHORIZED', message, 401),

	FORBIDDEN: (message = 'Insufficient permissions') => createError('FORBIDDEN', message, 403),

	INVALID_TOKEN: (message = 'Invalid or expired token') =>
		createError('INVALID_TOKEN', message, 401),

	TOKEN_EXPIRED: (message = 'Token has expired') => createError('TOKEN_EXPIRED', message, 401),

	// Validation
	VALIDATION_ERROR: (details?: any) =>
		createError('VALIDATION_ERROR', 'Validation failed', 400, details),

	INVALID_INPUT: (field: string, value: any) =>
		createError('INVALID_INPUT', `Invalid ${field}: ${value}`, 400),

	MISSING_REQUIRED_FIELD: (field: string) =>
		createError('MISSING_REQUIRED_FIELD', `Missing required field: ${field}`, 400),

	// Resource Not Found
	NOT_FOUND: (resource = 'Resource') => createError('NOT_FOUND', `${resource} not found`, 404),

	PAGE_NOT_FOUND: () => createError('PAGE_NOT_FOUND', 'Page not found', 404),

	POST_NOT_FOUND: () => createError('POST_NOT_FOUND', 'Blog post not found', 404),

	PROPERTY_NOT_FOUND: () => createError('PROPERTY_NOT_FOUND', 'Property not found', 404),

	// Conflict
	CONFLICT: (message = 'Resource conflict') => createError('CONFLICT', message, 409),

	SLUG_EXISTS: (slug: string) =>
		createError('SLUG_EXISTS', `A resource with slug "${slug}" already exists`, 409),

	EMAIL_EXISTS: (email: string) =>
		createError('EMAIL_EXISTS', `A user with email "${email}" already exists`, 409),

	// Rate Limiting
	RATE_LIMIT_EXCEEDED: (retryAfter?: number) =>
		createError('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded', 429, { retryAfter }),

	// Server Errors
	INTERNAL_SERVER_ERROR: (message = 'Internal server error') =>
		createError('INTERNAL_SERVER_ERROR', message, 500),

	DATABASE_ERROR: (details?: any) =>
		createError('DATABASE_ERROR', 'Database operation failed', 500, details),

	EXTERNAL_SERVICE_ERROR: (service: string, details?: any) =>
		createError('EXTERNAL_SERVICE_ERROR', `${service} service error`, 502, details),

	// File Upload
	FILE_TOO_LARGE: (size: number, maxSize: number) =>
		createError('FILE_TOO_LARGE', `File size ${size} exceeds maximum ${maxSize}`, 413),

	INVALID_FILE_TYPE: (type: string, allowedTypes: string[]) =>
		createError(
			'INVALID_FILE_TYPE',
			`File type ${type} not allowed. Allowed: ${allowedTypes.join(', ')}`,
			422
		),

	UPLOAD_FAILED: (reason: string) =>
		createError('UPLOAD_FAILED', `File upload failed: ${reason}`, 500),

	// Business Logic
	INVALID_STATUS_TRANSITION: (from: string, to: string) =>
		createError('INVALID_STATUS_TRANSITION', `Cannot transition from ${from} to ${to}`, 400),

	RESOURCE_LOCKED: (resource: string) =>
		createError('RESOURCE_LOCKED', `${resource} is currently locked for editing`, 423),

	QUOTA_EXCEEDED: (quota: string) => createError('QUOTA_EXCEEDED', `${quota} quota exceeded`, 429),
};

// Error handler middleware
export const errorHandler = (error: any, req: any, res: any, next: any) => {
	// If it's already an APIError, use it directly
	if (error instanceof APIError) {
		return res.status(error.statusCode).json({
			success: false,
			error: {
				code: error.code,
				message: error.message,
				details: error.details,
			},
			meta: {
				timestamp: new Date().toISOString(),
				version: process.env.npm_package_version || '1.0.0',
				requestId: req.id || 'unknown',
			},
		});
	}

	// Handle validation errors (like from express-validator)
	if (error.name === 'ValidationError' || Array.isArray(error.errors)) {
		const validationErrors = Array.isArray(error.errors) ? error.errors : [error];
		const formattedErrors = validationErrors.reduce((acc: any, err: any) => {
			acc[err.path || err.field || 'unknown'] = err.msg || err.message;
			return acc;
		}, {});

		return res.status(400).json({
			success: false,
			error: {
				code: 'VALIDATION_ERROR',
				message: 'Validation failed',
				details: formattedErrors,
			},
			meta: {
				timestamp: new Date().toISOString(),
				version: process.env.npm_package_version || '1.0.0',
				requestId: req.id || 'unknown',
			},
		});
	}

	// Handle JWT errors
	if (error.name === 'JsonWebTokenError') {
		return res.status(401).json({
			success: false,
			error: {
				code: 'INVALID_TOKEN',
				message: 'Invalid token',
			},
			meta: {
				timestamp: new Date().toISOString(),
				version: process.env.npm_package_version || '1.0.0',
				requestId: req.id || 'unknown',
			},
		});
	}

	if (error.name === 'TokenExpiredError') {
		return res.status(401).json({
			success: false,
			error: {
				code: 'TOKEN_EXPIRED',
				message: 'Token expired',
			},
			meta: {
				timestamp: new Date().toISOString(),
				version: process.env.npm_package_version || '1.0.0',
				requestId: req.id || 'unknown',
			},
		});
	}

	// Handle database errors
	if (error.code === '23505') {
		// PostgreSQL unique violation
		return res.status(409).json({
			success: false,
			error: {
				code: 'DUPLICATE_ENTRY',
				message: 'Resource already exists',
			},
			meta: {
				timestamp: new Date().toISOString(),
				version: process.env.npm_package_version || '1.0.0',
				requestId: req.id || 'unknown',
			},
		});
	}

	if (error.code === '23503') {
		// PostgreSQL foreign key violation
		return res.status(400).json({
			success: false,
			error: {
				code: 'FOREIGN_KEY_VIOLATION',
				message: 'Referenced resource does not exist',
			},
			meta: {
				timestamp: new Date().toISOString(),
				version: process.env.npm_package_version || '1.0.0',
				requestId: req.id || 'unknown',
			},
		});
	}

	// Default error handler
	console.error('Unhandled error:', error);

	return res.status(500).json({
		success: false,
		error: {
			code: 'INTERNAL_SERVER_ERROR',
			message:
				process.env.NODE_ENV === 'production'
					? 'Internal server error'
					: error.message || 'Unknown error occurred',
		},
		meta: {
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
			requestId: req.id || 'unknown',
		},
	});
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
	return (req: any, res: any, next: any) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
