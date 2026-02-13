import { z } from 'zod';

// Role definitions with hierarchical permissions
export const UserRoleSchema = z.enum(['super_admin', 'admin', 'editor', 'author', 'viewer']);

export type UserRole = z.infer<typeof UserRoleSchema>;

// Resource types for fine-grained permissions
export const ResourceTypeSchema = z.enum([
	'users',
	'content',
	'pages',
	'blog_posts',
	'properties',
	'media',
	'settings',
	'analytics',
	'security',
	'system',
]);

export type ResourceType = z.infer<typeof ResourceTypeSchema>;

// Action types for permissions
export const ActionSchema = z.enum([
	'create',
	'read',
	'update',
	'delete',
	'publish',
	'archive',
	'manage',
	'admin',
]);

export type Action = z.infer<typeof ActionSchema>;

// Permission definition
export interface Permission {
	resource: ResourceType;
	action: Action;
	conditions?: Record<string, any>;
}

// Role-based access control configuration
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
	super_admin: [
		// Full access to everything
		...Object.values(ResourceTypeSchema.enum).flatMap((resource) =>
			Object.values(ActionSchema.enum).map((action) => ({ resource, action }))
		),
	],

	admin: [
		// Almost full access except system-level operations
		{ resource: 'users', action: 'create' },
		{ resource: 'users', action: 'read' },
		{ resource: 'users', action: 'update' },
		{ resource: 'users', action: 'delete' },
		{ resource: 'content', action: 'create' },
		{ resource: 'content', action: 'read' },
		{ resource: 'content', action: 'update' },
		{ resource: 'content', action: 'delete' },
		{ resource: 'content', action: 'publish' },
		{ resource: 'pages', action: 'create' },
		{ resource: 'pages', action: 'read' },
		{ resource: 'pages', action: 'update' },
		{ resource: 'pages', action: 'delete' },
		{ resource: 'pages', action: 'publish' },
		{ resource: 'blog_posts', action: 'create' },
		{ resource: 'blog_posts', action: 'read' },
		{ resource: 'blog_posts', action: 'update' },
		{ resource: 'blog_posts', action: 'delete' },
		{ resource: 'blog_posts', action: 'publish' },
		{ resource: 'properties', action: 'create' },
		{ resource: 'properties', action: 'read' },
		{ resource: 'properties', action: 'update' },
		{ resource: 'properties', action: 'delete' },
		{ resource: 'properties', action: 'publish' },
		{ resource: 'media', action: 'create' },
		{ resource: 'media', action: 'read' },
		{ resource: 'media', action: 'update' },
		{ resource: 'media', action: 'delete' },
		{ resource: 'settings', action: 'read' },
		{ resource: 'settings', action: 'update' },
		{ resource: 'analytics', action: 'read' },
		{ resource: 'security', action: 'read' },
	],

	editor: [
		// Content management permissions
		{ resource: 'content', action: 'create' },
		{ resource: 'content', action: 'read' },
		{ resource: 'content', action: 'update' },
		{ resource: 'content', action: 'publish' },
		{ resource: 'pages', action: 'create' },
		{ resource: 'pages', action: 'read' },
		{ resource: 'pages', action: 'update' },
		{ resource: 'pages', action: 'publish' },
		{ resource: 'blog_posts', action: 'create' },
		{ resource: 'blog_posts', action: 'read' },
		{ resource: 'blog_posts', action: 'update' },
		{ resource: 'blog_posts', action: 'publish' },
		{ resource: 'properties', action: 'create' },
		{ resource: 'properties', action: 'read' },
		{ resource: 'properties', action: 'update' },
		{ resource: 'properties', action: 'publish' },
		{ resource: 'media', action: 'create' },
		{ resource: 'media', action: 'read' },
		{ resource: 'media', action: 'update' },
		{ resource: 'analytics', action: 'read' },
	],

	author: [
		// Limited content creation and management
		{ resource: 'blog_posts', action: 'create' },
		{ resource: 'blog_posts', action: 'read' },
		{ resource: 'blog_posts', action: 'update', conditions: { own_content_only: true } },
		{ resource: 'media', action: 'create' },
		{ resource: 'media', action: 'read', conditions: { own_content_only: true } },
		{ resource: 'pages', action: 'read' },
	],

	viewer: [
		// Read-only access
		{ resource: 'content', action: 'read' },
		{ resource: 'pages', action: 'read' },
		{ resource: 'blog_posts', action: 'read' },
		{ resource: 'properties', action: 'read' },
		{ resource: 'media', action: 'read' },
		{ resource: 'analytics', action: 'read' },
	],
};

// User interface with role and permissions
export interface User {
	id: string;
	email: string;
	name: string;
	role: UserRole;
	permissions?: Permission[];
	department?: string;
	location?: string;
	lastLogin?: Date;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Permission checking utilities
export class RBAC {
	private static hasPermission(
		user: User,
		resource: ResourceType,
		action: Action,
		context?: Record<string, any>
	): boolean {
		const permissions = user.permissions || ROLE_PERMISSIONS[user.role] || [];

		return permissions.some((permission) => {
			if (permission.resource !== resource || permission.action !== action) {
				return false;
			}

			// Check conditions if they exist
			if (permission.conditions && context) {
				return this.evaluateConditions(permission.conditions, context, user);
			}

			return true;
		});
	}

	private static evaluateConditions(
		conditions: Record<string, any>,
		context: Record<string, any>,
		user: User
	): boolean {
		// Handle 'own_content_only' condition
		if (conditions['own_content_only'] && context['resourceOwnerId']) {
			return context['resourceOwnerId'] === user.id;
		}

		// Handle department-based access
		if (conditions['department'] && user.department) {
			return conditions['department'] === user.department;
		}

		// Handle location-based access
		if (conditions['location'] && user.location) {
			return conditions['location'] === user.location;
		}

		// Handle time-based restrictions
		if (conditions['timeRange']) {
			const now = new Date();
			const currentTime = now.getHours() * 60 + now.getMinutes();
			return (
				currentTime >= conditions['timeRange']['start'] &&
				currentTime <= conditions['timeRange']['end']
			);
		}

		return true;
	}

	// Public permission checking methods
	static canCreate(user: User, resource: ResourceType, context?: Record<string, any>): boolean {
		return this.hasPermission(user, resource, 'create', context);
	}

	static canRead(user: User, resource: ResourceType, context?: Record<string, any>): boolean {
		return this.hasPermission(user, resource, 'read', context);
	}

	static canUpdate(user: User, resource: ResourceType, context?: Record<string, any>): boolean {
		return this.hasPermission(user, resource, 'update', context);
	}

	static canDelete(user: User, resource: ResourceType, context?: Record<string, any>): boolean {
		return this.hasPermission(user, resource, 'delete', context);
	}

	static canPublish(user: User, resource: ResourceType, context?: Record<string, any>): boolean {
		return this.hasPermission(user, resource, 'publish', context);
	}

	static canManage(user: User, resource: ResourceType, context?: Record<string, any>): boolean {
		return this.hasPermission(user, resource, 'manage', context);
	}

	static canAdmin(user: User, resource: ResourceType, context?: Record<string, any>): boolean {
		return this.hasPermission(user, resource, 'admin', context);
	}

	// Get all permissions for a user
	static getUserPermissions(user: User): Permission[] {
		return user.permissions || ROLE_PERMISSIONS[user.role] || [];
	}

	// Check if user has any of the specified permissions
	static hasAnyPermission(
		user: User,
		requiredPermissions: Array<{ resource: ResourceType; action: Action }>
	): boolean {
		return requiredPermissions.some(({ resource, action }) =>
			this.hasPermission(user, resource, action)
		);
	}

	// Check if user has all specified permissions
	static hasAllPermissions(
		user: User,
		requiredPermissions: Array<{ resource: ResourceType; action: Action }>
	): boolean {
		return requiredPermissions.every(({ resource, action }) =>
			this.hasPermission(user, resource, action)
		);
	}

	// Get role hierarchy level (higher number = more privileges)
	static getRoleLevel(role: UserRole): number {
		const hierarchy = {
			viewer: 1,
			author: 2,
			editor: 3,
			admin: 4,
			super_admin: 5,
		};
		return hierarchy[role] || 0;
	}

	// Check if user can access another user's resources
	static canAccessUserResources(
		user: User,
		targetUser: User,
		resource: ResourceType,
		action: Action
	): boolean {
		// Users can always access their own resources
		if (user.id === targetUser.id) {
			return this.hasPermission(user, resource, action);
		}

		// Check role hierarchy
		const userLevel = this.getRoleLevel(user.role);
		const targetLevel = this.getRoleLevel(targetUser.role);

		// Higher role can access lower role's resources
		if (userLevel > targetLevel) {
			return this.hasPermission(user, resource, action);
		}

		// Same role can only access if explicitly allowed
		return userLevel === targetLevel && this.hasPermission(user, resource, action);
	}
}

// React hook for RBAC
export function useRBAC(user: User) {
	return {
		canCreate: (resource: ResourceType, context?: Record<string, any>) =>
			RBAC.canCreate(user, resource, context),
		canRead: (resource: ResourceType, context?: Record<string, any>) =>
			RBAC.canRead(user, resource, context),
		canUpdate: (resource: ResourceType, context?: Record<string, any>) =>
			RBAC.canUpdate(user, resource, context),
		canDelete: (resource: ResourceType, context?: Record<string, any>) =>
			RBAC.canDelete(user, resource, context),
		canPublish: (resource: ResourceType, context?: Record<string, any>) =>
			RBAC.canPublish(user, resource, context),
		canManage: (resource: ResourceType, context?: Record<string, any>) =>
			RBAC.canManage(user, resource, context),
		canAdmin: (resource: ResourceType, context?: Record<string, any>) =>
			RBAC.canAdmin(user, resource, context),
		getUserPermissions: () => RBAC.getUserPermissions(user),
		hasAnyPermission: (permissions: Array<{ resource: ResourceType; action: Action }>) =>
			RBAC.hasAnyPermission(user, permissions),
		hasAllPermissions: (permissions: Array<{ resource: ResourceType; action: Action }>) =>
			RBAC.hasAllPermissions(user, permissions),
		canAccessUserResources: (targetUser: User, resource: ResourceType, action: Action) =>
			RBAC.canAccessUserResources(user, targetUser, resource, action),
	};
}

// Export default permissions for easy access
export const DEFAULT_PERMISSIONS = ROLE_PERMISSIONS;
