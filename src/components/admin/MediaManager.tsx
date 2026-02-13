import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import {
	Copy,
	Download,
	Eye,
	File,
	Film,
	FolderOpen,
	Grid,
	Image as ImageIcon,
	ImagePlus,
	List,
	Play,
	Search,
	SortAsc,
	Trash2,
	Upload,
	Video,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface MediaFile {
	id: string;
	name: string;
	url: string;
	thumbnail_url?: string;
	type: string;
	size: number;
	created_at: string;
	metadata?: Record<string, unknown>;
	folder?: string;
	alt_text?: string;
	caption?: string;
}

interface UploadResult {
	name: string;
	status: 'success' | 'failed';
}

type ViewMode = 'grid' | 'list' | 'slideshow';
type SortBy = 'date' | 'name' | 'size' | 'type';

export default function MediaManager() {
	const [files, setFiles] = useState<MediaFile[]>([]);
	const [folders, setFolders] = useState<string[]>([]);
	const [uploading, setUploading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
	const [previewOpen, setPreviewOpen] = useState(false);
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [viewMode, setViewMode] = useState<ViewMode>('grid');
	const [sortBy, setSortBy] = useState<SortBy>('date');
	const [currentFolder, setCurrentFolder] = useState<string>('');
	const [activeTab, setActiveTab] = useState('all');
	const [dragActive, setDragActive] = useState(false);
	const [slideshowIndex, setSlideshowIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	// Load files from Supabase Storage
	const loadFiles = useCallback(async () => {
		try {
			const { data, error } = await supabase.storage.from('cms-media').list(currentFolder || '', {
				limit: 100,
				offset: 0,
				sortBy: { column: 'name', order: 'asc' },
			});

			if (error) throw error;

			const filesWithUrls = await Promise.all(
				(data || []).map(async (file) => {
					const {
						data: { publicUrl },
					} = supabase.storage
						.from('cms-media')
						.getPublicUrl(currentFolder ? `${currentFolder}/${file.name}` : file.name);

					const {
						data: { publicUrl: thumbUrl },
					} = supabase.storage
						.from('cms-media')
						.getPublicUrl(
							currentFolder ? `${currentFolder}/thumb_${file.name}` : `thumb_${file.name}`
						);

					return {
						id: file.id || file.name,
						name: file.name,
						url: publicUrl,
						thumbnail_url: thumbUrl,
						type: file.metadata?.mimetype || 'unknown',
						size: file.metadata?.size || 0,
						created_at: file.created_at,
						metadata: file.metadata,
						folder: currentFolder,
					} as MediaFile;
				})
			);

			setFiles(filesWithUrls);
		} catch (error) {
			console.error('Error loading files:', error);
			toast({
				title: '⚠ Error',
				description: 'Failed to load media files',
				variant: 'destructive',
			});
		}
	}, [currentFolder, toast]);

	// Load folders
	const loadFolders = useCallback(async () => {
		try {
			const { data, error } = await supabase.storage.from('cms-media').list('', { limit: 100 });

			if (error) throw error;

			// Extract unique folders
			const folderSet = new Set<string>();
			(data || []).forEach((file) => {
				const parts = file.name.split('/');
				if (parts.length > 1) {
					folderSet.add(parts[0]);
				}
			});
			setFolders(Array.from(folderSet));
		} catch (error) {
			console.error('Error loading folders:', error);
		}
	}, []);

	useEffect(() => {
		loadFiles();
		loadFolders();
	}, [loadFiles, loadFolders]);

	// File upload handler
	const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = event.target.files;
		if (!selectedFiles || selectedFiles.length === 0) return;

		setUploading(true);
		const uploadResults: UploadResult[] = [];

		for (const file of Array.from(selectedFiles)) {
			const fileName = currentFolder
				? `${currentFolder}/${Date.now()}-${file.name}`
				: `${Date.now()}-${file.name}`;

			try {
				const { error } = await supabase.storage.from('cms-media').upload(fileName, file, {
					cacheControl: '3600',
					upsert: false,
					metadata: {
						mimetype: file.type,
						size: file.size,
						originalName: file.name,
						uploadedBy: 'admin',
					},
				});

				if (error) throw error;
				uploadResults.push({ name: file.name, status: 'success' });
			} catch (error) {
				console.error('Upload error:', error);
				uploadResults.push({ name: file.name, status: 'failed' });
			}
		}

		const successCount = uploadResults.filter((r) => r.status === 'success').length;
		const failCount = uploadResults.filter((r) => r.status === 'failed').length;

		toast({
			title: successCount > 0 ? '✓ Upload Complete' : '⚠ Upload Issue',
			description:
				failCount > 0
					? `${successCount} succeeded, ${failCount} failed`
					: `${successCount} files uploaded successfully`,
			variant: failCount > 0 ? 'destructive' : 'default',
		});

		await loadFiles();
		setUploading(false);

		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		setUploadDialogOpen(false);
	};

	// Drag and drop
	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true);
		} else if (e.type === 'dragleave') {
			setDragActive(false);
		}
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const dt = new DataTransfer();
			Array.from(e.dataTransfer.files).forEach((file) => dt.items.add(file));
			if (fileInputRef.current) {
				fileInputRef.current.files = dt.files;
				handleFileUpload({
					target: { files: dt.files },
				} as unknown as React.ChangeEvent<HTMLInputElement>);
			}
		}
	};

	// Delete file
	const handleDeleteFile = async (file: MediaFile) => {
		if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return;

		try {
			const filePath = currentFolder ? `${currentFolder}/${file.name}` : file.name;

			const { error } = await supabase.storage.from('cms-media').remove([filePath]);

			if (error) throw error;

			toast({ title: '✓ Deleted', description: `"${file.name}" removed` });
			await loadFiles();
		} catch (error) {
			console.error('Delete error:', error);
			toast({ title: '⚠ Error', description: 'Failed to delete file', variant: 'destructive' });
		}
	};

	// Copy URL
	const copyUrl = async (url: string) => {
		try {
			await navigator.clipboard.writeText(url);
			toast({ title: '✓ Copied', description: 'URL copied to clipboard' });
		} catch (error) {
			console.error('Clipboard error:', error);
			toast({ title: '⚠ Error', description: 'Failed to copy URL', variant: 'destructive' });
		}
	};

	// Download
	const downloadFile = (file: MediaFile) => {
		const link = document.createElement('a');
		link.href = file.url;
		link.download = file.name;
		link.click();
	};

	// Format size
	const formatFileSize = (bytes: number) => {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	};

	// Type detection
	const isImage = (type: string) => type.startsWith('image/');
	const isVideo = (type: string) => type.startsWith('video/');
	const getFileIcon = (type: string) => {
		if (isVideo(type)) return Video;
		if (isImage(type)) return ImageIcon;
		return File;
	};

	// Filter and sort
	const filteredFiles = files
		.filter((f) => {
			const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesTab =
				activeTab === 'all'
					? true
					: activeTab === 'images'
						? isImage(f.type)
						: activeTab === 'videos'
							? isVideo(f.type)
							: !isImage(f.type) && !isVideo(f.type);
			return matchesSearch && matchesTab;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.name.localeCompare(b.name);
				case 'size':
					return b.size - a.size;
				case 'type':
					return a.type.localeCompare(b.type);
				default:
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			}
		});

	const stats = {
		total: files.length,
		images: files.filter((f) => isImage(f.type)).length,
		videos: files.filter((f) => isVideo(f.type)).length,
		documents: files.filter((f) => !isImage(f.type) && !isVideo(f.type)).length,
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold">Media Library</h2>
					<p className="text-muted-foreground">
						{stats.total} files · {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))} total
					</p>
				</div>

				<div className="flex items-center gap-2">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							placeholder="Search files..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 w-48"
						/>
					</div>

					{/* Sort */}
					<Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
						<SelectTrigger className="w-32">
							<SortAsc className="w-4 h-4 mr-2" />
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="date">Date</SelectItem>
							<SelectItem value="name">Name</SelectItem>
							<SelectItem value="size">Size</SelectItem>
							<SelectItem value="type">Type</SelectItem>
						</SelectContent>
					</Select>

					{/* View mode */}
					<div className="flex border rounded-md">
						<Button
							variant={viewMode === 'grid' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setViewMode('grid')}
						>
							<Grid className="w-4 h-4" />
						</Button>
						<Button
							variant={viewMode === 'list' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setViewMode('list')}
						>
							<List className="w-4 h-4" />
						</Button>
						<Button
							variant={viewMode === 'slideshow' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => {
								setViewMode('slideshow');
								setSlideshowIndex(0);
							}}
						>
							<Film className="w-4 h-4" />
						</Button>
					</div>

					{/* Upload button */}
					<Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Upload className="w-4 h-4 mr-2" />
								Upload
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Upload Media Files</DialogTitle>
							</DialogHeader>
							<div
								className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
									dragActive ? 'border-primary bg-primary/5' : 'border-border'
								}`}
								onDragEnter={handleDrag}
								onDragLeave={handleDrag}
								onDragOver={handleDrag}
								onDrop={handleDrop}
							>
								<input
									ref={fileInputRef}
									type="file"
									multiple
									onChange={handleFileUpload}
									className="hidden"
									accept="image/*,video/*,.pdf,.doc,.docx,.txt,.svg,.png,.jpg,.jpeg,.webp,.mp4,.mov"
								/>
								<ImagePlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
								<p className="text-lg font-medium mb-2">Drag & drop files here</p>
								<p className="text-muted-foreground text-sm mb-4">or click to browse</p>
								<Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
									{uploading ? 'Uploading...' : 'Choose Files'}
								</Button>
								<p className="text-xs text-muted-foreground mt-4">
									Supports: Images, Videos, PDF, DOC, SVG, PNG, JPG, WebP, MP4, MOV
								</p>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="all">All ({stats.total})</TabsTrigger>
					<TabsTrigger value="images">Images ({stats.images})</TabsTrigger>
					<TabsTrigger value="videos">Videos ({stats.videos})</TabsTrigger>
					<TabsTrigger value="documents">Documents ({stats.documents})</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* File Grid */}
			{viewMode === 'grid' && (
				<div
					className={`border-2 border-dashed rounded-lg p-4 min-h-64 transition-colors ${
						dragActive ? 'border-primary bg-primary/5' : 'border-transparent'
					}`}
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}
				>
					{filteredFiles.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16">
							<FolderOpen className="w-16 h-16 text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No files found</h3>
							<p className="text-muted-foreground mb-4">
								{searchQuery
									? 'Try a different search term'
									: 'Upload your first files to get started'}
							</p>
							<Button onClick={() => setUploadDialogOpen(true)}>
								<Upload className="w-4 h-4 mr-2" />
								Upload Files
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
							<AnimatePresence>
								{filteredFiles.map((file, idx) => (
									// biome-ignore lint/style/useBlockStatements: keeping concise callback body for readability.
									<motion.div
										key={file.id}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.9 }}
										transition={{ delay: idx * 0.02 }}
									>
										<Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all hover:border-primary/50">
											<CardContent className="p-0">
												<div
													className="aspect-square bg-muted relative flex items-center justify-center"
													onClick={() => {
														setSelectedFile(file);
														setPreviewOpen(true);
													}}
												>
													{(() => {
														const FileIcon = getFileIcon(file.type);

														if (isImage(file.type)) {
															return (
																<img
																	src={file.url}
																	alt={file.name}
																	className="w-full h-full object-cover"
																	loading="lazy"
																/>
															);
														}

														if (isVideo(file.type)) {
															return (
																<>
																	<video src={file.url} className="w-full h-full object-cover" />
																	<div className="absolute inset-0 flex items-center justify-center bg-black/30">
																		<Play className="w-8 h-8 text-white" />
																	</div>
																</>
															);
														}

														return <FileIcon className="w-10 h-10 text-muted-foreground" />;
													})()}

													{/* Hover overlay */}
													<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
														<Button
															size="sm"
															variant="secondary"
															onClick={(e) => {
																e.stopPropagation();
																setSelectedFile(file);
																setPreviewOpen(true);
															}}
														>
															<Eye className="w-4 h-4" />
														</Button>
														<Button
															size="sm"
															variant="secondary"
															onClick={(e) => {
																e.stopPropagation();
																copyUrl(file.url);
															}}
														>
															<Copy className="w-4 h-4" />
														</Button>
														<Button
															size="sm"
															variant="destructive"
															onClick={(e) => {
																e.stopPropagation();
																handleDeleteFile(file);
															}}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													</div>

													{/* Type badge */}
													<Badge className="absolute top-2 left-2 text-[10px]">
														{isVideo(file.type) ? 'VIDEO' : isImage(file.type) ? 'IMG' : 'DOC'}
													</Badge>
												</div>

												<div className="p-2">
													<p className="text-xs font-medium truncate">{file.name}</p>
													<p className="text-[10px] text-muted-foreground">
														{formatFileSize(file.size)}
													</p>
												</div>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					)}
				</div>
			)}

			{/* List view */}
			{viewMode === 'list' && (
				<Card>
					<ScrollArea className="h-[500px]">
						<div className="divide-y">
							{filteredFiles.map((file) => (
								<div
									key={file.id}
									className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
									onClick={() => {
										setSelectedFile(file);
										setPreviewOpen(true);
									}}
								>
									{(() => {
										const FileIcon = getFileIcon(file.type);

										return (
											<div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
												{isImage(file.type) ? (
													<img
														src={file.url}
														alt=""
														className="w-full h-full object-cover rounded"
													/>
												) : (
													<FileIcon className="w-5 h-5 text-muted-foreground" />
												)}
											</div>
										);
									})()}
									<div className="flex-1 min-w-0">
										<p className="font-medium truncate">{file.name}</p>
										<p className="text-sm text-muted-foreground">{file.type}</p>
									</div>
									<div className="text-sm text-muted-foreground">{formatFileSize(file.size)}</div>
									<div className="flex gap-1">
										<Button
											size="sm"
											variant="ghost"
											onClick={(e) => {
												e.stopPropagation();
												copyUrl(file.url);
											}}
										>
											<Copy className="w-4 h-4" />
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onClick={(e) => {
												e.stopPropagation();
												downloadFile(file);
											}}
										>
											<Download className="w-4 h-4" />
										</Button>
										<Button
											size="sm"
											variant="ghost"
											className="text-destructive"
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteFile(file);
											}}
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				</Card>
			)}

			{/* Slideshow view */}
			{viewMode === 'slideshow' && filteredFiles.length > 0 && (
				<Card className="overflow-hidden">
					<div className="relative aspect-video bg-black">
						<AnimatePresence mode="wait">
							<motion.div
								key={slideshowIndex}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.5 }}
								className="absolute inset-0 flex items-center justify-center"
							>
								{(() => {
									const file = filteredFiles[slideshowIndex];
									const FileIcon = getFileIcon(file.type);

									if (isImage(file.type)) {
										return (
											<img
												src={file.url}
												alt={file.name}
												className="max-w-full max-h-full object-contain"
											/>
										);
									}

									if (isVideo(file.type)) {
										return (
											<video
												src={file.url}
												controls
												autoPlay={isPlaying}
												className="max-w-full max-h-full"
											/>
										);
									}

									return <FileIcon className="w-20 h-20 text-white" />;
								})()}
							</motion.div>
						</AnimatePresence>

						{/* Controls */}
						<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
							<p className="text-white text-center font-medium">
								{filteredFiles[slideshowIndex].name}
							</p>
						</div>

						{/* Navigation */}
						<Button
							variant="secondary"
							size="icon"
							className="absolute left-4 top-1/2 -translate-y-1/2"
							onClick={() =>
								setSlideshowIndex(
									(slideshowIndex - 1 + filteredFiles.length) % filteredFiles.length
								)
							}
						>
							<Play className="w-4 h-4 rotate-180" />
						</Button>
						<Button
							variant="secondary"
							size="icon"
							className="absolute right-4 top-1/2 -translate-y-1/2"
							onClick={() => setSlideshowIndex((slideshowIndex + 1) % filteredFiles.length)}
						>
							<Play className="w-4 h-4" />
						</Button>

						{/* Dots */}
						<div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1">
							{filteredFiles.map((_, idx) => (
								<button
									key={idx}
									onClick={() => setSlideshowIndex(idx)}
									className={`w-2 h-2 rounded-full transition-colors ${
										idx === slideshowIndex ? 'bg-primary' : 'bg-white/50'
									}`}
								/>
							))}
						</div>
					</div>
				</Card>
			)}

			{/* Preview Dialog */}
			<Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{selectedFile &&
								(() => {
									const FileIcon = getFileIcon(selectedFile.type);

									return <FileIcon className="w-5 h-5" />;
								})()}
							{selectedFile?.name}
						</DialogTitle>
						<DialogDescription>
							Preview and manage media file details
						</DialogDescription>
					</DialogHeader>
					{selectedFile && (
						<div className="space-y-4">
							{/* Preview */}
							<div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center max-h-96">
								{isImage(selectedFile.type) ? (
									<img
										src={selectedFile.url}
										alt={selectedFile.name}
										className="max-w-full max-h-96 object-contain"
									/>
								) : isVideo(selectedFile.type) ? (
									<video src={selectedFile.url} controls className="max-w-full max-h-96" />
								) : (
									<div className="p-16 text-center">
										{(() => {
											const FileIcon = getFileIcon(selectedFile.type);

											return <FileIcon className="w-20 h-20 mx-auto text-muted-foreground mb-4" />;
										})()}
										<p className="text-muted-foreground">Preview not available</p>
									</div>
								)}
							</div>

							{/* Metadata */}
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
								<div>
									<Label className="text-muted-foreground">Type</Label>
									<p className="font-medium">{selectedFile.type}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Size</Label>
									<p className="font-medium">{formatFileSize(selectedFile.size)}</p>
								</div>
								<div>
									<Label className="text-muted-foreground">Uploaded</Label>
									<p className="font-medium">
										{new Date(selectedFile.created_at).toLocaleDateString()}
									</p>
								</div>
								<div>
									<Label className="text-muted-foreground">URL</Label>
									<p className="font-medium text-xs truncate">{selectedFile.url}</p>
								</div>
							</div>

							{/* Actions */}
							<div className="flex gap-2">
								<Button
									onClick={() => copyUrl(selectedFile.url)}
									variant="outline"
									className="flex-1"
								>
									<Copy className="w-4 h-4 mr-2" />
									Copy URL
								</Button>
								<Button
									onClick={() => downloadFile(selectedFile)}
									variant="outline"
									className="flex-1"
								>
									<Download className="w-4 h-4 mr-2" />
									Download
								</Button>
								<Button
									onClick={() => handleDeleteFile(selectedFile)}
									variant="destructive"
									className="flex-1"
								>
									<Trash2 className="w-4 h-4 mr-2" />
									Delete
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
