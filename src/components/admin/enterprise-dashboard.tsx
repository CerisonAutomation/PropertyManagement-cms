import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useTheme } from '@/lib/theme-provider';
import { AnimatePresence, motion } from 'framer-motion';
import {
	Activity,
	BarChart3,
	Bell,
	Clock,
	Database,
	FileText,
	Globe,
	Info,
	LayoutDashboard,
	LogOut,
	Menu,
	Moon,
	Plus,
	RefreshCw,
	Search,
	Settings,
	Shield,
	Sun,
	TrendingUp,
	User,
	Users,
	X,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface DashboardStats {
	totalUsers: number;
	activeUsers: number;
	totalRevenue: number;
	monthlyGrowth: number;
	systemHealth: number;
	storageUsed: number;
	storageTotal: number;
	apiCalls: number;
	errorRate: number;
	uptime: number;
}

interface ActivityItem {
	id: string;
	type: 'user' | 'system' | 'security' | 'performance';
	title: string;
	description: string;
	timestamp: Date;
	user?: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

interface QuickAction {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	action: () => void;
	color: string;
}

const EnterpriseDashboard: React.FC = () => {
	const { setTheme, themes } = useTheme();
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [notifications] = useState(5);
	const stats: DashboardStats = {
		totalUsers: 12453,
		activeUsers: 8932,
		totalRevenue: 892341,
		monthlyGrowth: 12.5,
		systemHealth: 98.7,
		storageUsed: 67.3,
		storageTotal: 100,
		apiCalls: 1234567,
		errorRate: 0.02,
		uptime: 99.97,
	};

	const activities: ActivityItem[] = [
		{
			id: '1',
			type: 'user',
			title: 'New user registration',
			description: 'John Doe registered for a new account',
			timestamp: new Date(Date.now() - 1000 * 60 * 5),
			user: 'admin',
			severity: 'low',
		},
		{
			id: '2',
			type: 'security',
			title: 'Security alert',
			description: 'Multiple failed login attempts detected',
			timestamp: new Date(Date.now() - 1000 * 60 * 15),
			user: 'system',
			severity: 'high',
		},
		{
			id: '3',
			type: 'performance',
			title: 'Performance warning',
			description: 'Database response time increased by 200ms',
			timestamp: new Date(Date.now() - 1000 * 60 * 30),
			user: 'system',
			severity: 'medium',
		},
	];

	const quickActions: QuickAction[] = [
		{
			id: '1',
			title: 'Add User',
			description: 'Create a new user account',
			icon: <User className="h-5 w-5" />,
			action: () => console.log('Add user'),
			color: 'bg-blue-500',
		},
		{
			id: '2',
			title: 'Generate Report',
			description: 'Create analytics report',
			icon: <BarChart3 className="h-5 w-5" />,
			action: () => console.log('Generate report'),
			color: 'bg-green-500',
		},
		{
			id: '3',
			title: 'System Backup',
			description: 'Initiate system backup',
			icon: <Database className="h-5 w-5" />,
			action: () => console.log('System backup'),
			color: 'bg-purple-500',
		},
		{
			id: '4',
			title: 'Security Audit',
			description: 'Run security audit',
			icon: <Shield className="h-5 w-5" />,
			action: () => console.log('Security audit'),
			color: 'bg-red-500',
		},
	];

	const menuItems = [
		{ icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', active: true },
		{ icon: <Users className="h-5 w-5" />, label: 'Users', active: false },
		{ icon: <FileText className="h-5 w-5" />, label: 'Content', active: false },
		{ icon: <BarChart3 className="h-5 w-5" />, label: 'Analytics', active: false },
		{ icon: <Settings className="h-5 w-5" />, label: 'Settings', active: false },
		{ icon: <Shield className="h-5 w-5" />, label: 'Security', active: false },
	];

	const formatNumber = (num: number): string => {
		if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
		if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
		return num.toString();
	};

	const formatCurrency = (num: number): string => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(num);
	};

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case 'critical':
				return 'bg-red-500';
			case 'high':
				return 'bg-orange-500';
			case 'medium':
				return 'bg-yellow-500';
			case 'low':
				return 'bg-green-500';
			default:
				return 'bg-gray-500';
		}
	};

	const getActivityIcon = (type: string) => {
		switch (type) {
			case 'user':
				return <User className="h-4 w-4" />;
			case 'system':
				return <Activity className="h-4 w-4" />;
			case 'security':
				return <Shield className="h-4 w-4" />;
			case 'performance':
				return <TrendingUp className="h-4 w-4" />;
			default:
				return <Info className="h-4 w-4" />;
		}
	};

	return (
		<TooltipProvider>
			<div className="min-h-screen bg-background">
				{/* Header */}
				<header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
					<div className="flex h-16 items-center px-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSidebarOpen(!sidebarOpen)}
							className="mr-4"
							aria-label="Toggle sidebar"
						>
							{sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</Button>

						<div className="flex-1 flex items-center space-x-4">
							<div className="relative max-w-md flex-1">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
									aria-label="Search"
								/>
							</div>
						</div>

						<div className="flex items-center space-x-4">
							{/* Theme Switcher */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" aria-label="Switch theme">
										<Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
										<Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Themes</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{Object.entries(themes).map(([key]) => (
										<DropdownMenuItem
											key={key}
											onClick={() => setTheme(key as keyof typeof themes)}
										>
											{themes[key as keyof typeof themes].name}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Notifications */}
							<Button variant="ghost" size="sm" className="relative" aria-label="Notifications">
								<Bell className="h-5 w-5" />
								{notifications > 0 && (
									<Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
										{notifications}
									</Badge>
								)}
							</Button>

							{/* User Menu */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="relative h-8 w-8 rounded-full">
										<Avatar className="h-8 w-8">
											<AvatarImage src="/avatars/01.png" alt="User" />
											<AvatarFallback>JD</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">John Doe</p>
											<p className="text-xs leading-none text-muted-foreground">john@example.com</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<User className="mr-2 h-4 w-4" />
										<span>Profile</span>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Settings className="mr-2 h-4 w-4" />
										<span>Settings</span>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Log out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</header>

				<div className="flex">
					{/* Sidebar */}
					<AnimatePresence>
						{sidebarOpen && (
							<motion.aside
								initial={{ x: -300 }}
								animate={{ x: 0 }}
								exit={{ x: -300 }}
								transition={{ type: 'spring', damping: 25, stiffness: 200 }}
								className="w-64 border-r bg-card/50 backdrop-blur-sm h-[calc(100vh-4rem)] sticky top-16"
							>
								<ScrollArea className="h-full p-4">
									<nav className="space-y-2">
										{menuItems.map((item, index) => (
											<Button
												key={index}
												variant={item.active ? 'default' : 'ghost'}
												className="w-full justify-start"
												aria-label={item.label}
											>
												{item.icon}
												<span className="ml-2">{item.label}</span>
											</Button>
										))}
									</nav>

									<Separator className="my-4" />

									<div className="space-y-4">
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-sm">System Status</CardTitle>
											</CardHeader>
											<CardContent className="space-y-2">
												<div className="flex justify-between text-sm">
													<span>Health</span>
													<span className="text-green-600">{stats.systemHealth}%</span>
												</div>
												<Progress value={stats.systemHealth} className="h-2" />
												<div className="flex justify-between text-sm">
													<span>Uptime</span>
													<span className="text-green-600">{stats.uptime}%</span>
												</div>
												<Progress value={stats.uptime} className="h-2" />
											</CardContent>
										</Card>

										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-sm">Storage</CardTitle>
											</CardHeader>
											<CardContent className="space-y-2">
												<div className="flex justify-between text-sm">
													<span>Used</span>
													<span>{stats.storageUsed}%</span>
												</div>
												<Progress value={stats.storageUsed} className="h-2" />
												<div className="text-xs text-muted-foreground">
													{formatNumber(stats.storageUsed * 10)}GB /{' '}
													{formatNumber(stats.storageTotal * 10)}GB
												</div>
											</CardContent>
										</Card>
									</div>
								</ScrollArea>
							</motion.aside>
						)}
					</AnimatePresence>

					{/* Main Content */}
					<main className="flex-1 p-6">
						<div className="max-w-7xl mx-auto space-y-6">
							{/* Page Header */}
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-3xl font-bold tracking-tight">Enterprise Dashboard</h1>
									<p className="text-muted-foreground">
										Welcome back! Here's what's happening with your system today.
									</p>
								</div>
								<div className="flex items-center space-x-2">
									<Button variant="outline" size="sm">
										<RefreshCw className="h-4 w-4 mr-2" />
										Refresh
									</Button>
									<Button size="sm">
										<Plus className="h-4 w-4 mr-2" />
										New Action
									</Button>
								</div>
							</div>

							{/* Stats Grid */}
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">Total Users</CardTitle>
										<Users className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
										<p className="text-xs text-muted-foreground">
											+{stats.monthlyGrowth}% from last month
										</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">Active Users</CardTitle>
										<Activity className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{formatNumber(stats.activeUsers)}</div>
										<p className="text-xs text-muted-foreground">
											{Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total users
										</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">Revenue</CardTitle>
										<TrendingUp className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
										<p className="text-xs text-muted-foreground">
											+{stats.monthlyGrowth}% from last month
										</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<CardTitle className="text-sm font-medium">API Calls</CardTitle>
										<Globe className="h-4 w-4 text-muted-foreground" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{formatNumber(stats.apiCalls)}</div>
										<p className="text-xs text-muted-foreground">
											Error rate: {(stats.errorRate * 100).toFixed(2)}%
										</p>
									</CardContent>
								</Card>
							</div>

							{/* Quick Actions */}
							<Card>
								<CardHeader>
									<CardTitle>Quick Actions</CardTitle>
									<CardDescription>Frequently used actions and shortcuts</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
										{quickActions.map((action) => (
											<Button
												key={action.id}
												variant="outline"
												className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent"
												onClick={action.action}
											>
												<div className={`p-2 rounded-lg ${action.color} text-white`}>
													{action.icon}
												</div>
												<div className="text-center">
													<div className="font-medium">{action.title}</div>
													<div className="text-xs text-muted-foreground">{action.description}</div>
												</div>
											</Button>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Activity Feed */}
							<div className="grid gap-6 md:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>Recent Activity</CardTitle>
										<CardDescription>Latest system activities and events</CardDescription>
									</CardHeader>
									<CardContent>
										<ScrollArea className="h-[300px]">
											<div className="space-y-4">
												{activities.map((activity) => (
													<div key={activity.id} className="flex items-start space-x-3">
														<div
															className={`p-2 rounded-full ${getSeverityColor(activity.severity)} text-white`}
														>
															{getActivityIcon(activity.type)}
														</div>
														<div className="flex-1 space-y-1">
															<p className="text-sm font-medium">{activity.title}</p>
															<p className="text-xs text-muted-foreground">
																{activity.description}
															</p>
															<div className="flex items-center space-x-2 text-xs text-muted-foreground">
																<Clock className="h-3 w-3" />
																<span>{activity.timestamp.toLocaleString()}</span>
																{activity.user && (
																	<>
																		<Separator orientation="vertical" className="h-3" />
																		<span>{activity.user}</span>
																	</>
																)}
															</div>
														</div>
													</div>
												))}
											</div>
										</ScrollArea>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>System Performance</CardTitle>
										<CardDescription>Real-time system metrics and performance</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span>CPU Usage</span>
													<span>45%</span>
												</div>
												<Progress value={45} className="h-2" />
											</div>
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span>Memory Usage</span>
													<span>67%</span>
												</div>
												<Progress value={67} className="h-2" />
											</div>
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span>Network I/O</span>
													<span>23%</span>
												</div>
												<Progress value={23} className="h-2" />
											</div>
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span>Disk I/O</span>
													<span>12%</span>
												</div>
												<Progress value={12} className="h-2" />
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</main>
				</div>
			</div>
		</TooltipProvider>
	);
};

export default EnterpriseDashboard;
