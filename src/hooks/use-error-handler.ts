/**
 * Custom hook for error handling
 */

import { useCallback } from 'react';

interface ErrorHandlerOptions {
	onError?: (error: Error) => void;
	rethrow?: boolean;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
	const { onError, rethrow = false } = options;

	const handleError = useCallback(
		(error: Error | string, context?: string) => {
			const err = typeof error === 'string' ? new Error(error) : error;

			// Add context to error if provided
			if (context) {
				err.message = `${context}: ${err.message}`;
			}

			// Log error
			console.error(err);

			// Call custom error handler
			if (onError) {
				onError(err);
			}

			// Optionally rethrow error
			if (rethrow) {
				throw err;
			}
		},
		[onError, rethrow]
	);

	return { handleError };
}

// Async error handler
export function useAsyncErrorHandler(options: ErrorHandlerOptions = {}) {
	const { handleError } = useErrorHandler(options);

	const handleAsyncError = useCallback(
		async <T>(promise: Promise<T>): Promise<T | null> => {
			try {
				return await promise;
			} catch (error) {
				handleError(error as Error);
				return null;
			}
		},
		[handleError]
	);

	return { handleAsyncError };
}
