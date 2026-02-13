// Response Utilities - Standardized API response formatting

export interface APIResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	error?: {
		code: string;
		message: string;
		details?: any;
	};
	meta?: {
		pagination?: {
			total: number;
			limit: number;
			offset: number;
			page?: number;
			totalPages?: number;
		};
		timestamp: string;
		version: string;
	};
}

export interface PaginatedData<T> {
	data: T[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		page?: number;
		totalPages?: number;
	};
}

// Success response helper
export const createSuccessResponse = <T>(
	data?: T,
	message?: string,
	meta?: any
): APIResponse<T> => {
	return {
		success: true,
		data,
		message,
		meta: {
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
			...meta,
		},
	};
};

// Error response helper
export const createErrorResponse = (
	code: string,
	message: string,
	details?: any,
	statusCode?: number
): APIResponse => {
	return {
		success: false,
		error: {
			code,
			message,
			details,
		},
		meta: {
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
		},
	};
};

// Paginated response helper
export const createPaginatedResponse = <T>(
	data: T[],
	total: number,
	limit: number,
	offset: number,
	message?: string
): APIResponse<PaginatedData<T>> => {
	const page = Math.floor(offset / limit) + 1;
	const totalPages = Math.ceil(total / limit);

	return {
		success: true,
		data: {
			data,
			pagination: {
				total,
				limit,
				offset,
				page,
				totalPages,
			},
		},
		message,
		meta: {
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
		},
	};
};

// Validation error response
export const createValidationErrorResponse = (errors: Record<string, string[]>): APIResponse => {
	return {
		success: false,
		error: {
			code: 'VALIDATION_ERROR',
			message: 'Validation failed',
			details: errors,
		},
		meta: {
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
		},
	};
};

// Not found response
export const createNotFoundResponse = (resource: string): APIResponse => {
	return {
		success: false,
		error: {
			code: 'NOT_FOUND',
			message: `${resource} not found`,
		},
		meta: {
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
		},
	};
};

// Unauthorized response
export const createUnauthorizedResponse = (message = 'Authentication required'): APIResponse => {
	return {
		success: false,
		error: {
			code: 'UNAUTHORIZED',
			message,
		},
		meta: {
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
		},
	};
};

// Forbidden response
export const createForbiddenResponse = (message = 'Insufficient permissions'): APIResponse => {
	return {
		success: false,
		error: {
			code: 'FORBIDDEN',
			message,
		},
		meta: {
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
		},
	};
};

// Rate limit response
export const createRateLimitResponse = (retryAfter?: number): APIResponse => {
	return {
		success: false,
		error: {
			code: 'RATE_LIMIT_EXCEEDED',
			message: 'Too many requests',
			details: { retryAfter },
		},
		meta: {
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
		},
	};
};

// Server error response
export const createServerErrorResponse = (message = 'Internal server error'): APIResponse => {
	return {
		success: false,
		error: {
			code: 'INTERNAL_SERVER_ERROR',
			message,
		},
		meta: {
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
		},
	};
};
