/**
 * Centralized Error Handler for Vercel Deployment
 * Provides retry logic, error recovery, and monitoring integration
 */

export interface ErrorContext {
	endpoint?: string;
	userId?: string;
	timestamp: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	retryable: boolean;
}

/**
 * Custom error class with context
 */
export class AppError extends Error {
	public readonly context: ErrorContext;
	public readonly originalError?: Error;

	constructor(
		message: string,
		severity: ErrorContext['severity'] = 'medium',
		retryable = false,
		originalError?: Error
	) {
		super(message);
		this.name = 'AppError';
		this.originalError = originalError;
		this.context = {
			timestamp: new Date().toISOString(),
			severity,
			retryable,
		};

		// Report to error tracking if enabled
		reportError(this);
	}
}

/**
 * Network error for API failures
 */
export class NetworkError extends AppError {
	constructor(
		message: string,
		public readonly statusCode: number,
		originalError?: Error
	) {
		super(message, 'high', statusCode >= 500, originalError);
		this.name = 'NetworkError';
	}
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends AppError {
	constructor(
		message: string,
		public readonly field?: string
	) {
		super(message, 'low', false);
		this.name = 'ValidationError';
	}
}

/**
 * Report error to monitoring service
 */
export function reportError(error: Error & { context?: ErrorContext }): void {
	// Send to Vercel error tracking
	if (typeof window !== 'undefined') {
		console.error('Error reported:', {
			message: error.message,
			stack: error.stack,
			context: error.context,
		});

		// Could integrate with Sentry here:
		// Sentry.captureException(error);
	}
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
	operation: () => Promise<T>,
	maxRetries = 3,
	initialDelayMs = 100
): Promise<T> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));

			if (attempt < maxRetries - 1) {
				const delayMs = initialDelayMs * Math.pow(2, attempt);
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			}
		}
	}

	if (lastError) {
		throw lastError;
	}
	throw new Error('Operation failed after retries');
}

/**
 * Handle API errors with retry logic
 */
export async function handleApiCall<T>(
	endpoint: string,
	operation: () => Promise<T>,
	options = { maxRetries: 3, timeout: 10000 }
): Promise<T> {
	try {
		return await Promise.race([
			retryWithBackoff(operation, options.maxRetries),
			new Promise<T>((_, reject) =>
				setTimeout(() => reject(new NetworkError('Request timeout', 408)), options.timeout)
			),
		]);
	} catch (error) {
		if (error instanceof NetworkError) {
			throw error;
		}
		const statusCode = (error as any)?.status || 500;
		throw new NetworkError(
			`API call to ${endpoint} failed`,
			statusCode,
			error instanceof Error ? error : undefined
		);
	}
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
	try {
		return JSON.parse(json) as T;
	} catch (error) {
		console.error('JSON parse error:', error);
		return fallback;
	}
}

/**
 * Health check for service availability
 */
export async function checkServiceHealth(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, {
			method: 'HEAD',
			mode: 'no-cors',
		});
		return response.status < 500;
	} catch {
		return false;
	}
}

/**
 * Circuit breaker for preventing cascading failures
 */
export class CircuitBreaker {
	private failures = 0;
	private lastFailureTime = 0;
	private isOpen = false;

	constructor(
		private failureThreshold = 5,
		private resetTimeoutMs = 60000
	) {}

	async execute<T>(operation: () => Promise<T>): Promise<T> {
		// Check if circuit should be reset
		if (this.isOpen && Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
			this.isOpen = false;
			this.failures = 0;
		}

		if (this.isOpen) {
			throw new AppError('Circuit breaker is open', 'high', true);
		}

		try {
			const result = await operation();
			this.failures = 0; // Reset on success
			return result;
		} catch (error) {
			this.failures++;
			this.lastFailureTime = Date.now();

			if (this.failures >= this.failureThreshold) {
				this.isOpen = true;
			}

			throw error;
		}
	}

	getStatus() {
		return {
			isOpen: this.isOpen,
			failures: this.failures,
			lastFailureTime: this.lastFailureTime,
		};
	}
}
