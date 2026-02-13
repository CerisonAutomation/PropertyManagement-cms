import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useAuditLogger } from '@/lib/audit-logger-fixed';
import { ROLE_PERMISSIONS, type User, type UserRole } from '@/lib/rbac';
import { AnimatePresence, motion } from 'framer-motion';
import {
	Calendar,
	Edit,
	Filter,
	Mail,
	MoreHorizontal,
	Plus,
	Search,
	Shield,
	Trash2,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

interface UserManagementProps {
	currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
	const { logUserAction, logSecurityAlert } = useAuditLogger();
	const [users, setUsers] = useState<User[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
	const [isLoading, setIsLoading] = useState(true);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);

	// Mock users data
	useEffect(() => {
		const mockUsers: User[] = [
			{
				id: '1',
				email: 'admin@christiano.com',
				name: 'Admin User',
				role: 'super_admin',
				active: true,
				createdAt: new Date('2024-01-15'),
				updatedAt: new Date('2024-02-13'),
			},
			{
				id: '2',
				email: 'editor@christiano.com',
				name: 'Editor User',
				role: 'editor',
				active: true,
				createdAt: new Date('2024-01-20'),
				updatedAt: new Date('2024-02-10'),
			},
			{
				id: '3',
				email: 'author@christiano.com',
				name: 'Author User',
				role: 'author',
				active: true,
				createdAt: new Date('2024-02-01'),
				updatedAt: new Date('2024-02-08'),
			},
			{
				id: '4',
				email: 'viewer@christiano.com',
				name: 'Viewer User',
				role: 'viewer',
				active: false,
				createdAt: new Date('2024-02-05'),
				updatedAt: new Date('2024-02-12'),
			},
		];

		setUsers(mockUsers);
		setIsLoading(false);
	}, []);

	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.email.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesRole = selectedRole === 'all' || user.role === selectedRole;
		return matchesSearch && matchesRole;
	});

	const handleCreateUser = (userData: Partial<User>) => {
		const newUser: User = {
			id: Date.now().toString(),
			email: userData.email || '',
			name: userData.name || '',
			role: userData.role || 'viewer',
			active: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		setUsers((prev) => [...prev, newUser]);
		setIsCreateDialogOpen(false);

		logUserAction(
			'user_created',
			currentUser.id,
			currentUser.email,
			currentUser.name,
			currentUser.role,
			newUser.id,
			newUser.email,
			{ role: newUser.role }
		);
	};

	const handleUpdateUser = (userData: Partial<User>) => {
		if (!editingUser) return;

		const updatedUsers = users.map((user) =>
			user.id === editingUser.id ? { ...user, ...userData, updatedAt: new Date() } : user
		);

		setUsers(updatedUsers);
		setEditingUser(null);

		logUserAction(
			'user_updated',
			currentUser.id,
			currentUser.email,
			currentUser.name,
			currentUser.role,
			editingUser.id,
			editingUser.email,
			{ changes: userData }
		);
	};

	const handleDeleteUser = (user: User) => {
		if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
			setUsers((prev) => prev.filter((u) => u.id !== user.id));

			logUserAction(
				'user_deleted',
				currentUser.id,
				currentUser.email,
				currentUser.name,
				currentUser.role,
				user.id,
				user.email
			);

			logSecurityAlert(
				'security_alert',
				'medium',
				{ action: 'user_deleted', targetUser: user.email },
				currentUser.id,
				currentUser.email,
				currentUser.name,
				currentUser.role
			);
		}
	};

	const getRoleBadgeColor = (role: UserRole) => {
		switch (role) {
			case 'super_admin':
				return 'bg-red-500';
			case 'admin':
				return 'bg-orange-500';
			case 'editor':
				return 'bg-blue-500';
			case 'author':
				return 'bg-green-500';
			case 'viewer':
				return 'bg-gray-500';
			default:
				return 'bg-gray-500';
		}
	};

	const getRolePermissions = (role: UserRole) => {
		return ROLE_PERMISSIONS[role]?.length || 0;
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">User Management</h2>
					<p className="text-muted-foreground">Manage user accounts and permissions</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<Plus className="h-4 w-4 mr-2" />
							Add User
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create New User</DialogTitle>
							<DialogDescription>
								Add a new user to the system with appropriate permissions.
							</DialogDescription>
						</DialogHeader>
						<CreateUserForm onSubmit={handleCreateUser} />
					</DialogContent>
				</Dialog>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Filter className="h-5 w-5 mr-2" />
						Filters
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-4">
						<div className="flex-1">
							<Label htmlFor="search">Search Users</Label>
							<div className="relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="search"
									placeholder="Search by name or email..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<div className="w-48">
							<Label htmlFor="role-filter">Filter by Role</Label>
							<Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
								<SelectTrigger>
									<SelectValue placeholder="All roles" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Roles</SelectItem>
									<SelectItem value="super_admin">Super Admin</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
									<SelectItem value="editor">Editor</SelectItem>
									<SelectItem value="author">Author</SelectItem>
									<SelectItem value="viewer">Viewer</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Users List */}
			<Card>
				<CardHeader>
					<CardTitle>Users ({filteredUsers.length})</CardTitle>
					<CardDescription>
						Total users in the system with their current roles and permissions.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-[600px]">
						<div className="space-y-4">
							<AnimatePresence>
								{filteredUsers.map((user, index) => (
									<motion.div
										key={user.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
									>
										<Card className="hover:shadow-md transition-shadow">
											<CardContent className="p-6">
												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-4">
														<Avatar>
															<AvatarImage src={user.avatar} />
															<AvatarFallback>
																{user.name
																	.split(' ')
																	.map((n) => n[0])
																	.join('')
																	.toUpperCase()}
															</AvatarFallback>
														</Avatar>
														<div>
															<div className="flex items-center space-x-2">
																<h3 className="font-semibold">{user.name}</h3>
																<Badge className={getRoleBadgeColor(user.role)}>
																	{user.role.replace('_', ' ').toUpperCase()}
																</Badge>
																{!user.active && <Badge variant="secondary">INACTIVE</Badge>}
															</div>
															<div className="flex items-center space-x-2 text-sm text-muted-foreground">
																<Mail className="h-4 w-4" />
																<span>{user.email}</span>
															</div>
															<div className="flex items-center space-x-4 text-sm text-muted-foreground">
																<div className="flex items-center space-x-1">
																	<Shield className="h-4 w-4" />
																	<span>{getRolePermissions(user.role)} permissions</span>
																</div>
																<div className="flex items-center space-x-1">
																	<Calendar className="h-4 w-4" />
																	<span>Joined {user.createdAt.toLocaleDateString()}</span>
																</div>
															</div>
														</div>
													</div>
													<div className="flex items-center space-x-2">
														<Dialog>
															<DialogTrigger asChild>
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => setEditingUser(user)}
																>
																	<Edit className="h-4 w-4" />
																</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Edit User</DialogTitle>
																	<DialogDescription>
																		Update user information and permissions.
																	</DialogDescription>
																</DialogHeader>
																<CreateUserForm user={editingUser} onSubmit={handleUpdateUser} />
															</DialogContent>
														</Dialog>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button variant="outline" size="sm">
																	<MoreHorizontal className="h-4 w-4" />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuLabel>Actions</DropdownMenuLabel>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onClick={() => handleDeleteUser(user)}
																	className="text-destructive"
																>
																	<Trash2 className="h-4 w-4 mr-2" />
																	Delete User
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</ScrollArea>
				</CardContent>
			</Card>
		</div>
	);
};

// User Form Component
interface CreateUserFormProps {
	user?: User | null;
	onSubmit: (userData: Partial<User>) => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ user, onSubmit }) => {
	const [formData, setFormData] = useState({
		name: user?.name || '',
		email: user?.email || '',
		role: user?.role || ('viewer' as UserRole),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					value={formData.name}
					onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
					required
				/>
			</div>
			<div>
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					value={formData.email}
					onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
					required
				/>
			</div>
			<div>
				<Label htmlFor="role">Role</Label>
				<Select
					value={formData.role}
					onValueChange={(value: UserRole) => setFormData((prev) => ({ ...prev, role: value }))}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="viewer">Viewer - Read only</SelectItem>
						<SelectItem value="author">Author - Can create content</SelectItem>
						<SelectItem value="editor">Editor - Can manage content</SelectItem>
						<SelectItem value="admin">Admin - Can manage users</SelectItem>
						<SelectItem value="super_admin">Super Admin - Full access</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="flex justify-end space-x-2">
				<Button type="submit">{user ? 'Update User' : 'Create User'}</Button>
			</div>
		</form>
	);
};

export default UserManagement;
