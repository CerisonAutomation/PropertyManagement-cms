import { RBAC, type User, type UserRole } from '@/lib/rbac';
import type React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
	children: React.ReactNode;
	user: User | null;
	requiredRole?: UserRole;
	requiredPermission?: { resource: string; action: string };
	fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	user,
	requiredRole,
	requiredPermission,
	fallback,
}) => {
	const location = useLocation();

	// User not authenticated
	if (!user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Check role requirement
	if (requiredRole && RBAC.getRoleLevel(user.role) < RBAC.getRoleLevel(requiredRole)) {
		return fallback || <Navigate to="/unauthorized" replace />;
	}

	// Check specific permission
	if (requiredPermission) {
		const hasPermission = RBAC.canRead(user, requiredPermission.resource as any);
		if (!hasPermission) {
			return fallback || <Navigate to="/unauthorized" replace />;
		}
	}

	return <>{children}</>;
};

export default ProtectedRoute;
