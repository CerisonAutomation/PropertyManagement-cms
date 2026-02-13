import { z } from 'zod';

// Performance metric types
export const MetricTypeSchema = z.enum([
	'page_load',
	'api_response',
	'user_interaction',
	'resource_load',
	'error_rate',
	'memory_usage',
	'cpu_usage',
	'network_latency',
	'database_query',
	'render_time',
	'bundle_size',
	'cache_hit_rate',
]);

export type MetricType = z.infer<typeof MetricTypeSchema>;

// Performance levels
export const PerformanceLevelSchema = z.enum(['excellent', 'good', 'fair', 'poor', 'critical']);

export type PerformanceLevel = z.infer<typeof PerformanceLevelSchema>;

// Performance metric interface
export interface PerformanceMetric {
	id: string;
	timestamp: Date;
	type: MetricType;
	name: string;
	value: number;
	unit: string;
	threshold?: {
		warning: number;
		critical: number;
	};
	level: PerformanceLevel;
	tags?: Record<string, string>;
	metadata?: {
		userId?: string;
		sessionId?: string;
		route?: string;
		userAgent?: string;
		[key: string]: any;
	};
}

// Performance aggregation
export interface PerformanceAggregation {
	type: MetricType;
	name: string;
	period: '1m' | '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d';
	startTime: Date;
	endTime: Date;
	count: number;
	min: number;
	max: number;
	avg: number;
	p50: number;
	p95: number;
	p99: number;
	level: PerformanceLevel;
}

// Performance alert
export interface PerformanceAlert {
	id: string;
	timestamp: Date;
	type: MetricType;
	name: string;
	level: 'warning' | 'critical';
	message: string;
	value: number;
	threshold: number;
	duration: number;
	resolved: boolean;
	resolvedAt?: Date;
	resolvedBy?: string;
}

// Performance report
export interface PerformanceReport {
	id: string;
	generatedAt: Date;
	period: {
		start: Date;
		end: Date;
	};
	summary: {
		totalMetrics: number;
		averageLevel: PerformanceLevel;
		criticalAlerts: number;
		warningAlerts: number;
		resolvedAlerts: number;
	};
	metrics: PerformanceMetric[];
	aggregations: PerformanceAggregation[];
	alerts: PerformanceAlert[];
	recommendations: string[];
}

// Performance monitor class
export class PerformanceMonitor {
	private static instance: PerformanceMonitor;
	private metrics: PerformanceMetric[] = [];
	private alerts: PerformanceAlert[] = [];
	private maxMetrics = 10000;
	private observers: PerformanceObserver[] = [];
	private thresholds: Map<string, { warning: number; critical: number }> = new Map();

	private constructor() {
		this.setupDefaultThresholds();
		this.initializeObservers();
	}

	static getInstance(): PerformanceMonitor {
		if (!PerformanceMonitor.instance) {
			PerformanceMonitor.instance = new PerformanceMonitor();
		}
		return PerformanceMonitor.instance;
	}

	// Record a performance metric
	recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp' | 'level'>): PerformanceMetric {
		const performanceMetric: PerformanceMetric = {
			id: this.generateId(),
			timestamp: new Date(),
			level: this.calculateLevel(metric.type, metric.value, metric.threshold),
			...metric,
		};

		this.metrics.push(performanceMetric);

		if (this.metrics.length > this.maxMetrics) {
			this.metrics = this.metrics.slice(-this.maxMetrics);
		}

		this.checkThresholds(performanceMetric);
		this.persistMetric(performanceMetric);

		return performanceMetric;
	}

	// Convenience methods for common metrics
	recordPageLoad(
		url: string,
		loadTime: number,
		userId?: string,
		sessionId?: string
	): PerformanceMetric {
		return this.recordMetric({
			type: 'page_load',
			name: `page_load_${url}`,
			value: loadTime,
			unit: 'ms',
			threshold: this.thresholds.get('page_load'),
			metadata: { userId, sessionId, route: url },
		});
	}

	recordApiResponse(
		endpoint: string,
		method: string,
		responseTime: number,
		statusCode: number,
		userId?: string
	): PerformanceMetric {
		return this.recordMetric({
			type: 'api_response',
			name: `api_${method}_${endpoint}`,
			value: responseTime,
			unit: 'ms',
			threshold: this.thresholds.get('api_response'),
			tags: { endpoint, method, statusCode: statusCode.toString() },
			metadata: { userId },
		});
	}

	recordUserInteraction(
		interaction: string,
		responseTime: number,
		userId?: string,
		element?: string
	): PerformanceMetric {
		return this.recordMetric({
			type: 'user_interaction',
			name: `interaction_${interaction}`,
			value: responseTime,
			unit: 'ms',
			threshold: this.thresholds.get('user_interaction'),
			tags: { interaction, element: element || '' },
			metadata: { userId },
		});
	}

	recordMemoryUsage(used: number, total: number, percentage: number): PerformanceMetric {
		return this.recordMetric({
			type: 'memory_usage',
			name: 'memory_usage',
			value: percentage,
			unit: '%',
			threshold: this.thresholds.get('memory_usage'),
			tags: { used: used.toString(), total: total.toString() },
		});
	}

	recordErrorRate(
		resource: string,
		errorCount: number,
		totalCount: number,
		percentage: number
	): PerformanceMetric {
		return this.recordMetric({
			type: 'error_rate',
			name: `error_rate_${resource}`,
			value: percentage,
			unit: '%',
			threshold: this.thresholds.get('error_rate'),
			tags: { resource, errors: errorCount.toString(), total: totalCount.toString() },
		});
	}

	recordDatabaseQuery(query: string, executionTime: number, userId?: string): PerformanceMetric {
		return this.recordMetric({
			type: 'database_query',
			name: 'db_query',
			value: executionTime,
			unit: 'ms',
			threshold: this.thresholds.get('database_query'),
			tags: { query: query.substring(0, 100) }, // Truncate long queries
			metadata: { userId },
		});
	}

	// Query methods
	getMetrics(
		type?: MetricType,
		startTime?: Date,
		endTime?: Date,
		limit?: number
	): PerformanceMetric[] {
		let filteredMetrics = [...this.metrics];

		if (type) {
			filteredMetrics = filteredMetrics.filter((metric) => metric.type === type);
		}

		if (startTime) {
			filteredMetrics = filteredMetrics.filter((metric) => metric.timestamp >= startTime);
		}

		if (endTime) {
			filteredMetrics = filteredMetrics.filter((metric) => metric.timestamp <= endTime);
		}

		// Sort by timestamp (newest first)
		filteredMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

		if (limit) {
			filteredMetrics = filteredMetrics.slice(0, limit);
		}

		return filteredMetrics;
	}

	getAggregations(
		type: MetricType,
		period: '1m' | '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d',
		endTime: Date = new Date()
	): PerformanceAggregation[] {
		const startTime = this.calculatePeriodStart(period, endTime);
		const metrics = this.getMetrics(type, startTime, endTime);

		// Group metrics by name and calculate aggregations
		const groupedMetrics = metrics.reduce(
			(groups, metric) => {
				if (!groups[metric.name]) {
					groups[metric.name] = [];
				}
				groups[metric.name].push(metric);
				return groups;
			},
			{} as Record<string, PerformanceMetric[]>
		);

		return Object.entries(groupedMetrics).map(([name, metricGroup]) => {
			const values = metricGroup.map((m) => m.value);
			const sortedValues = values.sort((a, b) => a - b);

			const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
			const p50 = this.calculatePercentile(sortedValues, 50);
			const p95 = this.calculatePercentile(sortedValues, 95);
			const p99 = this.calculatePercentile(sortedValues, 99);

			return {
				type,
				name,
				period,
				startTime,
				endTime,
				count: values.length,
				min: Math.min(...values),
				max: Math.max(...values),
				avg,
				p50,
				p95,
				p99,
				level: this.calculateLevel(type, avg, this.thresholds.get(type)),
			};
		});
	}

	getAlerts(resolved?: boolean): PerformanceAlert[] {
		return this.alerts.filter((alert) => resolved === undefined || alert.resolved === resolved);
	}

	generateReport(period: { start: Date; end: Date }, types?: MetricType[]): PerformanceReport {
		const metrics = types
			? types.flatMap((type) => this.getMetrics(type, period.start, period.end))
			: this.getMetrics(undefined, period.start, period.end);

		const alerts = this.alerts.filter(
			(alert) => alert.timestamp >= period.start && alert.timestamp <= period.end
		);

		const criticalAlerts = alerts.filter((alert) => alert.level === 'critical').length;
		const warningAlerts = alerts.filter((alert) => alert.level === 'warning').length;
		const resolvedAlerts = alerts.filter((alert) => alert.resolved).length;

		const averageLevel = this.calculateOverallLevel(metrics);

		return {
			id: this.generateId(),
			generatedAt: new Date(),
			period,
			summary: {
				totalMetrics: metrics.length,
				averageLevel,
				criticalAlerts,
				warningAlerts,
				resolvedAlerts,
			},
			metrics,
			aggregations: [],
			alerts,
			recommendations: this.generateRecommendations(metrics, alerts),
		};
	}

	// Alert management
	createAlert(
		type: MetricType,
		name: string,
		level: 'warning' | 'critical',
		message: string,
		value: number,
		threshold: number
	): PerformanceAlert {
		const alert: PerformanceAlert = {
			id: this.generateId(),
			timestamp: new Date(),
			type,
			name,
			level,
			message,
			value,
			threshold,
			duration: 0,
			resolved: false,
		};

		this.alerts.push(alert);
		this.persistAlert(alert);
		return alert;
	}

	resolveAlert(alertId: string, resolvedBy?: string): void {
		const alert = this.alerts.find((a) => a.id === alertId);
		if (alert) {
			alert.resolved = true;
			alert.resolvedAt = new Date();
			alert.resolvedBy = resolvedBy;
			this.persistAlert(alert);
		}
	}

	// Private methods
	private setupDefaultThresholds(): void {
		this.thresholds.set('page_load', { warning: 2000, critical: 5000 });
		this.thresholds.set('api_response', { warning: 500, critical: 2000 });
		this.thresholds.set('user_interaction', { warning: 100, critical: 300 });
		this.thresholds.set('resource_load', { warning: 3000, critical: 10000 });
		this.thresholds.set('error_rate', { warning: 1, critical: 5 });
		this.thresholds.set('memory_usage', { warning: 80, critical: 95 });
		this.thresholds.set('cpu_usage', { warning: 75, critical: 90 });
		this.thresholds.set('network_latency', { warning: 200, critical: 1000 });
		this.thresholds.set('database_query', { warning: 100, critical: 500 });
		this.thresholds.set('render_time', { warning: 16, critical: 33 });
		this.thresholds.set('bundle_size', { warning: 250000, critical: 1000000 });
		this.thresholds.set('cache_hit_rate', { warning: 80, critical: 60 });
	}

	private initializeObservers(): void {
		if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
			// Observe navigation timing
			const navigationObserver = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (entry.entryType === 'navigation') {
						const navEntry = entry as PerformanceNavigationTiming;
						this.recordPageLoad(
							window.location.pathname,
							navEntry.loadEventEnd - navEntry.loadEventStart
						);
					}
				}
			});
			navigationObserver.observe({ entryTypes: ['navigation'] });
			this.observers.push(navigationObserver);

			// Observe resource timing
			const resourceObserver = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					if (entry.entryType === 'resource') {
						const resourceEntry = entry as PerformanceResourceTiming;
						this.recordMetric({
							type: 'resource_load',
							name: resourceEntry.name,
							value: resourceEntry.responseEnd - resourceEntry.requestStart,
							unit: 'ms',
							threshold: this.thresholds.get('resource_load'),
						});
					}
				}
			});
			resourceObserver.observe({ entryTypes: ['resource'] });
			this.observers.push(resourceObserver);
		}
	}

	private calculateLevel(
		type: MetricType,
		value: number,
		threshold?: { warning: number; critical: number }
	): PerformanceLevel {
		if (!threshold) {
			threshold = this.thresholds.get(type);
		}

		if (!threshold) {
			return 'good';
		}

		if (value >= threshold.critical) {
			return 'critical';
		} else if (value >= threshold.warning) {
			return 'poor';
		} else if (value >= threshold.warning * 0.7) {
			return 'fair';
		} else {
			return 'excellent';
		}
	}

	private checkThresholds(metric: PerformanceMetric): void {
		if (!metric.threshold) return;

		if (metric.value >= metric.threshold.critical) {
			this.createAlert(
				metric.type,
				metric.name,
				'critical',
				`Critical performance threshold exceeded for ${metric.name}`,
				metric.value,
				metric.threshold.critical
			);
		} else if (metric.value >= metric.threshold.warning) {
			this.createAlert(
				metric.type,
				metric.name,
				'warning',
				`Performance warning for ${metric.name}`,
				metric.value,
				metric.threshold.warning
			);
		}
	}

	private calculatePeriodStart(period: string, endTime: Date): Date {
		const duration = {
			'1m': 1 * 60 * 1000,
			'5m': 5 * 60 * 1000,
			'15m': 15 * 60 * 1000,
			'1h': 60 * 60 * 1000,
			'6h': 6 * 60 * 60 * 1000,
			'24h': 24 * 60 * 60 * 1000,
			'7d': 7 * 24 * 60 * 60 * 1000,
			'30d': 30 * 24 * 60 * 60 * 1000,
		};

		return new Date(endTime.getTime() - duration[period as keyof typeof duration]);
	}

	private calculatePercentile(sortedValues: number[], percentile: number): number {
		if (sortedValues.length === 0) return 0;

		const index = (percentile / 100) * (sortedValues.length - 1);
		const lower = Math.floor(index);
		const upper = Math.ceil(index);

		if (lower === upper) {
			return sortedValues[lower];
		}

		const weight = index - lower;
		return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
	}

	private calculateOverallLevel(metrics: PerformanceMetric[]): PerformanceLevel {
		if (metrics.length === 0) return 'good';

		const levelCounts = metrics.reduce(
			(counts, metric) => {
				counts[metric.level] = (counts[metric.level] || 0) + 1;
				return counts;
			},
			{} as Record<PerformanceLevel, number>
		);

		const total = metrics.length;
		const criticalRatio = (levelCounts.critical || 0) / total;
		const poorRatio = (levelCounts.poor || 0) / total;

		if (criticalRatio > 0.1) return 'critical';
		if (criticalRatio > 0.05 || poorRatio > 0.2) return 'poor';
		if (poorRatio > 0.1) return 'fair';
		if (poorRatio > 0.05) return 'good';
		return 'excellent';
	}

	private generateRecommendations(
		metrics: PerformanceMetric[],
		alerts: PerformanceAlert[]
	): string[] {
		const recommendations: string[] = [];

		// Analyze page load times
		const pageLoadMetrics = metrics.filter((m) => m.type === 'page_load');
		if (pageLoadMetrics.length > 0) {
			const avgPageLoad =
				pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length;
			if (avgPageLoad > 2000) {
				recommendations.push(
					'Consider optimizing images and enabling compression to improve page load times'
				);
			}
		}

		// Analyze API response times
		const apiMetrics = metrics.filter((m) => m.type === 'api_response');
		if (apiMetrics.length > 0) {
			const avgApiResponse = apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length;
			if (avgApiResponse > 500) {
				recommendations.push(
					'API response times are slow. Consider implementing caching or query optimization'
				);
			}
		}

		// Analyze error rates
		const errorMetrics = metrics.filter((m) => m.type === 'error_rate');
		const highErrorResources = errorMetrics.filter((m) => m.value > 1);
		if (highErrorResources.length > 0) {
			recommendations.push(
				'High error rates detected. Review error logs and implement better error handling'
			);
		}

		// Analyze memory usage
		const memoryMetrics = metrics.filter((m) => m.type === 'memory_usage');
		if (memoryMetrics.length > 0) {
			const avgMemory = memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length;
			if (avgMemory > 80) {
				recommendations.push(
					'High memory usage detected. Consider optimizing memory leaks or increasing available memory'
				);
			}
		}

		// Check for unresolved critical alerts
		const unresolvedCritical = alerts.filter((a) => a.level === 'critical' && !a.resolved);
		if (unresolvedCritical.length > 0) {
			recommendations.push(
				`${unresolvedCritical.length} critical performance alerts require immediate attention`
			);
		}

		return recommendations;
	}

	private generateId(): string {
		return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private persistMetric(metric: PerformanceMetric): void {
		// In production, send to monitoring service
		if (process.env['NODE_ENV'] === 'development') {
			console.log('Performance Metric:', metric);
		}
	}

	private persistAlert(alert: PerformanceAlert): void {
		// In production, send to alerting system
		if (process.env['NODE_ENV'] === 'development') {
			console.log('Performance Alert:', alert);
		}
	}

	// Cleanup
	destroy(): void {
		this.observers.forEach((observer) => observer.disconnect());
		this.observers = [];
	}
}

// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export function usePerformanceMonitor() {
	return {
		recordPageLoad: (url: string, loadTime: number, userId?: string, sessionId?: string) =>
			performanceMonitor.recordPageLoad(url, loadTime, userId, sessionId),

		recordApiResponse: (
			endpoint: string,
			method: string,
			responseTime: number,
			statusCode: number,
			userId?: string
		) => performanceMonitor.recordApiResponse(endpoint, method, responseTime, statusCode, userId),

		recordUserInteraction: (
			interaction: string,
			responseTime: number,
			userId?: string,
			element?: string
		) => performanceMonitor.recordUserInteraction(interaction, responseTime, userId, element),

		recordMemoryUsage: (used: number, total: number, percentage: number) =>
			performanceMonitor.recordMemoryUsage(used, total, percentage),

		recordErrorRate: (
			resource: string,
			errorCount: number,
			totalCount: number,
			percentage: number
		) => performanceMonitor.recordErrorRate(resource, errorCount, totalCount, percentage),

		recordDatabaseQuery: (query: string, executionTime: number, userId?: string) =>
			performanceMonitor.recordDatabaseQuery(query, executionTime, userId),

		getMetrics: (type?: MetricType, startTime?: Date, endTime?: Date, limit?: number) =>
			performanceMonitor.getMetrics(type, startTime, endTime, limit),

		getAggregations: (
			type: MetricType,
			period: '1m' | '5m' | '15m' | '1h' | '6h' | '24h' | '7d' | '30d',
			endTime?: Date
		) => performanceMonitor.getAggregations(type, period, endTime),

		getAlerts: (resolved?: boolean) => performanceMonitor.getAlerts(resolved),

		generateReport: (period: { start: Date; end: Date }, types?: MetricType[]) =>
			performanceMonitor.generateReport(period, types),

		createAlert: (
			type: MetricType,
			name: string,
			level: 'warning' | 'critical',
			message: string,
			value: number,
			threshold: number
		) => performanceMonitor.createAlert(type, name, level, message, value, threshold),

		resolveAlert: (alertId: string, resolvedBy?: string) =>
			performanceMonitor.resolveAlert(alertId, resolvedBy),
	};
}
