import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCmsPages, useCreateCmsPage, useDeleteCmsPage, useUpdateCmsPage } from '@/hooks/use-cms';
import type { CmsPage } from '@/hooks/use-cms';
import { useToast } from '@/hooks/use-toast';
import {
	Edit3,
	ExternalLink,
	Eye,
	EyeOff,
	FileText,
	Layout,
	Plus,
	Settings,
	Trash2,
} from 'lucide-react';
import { useState } from 'react';
import PageContentEditor from './PageContentEditor';

interface PageManagerProps {
	onCreatePage?: (page: CmsPage) => void;
	onEditPage?: (page: CmsPage) => void;
}

export default function PageManager({ onCreatePage, onEditPage }: PageManagerProps) {
	const { data: pages, isLoading, refetch } = useCmsPages();
	const createPage = useCreateCmsPage();
	const updatePage = useUpdateCmsPage();
	const deletePage = useDeleteCmsPage();
	const { toast } = useToast();

	const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);

	const [formData, setFormData] = useState({
		slug: '',
		title: '',
		content: {},
		meta_title: '',
		meta_description: '',
		status: 'draft' as 'draft' | 'published' | 'archived',
		template: 'default' as 'default' | 'landing' | 'blog' | 'portfolio',
		sort_order: 0,
		published_at: null as string | null,
	});

	const resetForm = () => {
		setFormData({
			slug: '',
			title: '',
			content: {},
			meta_title: '',
			meta_description: '',
			status: 'draft',
			template: 'default',
			sort_order: 0,
			published_at: null,
		});
	};

	const handleCreatePage = async () => {
		try {
			const newPage = await createPage.mutateAsync(formData);
			toast({ title: '✓ Page Created', description: `"${formData.title}" has been created` });
			resetForm();
			setIsCreateDialogOpen(false);
			refetch();
			onCreatePage?.(newPage);
		} catch (error) {
			toast({ title: 'Error', description: 'Failed to create page', variant: 'destructive' });
		}
	};

	const handleUpdatePage = async () => {
		if (!editingPage) return;

		try {
			await updatePage.mutateAsync({ id: editingPage.id, ...formData });
			toast({ title: '✓ Page Updated', description: `"${formData.title}" has been updated` });
			setIsEditDialogOpen(false);
			setEditingPage(null);
			refetch();
			onEditPage?.(editingPage);
		} catch (error) {
			toast({ title: 'Error', description: 'Failed to update page', variant: 'destructive' });
		}
	};

	const handleDeletePage = async (page: CmsPage) => {
		if (!confirm(`Are you sure you want to delete "${page.title}"?`)) return;

		try {
			await deletePage.mutateAsync(page.id);
			toast({ title: '✓ Page Deleted', description: `"${page.title}" has been deleted` });
			refetch();
		} catch (error) {
			toast({ title: 'Error', description: 'Failed to delete page', variant: 'destructive' });
		}
	};

	const handleToggleStatus = async (page: CmsPage) => {
		const newStatus = page.status === 'published' ? 'draft' : 'published';
		try {
			await updatePage.mutateAsync({ id: page.id, status: newStatus });
			toast({ title: '✓ Status Updated', description: `Page is now ${newStatus}` });
			refetch();
		} catch (error) {
			toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
		}
	};

	const openEditDialog = (page: CmsPage) => {
		setEditingPage(page);
		setFormData({
			slug: page.slug,
			title: page.title,
			content: page.content,
			meta_title: page.meta_title || '',
			meta_description: page.meta_description || '',
			status: page.status,
			template: page.template,
			sort_order: page.sort_order,
			published_at: page.published_at,
		});
		setIsEditDialogOpen(true);
	};

	const openContentDialog = (page: CmsPage) => {
		setEditingPage(page);
		setIsContentDialogOpen(true);
	};

	const handleContentUpdate = (newContent: any) => {
		if (!editingPage) return;

		try {
			updatePage.mutateAsync({ id: editingPage.id, content: newContent });
			toast({ title: '✓ Content Updated', description: 'Page content has been updated' });
			refetch();
		} catch (error) {
			toast({ title: 'Error', description: 'Failed to update content', variant: 'destructive' });
		}
	};

	const getStatusBadge = (status: string) => {
		const variants = {
			draft: 'secondary',
			published: 'default',
			archived: 'outline',
		} as const;

		return (
			<Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>
		);
	};

	const getTemplateBadge = (template: string) => {
		const colors = {
			default: 'bg-blue-100 text-blue-800',
			landing: 'bg-green-100 text-green-800',
			blog: 'bg-purple-100 text-purple-800',
			portfolio: 'bg-orange-100 text-orange-800',
		} as const;

		return (
			<Badge className={colors[template as keyof typeof colors] || colors.default}>
				{template}
			</Badge>
		);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Page Management</h2>
					<p className="text-muted-foreground">Create and manage your website pages</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={resetForm}>
							<Plus className="w-4 h-4 mr-2" />
							Create Page
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Create New Page</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										value={formData.title}
										onChange={(e) => setFormData({ ...formData, title: e.target.value })}
										placeholder="Page title"
									/>
								</div>
								<div>
									<Label htmlFor="slug">URL Slug</Label>
									<Input
										id="slug"
										value={formData.slug}
										onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
										placeholder="page-url"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="status">Status</Label>
									<Select
										value={formData.status}
										onValueChange={(value: any) => setFormData({ ...formData, status: value })}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="draft">Draft</SelectItem>
											<SelectItem value="published">Published</SelectItem>
											<SelectItem value="archived">Archived</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="template">Template</Label>
									<Select
										value={formData.template}
										onValueChange={(value: any) => setFormData({ ...formData, template: value })}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="default">Default</SelectItem>
											<SelectItem value="landing">Landing</SelectItem>
											<SelectItem value="blog">Blog</SelectItem>
											<SelectItem value="portfolio">Portfolio</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div>
								<Label htmlFor="meta_title">Meta Title</Label>
								<Input
									id="meta_title"
									value={formData.meta_title}
									onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
									placeholder="SEO title (optional)"
								/>
							</div>

							<div>
								<Label htmlFor="meta_description">Meta Description</Label>
								<Textarea
									id="meta_description"
									value={formData.meta_description}
									onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
									placeholder="SEO description (optional)"
									rows={3}
								/>
							</div>

							<div>
								<Label htmlFor="sort_order">Sort Order</Label>
								<Input
									id="sort_order"
									type="number"
									value={formData.sort_order}
									onChange={(e) =>
										setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) || 0 })
									}
									placeholder="0"
								/>
							</div>

							<div className="flex justify-end gap-2 pt-4">
								<Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
									Cancel
								</Button>
								<Button onClick={handleCreatePage} disabled={createPage.isPending}>
									{createPage.isPending ? 'Creating...' : 'Create Page'}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4">
				{pages?.map((page) => (
					<Card key={page.id}>
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<h3 className="text-lg font-semibold">{page.title}</h3>
										{getStatusBadge(page.status)}
										{getTemplateBadge(page.template)}
									</div>
									<div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
										<span className="flex items-center gap-1">
											<FileText className="w-4 h-4" />/{page.slug}
										</span>
										<span className="flex items-center gap-1">
											<Layout className="w-4 h-4" />
											Order: {page.sort_order}
										</span>
										{page.published_at && (
											<span>Published: {new Date(page.published_at).toLocaleDateString()}</span>
										)}
									</div>
									{page.meta_description && (
										<p className="text-sm text-muted-foreground mb-3">{page.meta_description}</p>
									)}
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm" onClick={() => openContentDialog(page)}>
											<Edit3 className="w-4 h-4 mr-1" />
											Edit Content
										</Button>
										<Button variant="outline" size="sm" onClick={() => openEditDialog(page)}>
											<Settings className="w-4 h-4 mr-1" />
											Settings
										</Button>
										<Button variant="outline" size="sm" onClick={() => handleToggleStatus(page)}>
											{page.status === 'published' ? (
												<>
													<EyeOff className="w-4 h-4 mr-1" />
													Unpublish
												</>
											) : (
												<>
													<Eye className="w-4 h-4 mr-1" />
													Publish
												</>
											)}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => window.open(`/${page.slug}`, '_blank')}
											disabled={page.status !== 'published'}
										>
											<ExternalLink className="w-4 h-4 mr-1" />
											View
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => handleDeletePage(page)}
											className="text-destructive hover:text-destructive"
										>
											<Trash2 className="w-4 h-4 mr-1" />
											Delete
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}

				{(!pages || pages.length === 0) && (
					<Card>
						<CardContent className="p-12 text-center">
							<FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
							<h3 className="text-lg font-semibold mb-2">No pages yet</h3>
							<p className="text-muted-foreground mb-4">Create your first page to get started</p>
							<Button onClick={() => setIsCreateDialogOpen(true)}>
								<Plus className="w-4 h-4 mr-2" />
								Create Page
							</Button>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Edit Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Page: {editingPage?.title}</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="edit-title">Title</Label>
								<Input
									id="edit-title"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder="Page title"
								/>
							</div>
							<div>
								<Label htmlFor="edit-slug">URL Slug</Label>
								<Input
									id="edit-slug"
									value={formData.slug}
									onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
									placeholder="page-url"
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="edit-status">Status</Label>
								<Select
									value={formData.status}
									onValueChange={(value: any) => setFormData({ ...formData, status: value })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="draft">Draft</SelectItem>
										<SelectItem value="published">Published</SelectItem>
										<SelectItem value="archived">Archived</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="edit-template">Template</Label>
								<Select
									value={formData.template}
									onValueChange={(value: any) => setFormData({ ...formData, template: value })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default">Default</SelectItem>
										<SelectItem value="landing">Landing</SelectItem>
										<SelectItem value="blog">Blog</SelectItem>
										<SelectItem value="portfolio">Portfolio</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div>
							<Label htmlFor="edit-meta_title">Meta Title</Label>
							<Input
								id="edit-meta_title"
								value={formData.meta_title}
								onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
								placeholder="SEO title (optional)"
							/>
						</div>

						<div>
							<Label htmlFor="edit-meta_description">Meta Description</Label>
							<Textarea
								id="edit-meta_description"
								value={formData.meta_description}
								onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
								placeholder="SEO description (optional)"
								rows={3}
							/>
						</div>

						<div>
							<Label htmlFor="edit-sort_order">Sort Order</Label>
							<Input
								id="edit-sort_order"
								type="number"
								value={formData.sort_order}
								onChange={(e) =>
									setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) || 0 })
								}
								placeholder="0"
							/>
						</div>

						<div className="flex justify-end gap-2 pt-4">
							<Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
								Cancel
							</Button>
							<Button onClick={handleUpdatePage} disabled={updatePage.isPending}>
								{updatePage.isPending ? 'Updating...' : 'Update Page'}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Content Editor Dialog */}
			<Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
				<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Content: {editingPage?.title}</DialogTitle>
					</DialogHeader>
					{editingPage && <PageContentEditor page={editingPage} onUpdate={handleContentUpdate} />}
				</DialogContent>
			</Dialog>
		</div>
	);
}
