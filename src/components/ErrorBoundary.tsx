import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import type React from 'react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error,
		};
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Uncaught error:', error, errorInfo);

		// Log to error tracking service
		this.logError(error, errorInfo);

		this.setState({
			error,
			errorInfo,
		});

		this.props.onError?.(error, errorInfo);
	}

	private logError(error: Error, errorInfo: ErrorInfo) {
		// In production, send to error tracking service
		if (import.meta.env.PROD) {
			// Example: Sentry.captureException(error, {
			//   contexts: {
			//     react: {
			//       componentStack: errorInfo.componentStack,
			//     },
			//   },
			// });
		}
	}

	private handleReload = () => {
		window.location.reload();
	};

	private handleGoHome = () => {
		window.location.href = '/';
	};

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen flex items-center justify-center p-4 bg-background">
					<Card className="w-full max-w-2xl">
						<CardHeader className="text-center">
							<div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
								<AlertTriangle className="w-8 h-8 text-destructive" />
							</div>
							<CardTitle className="text-2xl font-bold text-destructive">
								Oops! Something went wrong
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="text-center text-muted-foreground">
								<p>We apologize for the inconvenience. An unexpected error has occurred.</p>
								{import.meta.env.DEV && this.state.error && (
									<details className="mt-4 text-left bg-muted p-4 rounded-lg">
										<summary className="cursor-pointer font-semibold mb-2">
											Error Details (Development Only)
										</summary>
										<pre className="text-sm overflow-auto">
											{this.state.error.toString()}
											{this.state.errorInfo?.componentStack}
										</pre>
									</details>
								)}
							</div>

							<div className="flex gap-3 justify-center">
								<Button onClick={this.handleReload} className="flex items-center gap-2">
									<RefreshCw className="w-4 h-4" />
									Reload Page
								</Button>
								<Button
									variant="outline"
									onClick={this.handleGoHome}
									className="flex items-center gap-2"
								>
									<Home className="w-4 h-4" />
									Go Home
								</Button>
							</div>

							<div className="text-xs text-center text-muted-foreground">
								If this problem persists, please contact support with the error details above.
							</div>
						</CardContent>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
	Component: React.ComponentType<P>,
	errorBoundaryProps?: Omit<Props, 'children'>
) {
	const WrappedComponent = (props: P) => (
		<ErrorBoundary {...errorBoundaryProps}>
			<Component {...props} />
		</ErrorBoundary>
	);

	WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

	return WrappedComponent;
}

// Hook for programmatic error handling
export function useErrorHandler() {
	return (error: Error, errorInfo?: ErrorInfo) => {
		console.error('Manual error capture:', error, errorInfo);
		// In production, send to error tracking service
	};
}
