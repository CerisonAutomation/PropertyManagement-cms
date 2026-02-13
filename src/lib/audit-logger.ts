import { z } from 'zod';

// Audit log event types
export const AuditEventTypeSchema = z.enum([
	'user_login',
	'user_logout',
	'user_created',
	'user_updated',
	'user_deleted',
	'permission_granted',
	'permission_revoked',
	'content_created',
	'content_updated',
	'content_deleted',
	'content_published',
	'content_archived',
	'file_uploaded',
	'file_deleted',
	'system_backup',
	'system_restore',
	'security_alert',
	'api_access',
	'config_changed',
	'data_export',
	'data_import',
	'error_occurred',
	'performance_warning',
]);

export type AuditEventType = z.infer<typeof AuditEventTypeSchema>;

// Severity levels
export const AuditSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export type AuditSeverity = z.infer<typeof AuditSeveritySchema>;

// Audit log entry interface
export interface AuditLogEntry {
	id: string;
	timestamp: Date;
	eventType: AuditEventType;
	severity: AuditSeverity;
	userId?: string;
	userEmail?: string;
	userName?: string;
	userRole?: string;
	resourceType?: string;
	resourceId?: string;
	action?: string;
	details: Record<string, any>;
	ipAddress?: string;
	userAgent?: string;
	sessionId?: string;
	success: boolean;
	errorMessage?: string;
	duration?: number; // in milliseconds
	metadata?: {
		department?: string;
		location?: string;
		device?: string;
		platform?: string;
		[key: string]: any;
	};
}

// Audit log filters
export interface AuditLogFilters {
	startDate?: Date;
	endDate?: Date;
	userId?: string;
	eventType?: AuditEventType;
	severity?: AuditSeverity;
	resourceType?: string;
	success?: boolean;
	search?: string;
	limit?: number;
	offset?: number;
}

// Audit log statistics
export interface AuditLogStats {
	totalEvents: number;
	eventsByType: Record<AuditEventType, number>;
	eventsBySeverity: Record<AuditSeverity, number>;
	eventsByUser: Record<string, number>;
	topUsers: Array<{ userId: string; userName: string; eventCount: number }>;
	recentAlerts: AuditLogEntry[];
	errorRate: number;
	averageResponseTime: number;
}

// Audit logger class
export class AuditLogger {
	private static instance: AuditLogger;
	private logs: AuditLogEntry[] = [];
	private maxLogs = 10000; // Keep last 10,000 logs in memory

	private constructor() {}

	static getInstance(): AuditLogger {
		if (!AuditLogger.instance) {
			AuditLogger.instance = new AuditLogger();
		}
		return AuditLogger.instance;
	}

	// Log an event
	log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
		const logEntry: AuditLogEntry = {
			id: this.generateId(),
			timestamp: new Date(),
			...entry,
		};

		this.logs.push(logEntry);

		// Keep only the last maxLogs entries
		if (this.logs.length > this.maxLogs) {
			this.logs = this.logs.slice(-this.maxLogs);
		}

		// In production, this would be sent to a logging service
		this.persistLog(logEntry);

		return logEntry;
	}

	// Convenience methods for common events
	logUserLogin(
		userId: string,
		userEmail: string,
		userName: string,
		userRole: string,
		ipAddress: string,
		userAgent: string,
		success: boolean,
		errorMessage?: string
	): AuditLogEntry {
		return this.log({
			eventType: 'user_login',
			severity: success ? 'low' : 'medium',
			userId,
			userEmail,
			userName,
			userRole,
			action: 'login',
			details: { loginAttempt: true },
			ipAddress,
			userAgent,
			success,
			errorMessage,
		});
	}

	logUserLogout(
		userId: string,
		userEmail: string,
		userName: string,
		userRole: string,
		sessionId: string
	): AuditLogEntry {
		return this.log({
			eventType: 'user_logout',
			severity: 'low',
			userId,
			userEmail,
			userName,
			userRole,
			action: 'logout',
			details: { sessionId },
			sessionId,
			success: true,
		});
	}

	logUserAction(
		eventType: 'user_created' | 'user_updated' | 'user_deleted',
		userId: string,
		userEmail: string,
		userName: string,
		userRole: string,
		targetUserId?: string,
		targetUserEmail?: string,
		details?: Record<string, any>
	): AuditLogEntry {
		return this.log({
			eventType,
			severity: 'medium',
			userId,
			userEmail,
			userName,
			userRole,
			resourceType: 'user',
			resourceId: targetUserId,
			action: eventType.replace('user_', ''),
			details: details || { targetUserEmail },
			success: true,
		});
	}

	logContentAction(
		eventType:
			| 'content_created'
			| 'content_updated'
			| 'content_deleted'
			| 'content_published'
			| 'content_archived',
		userId: string,
		userEmail: string,
		userName: string,
		userRole: string,
		resourceType: string,
		resourceId: string,
		details?: Record<string, any>
	): AuditLogEntry {
		return this.log({
			eventType,
			severity: 'low',
			userId,
			userEmail,
			userName,
			userRole,
			resourceType,
			resourceId,
			action: eventType.replace('content_', ''),
			details: details || {},
			success: true,
		});
	}

	logSecurityAlert(
		eventType: 'security_alert' | 'permission_granted' | 'permission_revoked',
		severity: AuditSeverity,
		userId?: string,
		userEmail?: string,
		userName?: string,
		userRole?: string,
		details: Record<string, any>,
		ipAddress?: string
	): AuditLogEntry {
		return this.log({
			eventType,
			severity,
			userId,
			userEmail,
			userName,
			userRole,
			action: 'security',
			details,
			ipAddress,
			success: false,
		});
	}

	logApiAccess(
		userId: string,
		userEmail: string,
		userName: string,
		userRole: string,
		endpoint: string,
		method: string,
		statusCode: number,
		duration: number,
		ipAddress: string,
		userAgent: string,
		details?: Record<string, any>
	): AuditLogEntry {
		const success = statusCode < 400;
		return this.log({
			eventType: 'api_access',
			severity: success ? 'low' : 'medium',
			userId,
			userEmail,
			userName,
			userRole,
			resourceType: 'api',
			resourceId: endpoint,
			action: `${method} ${endpoint}`,
			details: {
				method,
				endpoint,
				statusCode,
				...details,
			},
			ipAddress,
			userAgent,
			success,
			duration,
		});
	}

	logSystemEvent(
		eventType:
			| 'system_backup'
			| 'system_restore'
			| 'config_changed'
			| 'data_export'
			| 'data_import',
		severity: AuditSeverity,
		userId?: string,
		userEmail?: string,
		userName?: string,
		userRole?: string,
		details: Record<string, any>,
		duration?: number
	): AuditLogEntry {
		return this.log({
			eventType,
			severity,
			userId,
			userEmail,
			userName,
			userRole,
			resourceType: 'system',
			action: eventType.replace('system_', '').replace('_', ' '),
			details,
			success: true,
			duration,
		});
	}

	logError(
		errorMessage: string,
		severity: AuditSeverity,
		userId?: string,
		userEmail?: string,
		userName?: string,
		userRole?: string,
		resourceType?: string,
		resourceId?: string,
		details?: Record<string, any>,
		stack?: string
	): AuditLogEntry {
		return this.log({
			eventType: 'error_occurred',
			severity,
			userId,
			userEmail,
			userName,
			userRole,
			resourceType,
			resourceId,
			action: 'error',
			details: {
				errorMessage,
				stack,
				...details,
			},
			success: false,
		});
	}

	logPerformanceWarning(
		resourceType: string,
		resourceId: string,
		metric: string,
		value: number,
		threshold: number,
		userId?: string,
		userEmail?: string,
		userName?: string,
		userRole?: string
	): AuditLogEntry {
		return this.log({
			eventType: 'performance_warning',
			severity: 'medium',
			userId,
			userEmail,
			userName,
			userRole,
			resourceType,
			resourceId,
			action: 'performance_check',
			details: {
				metric,
				value,
				threshold,
				exceeded: value > threshold,
			},
			success: false,
		});
	}

	// Query methods
	getLogs(filters?: AuditLogFilters): AuditLogEntry[] {
		let filteredLogs = [...this.logs];

		if (filters) {
			if (filters.startDate) {
				filteredLogs = filteredLogs.filter((log) => log.timestamp >= filters.startDate!);
			}

			if (filters.endDate) {
				filteredLogs = filteredLogs.filter((log) => log.timestamp <= filters.endDate!);
			}

			if (filters.userId) {
				filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId);
			}

			if (filters.eventType) {
				filteredLogs = filteredLogs.filter((log) => log.eventType === filters.eventType);
			}

			if (filters.severity) {
				filteredLogs = filteredLogs.filter((log) => log.severity === filters.severity);
			}

			if (filters.resourceType) {
				filteredLogs = filteredLogs.filter((log) => log.resourceType === filters.resourceType);
			}

			if (filters.success !== undefined) {
				filteredLogs = filteredLogs.filter((log) => log.success === filters.success);
			}

			if (filters.search) {
				const searchLower = filters.search.toLowerCase();
				filteredLogs = filteredLogs.filter(
					(log) =>
						log.action?.toLowerCase().includes(searchLower) ||
						log.details?.toString().toLowerCase().includes(searchLower) ||
						log.errorMessage?.toLowerCase().includes(searchLower)
				);
			}

			// Sort by timestamp (newest first)
			filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

			// Apply pagination
			if (filters.offset) {
				filteredLogs = filteredLogs.slice(filters.offset);
			}

			if (filters.limit) {
				filteredLogs = filteredLogs.slice(0, filters.limit);
			}
		}

		return filteredLogs;
	}

	getLogStats(filters?: AuditLogFilters): AuditLogStats {
		const logs = this.getLogs(filters);

		const eventsByType = logs.reduce(
			(acc, log) => {
				acc[log.eventType] = (acc[log.eventType] || 0) + 1;
				return acc;
			},
			{} as Record<AuditEventType, number>
		);

		const eventsBySeverity = logs.reduce(
			(acc, log) => {
				acc[log.severity] = (acc[log.severity] || 0) + 1;
				return acc;
			},
			{} as Record<AuditSeverity, number>
		);

		const eventsByUser = logs.reduce(
			(acc, log) => {
				if (log.userId) {
					acc[log.userId] = (acc[log.userId] || 0) + 1;
				}
				return acc;
			},
			{} as Record<string, number>
		);

		const topUsers = Object.entries(eventsByUser)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([userId, eventCount]) => {
				const userLog = logs.find((log) => log.userId === userId);
				return {
					userId,
					userName: userLog?.userName || 'Unknown',
					eventCount,
				};
			});

		const recentAlerts = logs
			.filter((log) => log.severity === 'high' || log.severity === 'critical')
			.slice(0, 10);

		const errorLogs = logs.filter((log) => !log.success);
		const errorRate = logs.length > 0 ? (errorLogs.length / logs.length) * 100 : 0;

		const responseTimes = logs
			.filter((log) => log.duration !== undefined)
			.map((log) => log.duration!);
		const averageResponseTime =
			responseTimes.length > 0
				? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
				: 0;

		return {
			totalEvents: logs.length,
			eventsByType,
			eventsBySeverity,
			eventsByUser,
			topUsers,
			recentAlerts,
			errorRate,
			averageResponseTime,
		};
	}

	// Export logs
	exportLogs(format: 'json' | 'csv' = 'json', filters?: AuditLogFilters): string {
		const logs = this.getLogs(filters);

		if (format === 'csv') {
			const headers = [
				'id',
				'timestamp',
				'eventType',
				'severity',
				'userId',
				'userEmail',
				'userName',
				'userRole',
				'resourceType',
				'resourceId',
				'action',
				'details',
				'ipAddress',
				'userAgent',
				'sessionId',
				'success',
				'errorMessage',
				'duration',
			];

			const csvRows = [
				headers.join(','),
				...logs.map((log) =>
					[
						log.id,
						log.timestamp.toISOString(),
						log.eventType,
						log.severity,
						log.userId || '',
						log.userEmail || '',
						log.userName || '',
						log.userRole || '',
						log.resourceType || '',
						log.resourceId || '',
						log.action || '',
						JSON.stringify(log.details).replace(/"/g, '""'),
						log.ipAddress || '',
						log.userAgent || '',
						log.sessionId || '',
						log.success,
						log.errorMessage || '',
						log.duration || '',
					]
						.map((field) => `"${field}"`)
						.join(',')
				),
			];

			return csvRows.join('\n');
		}

		return JSON.stringify(logs, null, 2);
	}

	// Clear logs (for maintenance)
	clearLogs(): void {
		this.logs = [];
	}

	// Private methods
	private generateId(): string {
		return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private persistLog(log: AuditLogEntry): void {
		// In production, this would send logs to:
		// - Database
		// - Log aggregation service (ELK stack, Splunk, etc.)
		// - SIEM system
		// - Cloud logging (AWS CloudWatch, Google Cloud Logging, etc.)

		// For now, just log to console in development
		if (process.env.NODE_ENV === 'development') {
			console.log('Audit Log:', log);
		}
	}
}

// Singleton instance
export const auditLogger = AuditLogger.getInstance();

// React hook for audit logging
export function useAuditLogger() {
	return {
		logUserLogin: (
			userId: string,
			userEmail: string,
			userName: string,
			userRole: string,
			ipAddress: string,
			userAgent: string,
			success: boolean,
			errorMessage?: string
		) =>
			auditLogger.logUserLogin(
				userId,
				userEmail,
				userName,
				userRole,
				ipAddress,
				userAgent,
				success,
				errorMessage
			),

		logUserLogout: (
			userId: string,
			userEmail: string,
			userName: string,
			userRole: string,
			sessionId: string
		) => auditLogger.logUserLogout(userId, userEmail, userName, userRole, sessionId),

		logUserAction: (
			eventType: 'user_created' | 'user_updated' | 'user_deleted',
			userId: string,
			userEmail: string,
			userName: string,
			userRole: string,
			targetUserId?: string,
			targetUserEmail?: string,
			details?: Record<string, any>
		) =>
			auditLogger.logUserAction(
				eventType,
				userId,
				userEmail,
				userName,
				userRole,
				targetUserId,
				targetUserEmail,
				details
			),

		logContentAction: (
			eventType:
				| 'content_created'
				| 'content_updated'
				| 'content_deleted'
				| 'content_published'
				| 'content_archived',
			userId: string,
			userEmail: string,
			userName: string,
			userRole: string,
			resourceType: string,
			resourceId: string,
			details?: Record<string, any>
		) =>
			auditLogger.logContentAction(
				eventType,
				userId,
				userEmail,
				userName,
				userRole,
				resourceType,
				resourceId,
				details
			),

		logSecurityAlert: (
			eventType: 'security_alert' | 'permission_granted' | 'permission_revoked',
			severity: AuditSeverity,
			userId?: string,
			userEmail?: string,
			userName?: string,
			userRole?: string,
			details: Record<string, any>,
			ipAddress?: string
		) =>
			auditLogger.logSecurityAlert(
				eventType,
				severity,
				userId,
				userEmail,
				userName,
				userRole,
				details,
				ipAddress
			),

		logApiAccess: (
			userId: string,
			userEmail: string,
			userName: string,
			userRole: string,
			endpoint: string,
			method: string,
			statusCode: number,
			duration: number,
			ipAddress: string,
			userAgent: string,
			details?: Record<string, any>
		) =>
			auditLogger.logApiAccess(
				userId,
				userEmail,
				userName,
				userRole,
				endpoint,
				method,
				statusCode,
				duration,
				ipAddress,
				userAgent,
				details
			),

		logSystemEvent: (
			eventType:
				| 'system_backup'
				| 'system_restore'
				| 'config_changed'
				| 'data_export'
				| 'data_import',
			severity: AuditSeverity,
			userId?: string,
			userEmail?: string,
			userName?: string,
			userRole?: string,
			details: Record<string, any>,
			duration?: number
		) =>
			auditLogger.logSystemEvent(
				eventType,
				severity,
				userId,
				userEmail,
				userName,
				userRole,
				details,
				duration
			),

		logError: (
			errorMessage: string,
			severity: AuditSeverity,
			userId?: string,
			userEmail?: string,
			userName?: string,
			userRole?: string,
			resourceType?: string,
			resourceId?: string,
			details?: Record<string, any>,
			stack?: string
		) =>
			auditLogger.logError(
				errorMessage,
				severity,
				userId,
				userEmail,
				userName,
				userRole,
				resourceType,
				resourceId,
				details,
				stack
			),

		logPerformanceWarning: (
			resourceType: string,
			resourceId: string,
			metric: string,
			value: number,
			threshold: number,
			userId?: string,
			userEmail?: string,
			userName?: string,
			userRole?: string
		) =>
			auditLogger.logPerformanceWarning(
				resourceType,
				resourceId,
				metric,
				value,
				threshold,
				userId,
				userEmail,
				userName,
				userRole
			),

		getLogs: (filters?: AuditLogFilters) => auditLogger.getLogs(filters),
		getLogStats: (filters?: AuditLogFilters) => auditLogger.getLogStats(filters),
		exportLogs: (format: 'json' | 'csv' = 'json', filters?: AuditLogFilters) =>
			auditLogger.exportLogs(format, filters),
	};
}
