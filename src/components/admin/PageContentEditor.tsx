import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { CmsPage } from '@/hooks/use-cms';
import { Code, Edit3, Eye, Layout, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PageContentEditorProps {
	page: CmsPage;
	onUpdate: (content: any) => void;
}

interface ContentBlock {
	id: string;
	type: 'hero' | 'text' | 'image' | 'features' | 'stats' | 'cta' | 'testimonials';
	content: any;
}

export default function PageContentEditor({ page, onUpdate }: PageContentEditorProps) {
	const [content, setContent] = useState<any>(page.content || {});
	const [activeTab, setActiveTab] = useState('visual');
	const [editingBlock, setEditingBlock] = useState<string | null>(null);

	const blockTypes = [
		{ value: 'hero', label: 'Hero Section', icon: Layout },
		{ value: 'text', label: 'Text Block', icon: Edit3 },
		{ value: 'image', label: 'Image', icon: Eye },
		{ value: 'features', label: 'Features Grid', icon: Layout },
		{ value: 'stats', label: 'Statistics', icon: Code },
		{ value: 'cta', label: 'Call to Action', icon: Edit3 },
		{ value: 'testimonials', label: 'Testimonials', icon: Edit3 },
	];

	const addBlock = (type: string) => {
		const newBlock: ContentBlock = {
			id: `block_${Date.now()}`,
			type: type as any,
			content: getDefaultContent(type),
		};

		const updatedContent = {
			...content,
			blocks: [...(content.blocks || []), newBlock],
		};

		setContent(updatedContent);
		onUpdate(updatedContent);
	};

	const getDefaultContent = (type: string): any => {
		switch (type) {
			case 'hero':
				return {
					headline: 'Your Headline Here',
					subheadline: 'Compelling subheadline',
					description: 'Describe your value proposition',
					ctaText: 'Get Started',
					ctaLink: '#contact',
					backgroundImage: '',
				};
			case 'text':
				return {
					title: 'Section Title',
					body: '<p>Your content goes here...</p>',
				};
			case 'image':
				return {
					url: '',
					alt: 'Image description',
					caption: '',
				};
			case 'features':
				return {
					title: 'Our Features',
					subtitle: 'What we offer',
					items: [
						{ title: 'Feature 1', description: 'Description', icon: '🌟' },
						{ title: 'Feature 2', description: 'Description', icon: '🚀' },
						{ title: 'Feature 3', description: 'Description', icon: '💎' },
					],
				};
			case 'stats':
				return {
					title: 'By the Numbers',
					items: [
						{ value: '100+', label: 'Clients' },
						{ value: '99%', label: 'Satisfaction' },
						{ value: '24/7', label: 'Support' },
					],
				};
			case 'cta':
				return {
					title: 'Ready to Get Started?',
					description: 'Join us today',
					buttonText: 'Contact Us',
					buttonLink: '#contact',
				};
			case 'testimonials':
				return {
					title: 'What Our Clients Say',
					items: [
						{ name: 'John Doe', text: 'Great service!', role: 'CEO' },
						{ name: 'Jane Smith', text: 'Highly recommend', role: 'Manager' },
					],
				};
			default:
				return {};
		}
	};

	const updateBlock = (blockId: string, blockContent: any) => {
		const updatedContent = {
			...content,
			blocks: content.blocks?.map((block: ContentBlock) =>
				block.id === blockId ? { ...block, content: blockContent } : block
			),
		};

		setContent(updatedContent);
		onUpdate(updatedContent);
	};

	const deleteBlock = (blockId: string) => {
		const updatedContent = {
			...content,
			blocks: content.blocks?.filter((block: ContentBlock) => block.id !== blockId),
		};

		setContent(updatedContent);
		onUpdate(updatedContent);
	};

	const moveBlock = (blockId: string, direction: 'up' | 'down') => {
		const blocks = [...(content.blocks || [])];
		const index = blocks.findIndex((block: ContentBlock) => block.id === blockId);

		if (direction === 'up' && index > 0) {
			[blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
		} else if (direction === 'down' && index < blocks.length - 1) {
			[blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
		}

		const updatedContent = { ...content, blocks };
		setContent(updatedContent);
		onUpdate(updatedContent);
	};

	const renderBlockEditor = (block: ContentBlock) => {
		const isEditing = editingBlock === block.id;

		return (
			<Card key={block.id} className="mb-4">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Badge variant="outline">{block.type}</Badge>
							<CardTitle className="text-sm">{getBlockTitle(block.type, block.content)}</CardTitle>
						</div>
						<div className="flex items-center gap-1">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => moveBlock(block.id, 'up')}
								disabled={content.blocks?.[0]?.id === block.id}
							>
								↑
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => moveBlock(block.id, 'down')}
								disabled={content.blocks?.[content.blocks.length - 1]?.id === block.id}
							>
								↓
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setEditingBlock(isEditing ? null : block.id)}
							>
								{isEditing ? 'Save' : 'Edit'}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => deleteBlock(block.id)}
								className="text-destructive"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</CardHeader>
				{isEditing && <CardContent className="pt-0">{renderBlockForm(block)}</CardContent>}
			</Card>
		);
	};

	const renderBlockForm = (block: ContentBlock) => {
		switch (block.type) {
			case 'hero':
				return (
					<div className="space-y-4">
						<div>
							<Label>Headline</Label>
							<Input
								value={block.content.headline || ''}
								onChange={(e) =>
									updateBlock(block.id, { ...block.content, headline: e.target.value })
								}
								placeholder="Main headline"
							/>
						</div>
						<div>
							<Label>Subheadline</Label>
							<Input
								value={block.content.subheadline || ''}
								onChange={(e) =>
									updateBlock(block.id, { ...block.content, subheadline: e.target.value })
								}
								placeholder="Subheadline"
							/>
						</div>
						<div>
							<Label>Description</Label>
							<Textarea
								value={block.content.description || ''}
								onChange={(e) =>
									updateBlock(block.id, { ...block.content, description: e.target.value })
								}
								placeholder="Description"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label>CTA Text</Label>
								<Input
									value={block.content.ctaText || ''}
									onChange={(e) =>
										updateBlock(block.id, { ...block.content, ctaText: e.target.value })
									}
									placeholder="Button text"
								/>
							</div>
							<div>
								<Label>CTA Link</Label>
								<Input
									value={block.content.ctaLink || ''}
									onChange={(e) =>
										updateBlock(block.id, { ...block.content, ctaLink: e.target.value })
									}
									placeholder="#contact"
								/>
							</div>
						</div>
					</div>
				);

			case 'text':
				return (
					<div className="space-y-4">
						<div>
							<Label>Title</Label>
							<Input
								value={block.content.title || ''}
								onChange={(e) => updateBlock(block.id, { ...block.content, title: e.target.value })}
								placeholder="Section title"
							/>
						</div>
						<div>
							<Label>Content (HTML)</Label>
							<Textarea
								value={block.content.body || ''}
								onChange={(e) => updateBlock(block.id, { ...block.content, body: e.target.value })}
								placeholder="<p>Your content here...</p>"
								rows={6}
							/>
						</div>
					</div>
				);

			case 'features':
				return (
					<div className="space-y-4">
						<div>
							<Label>Title</Label>
							<Input
								value={block.content.title || ''}
								onChange={(e) => updateBlock(block.id, { ...block.content, title: e.target.value })}
							/>
						</div>
						<div>
							<Label>Subtitle</Label>
							<Input
								value={block.content.subtitle || ''}
								onChange={(e) =>
									updateBlock(block.id, { ...block.content, subtitle: e.target.value })
								}
							/>
						</div>
						<div>
							<Label>Features</Label>
							{block.content.items?.map((item: any, index: number) => (
								<div key={index} className="grid grid-cols-3 gap-2 mb-2">
									<Input
										value={item.icon || ''}
										onChange={(e) => {
											const newItems = [...block.content.items];
											newItems[index].icon = e.target.value;
											updateBlock(block.id, { ...block.content, items: newItems });
										}}
										placeholder="Icon"
									/>
									<Input
										value={item.title || ''}
										onChange={(e) => {
											const newItems = [...block.content.items];
											newItems[index].title = e.target.value;
											updateBlock(block.id, { ...block.content, items: newItems });
										}}
										placeholder="Title"
									/>
									<Input
										value={item.description || ''}
										onChange={(e) => {
											const newItems = [...block.content.items];
											newItems[index].description = e.target.value;
											updateBlock(block.id, { ...block.content, items: newItems });
										}}
										placeholder="Description"
									/>
								</div>
							))}
						</div>
					</div>
				);

			default:
				return (
					<div>
						<Label>Raw JSON</Label>
						<Textarea
							value={JSON.stringify(block.content, null, 2)}
							onChange={(e) => {
								try {
									const parsed = JSON.parse(e.target.value);
									updateBlock(block.id, parsed);
								} catch (err) {
									// Invalid JSON, don't update
								}
							}}
							rows={10}
							className="font-mono text-sm"
						/>
					</div>
				);
		}
	};

	const getBlockTitle = (type: string, content: any): string => {
		switch (type) {
			case 'hero':
				return content.headline || 'Hero Section';
			case 'text':
				return content.title || 'Text Block';
			case 'features':
				return content.title || 'Features';
			case 'stats':
				return content.title || 'Statistics';
			case 'cta':
				return content.title || 'Call to Action';
			case 'testimonials':
				return content.title || 'Testimonials';
			default:
				return `${type} Block`;
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Page Content</h3>
					<p className="text-sm text-muted-foreground">Build your page using content blocks</p>
				</div>
				<div className="flex items-center gap-2">
					<Select onValueChange={addBlock}>
						<SelectTrigger className="w-48">
							<SelectValue placeholder="Add Block" />
						</SelectTrigger>
						<SelectContent>
							{blockTypes.map((type) => (
								<SelectItem key={type.value} value={type.value}>
									<div className="flex items-center gap-2">
										<type.icon className="w-4 h-4" />
										{type.label}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="visual">Visual Editor</TabsTrigger>
					<TabsTrigger value="code">Code Editor</TabsTrigger>
				</TabsList>

				<TabsContent value="visual" className="space-y-4">
					{content.blocks?.length > 0 ? (
						content.blocks.map((block: ContentBlock) => renderBlockEditor(block))
					) : (
						<Card>
							<CardContent className="p-12 text-center">
								<Layout className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
								<h3 className="text-lg font-semibold mb-2">No content blocks yet</h3>
								<p className="text-muted-foreground mb-4">
									Start building your page by adding content blocks
								</p>
								<Select onValueChange={addBlock}>
									<SelectTrigger className="w-48 mx-auto">
										<SelectValue placeholder="Add your first block" />
									</SelectTrigger>
									<SelectContent>
										{blockTypes.map((type) => (
											<SelectItem key={type.value} value={type.value}>
												<div className="flex items-center gap-2">
													<type.icon className="w-4 h-4" />
													{type.label}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="code">
					<Card>
						<CardContent className="pt-6">
							<Label>Raw JSON Content</Label>
							<Textarea
								value={JSON.stringify(content, null, 2)}
								onChange={(e) => {
									try {
										const parsed = JSON.parse(e.target.value);
										setContent(parsed);
										onUpdate(parsed);
									} catch (err) {
										// Invalid JSON, don't update
									}
								}}
								rows={20}
								className="font-mono text-sm mt-2"
							/>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
