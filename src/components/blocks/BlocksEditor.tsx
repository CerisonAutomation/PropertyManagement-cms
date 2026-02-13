// Advanced Blocks Editor - Combining Sanity Portable Text and Payload Blocks patterns
// Enhanced with TypeScript 5.8 features and enterprise-grade functionality

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
import { Copy, Edit3, GripVertical, MoveDown, MoveUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import type { BlockArrayField, BlockDefinition } from '@/types/cms';

// Enhanced TypeScript interfaces with better type safety
interface BlocksEditorProps {
	value: BlockArrayField[];
	onChange: (blocks: BlockArrayField[]) => void;
	allowedBlocks: readonly string[];
	disabled?: boolean;
	readonly?: boolean;
	maxBlocks?: number;
	enableValidation?: boolean;
	enableHistory?: boolean;
	enableCollaboration?: boolean;
	theme?: 'light' | 'dark' | 'auto';
	locale?: string;
}

interface BlockInstance {
	id: string;
	type: string;
	data: Record<string, any>;
	isValid?: boolean;
	validationErrors?: Record<string, string[]>;
	metadata?: {
		createdAt: string;
		updatedAt: string;
		createdBy?: string;
		version: number;
	};
}

interface BlockHistoryEntry {
	id: string;
	blocks: BlockInstance[];
	timestamp: string;
	action: 'create' | 'update' | 'delete' | 'move' | 'duplicate';
	description: string;
}

interface BlockValidationSchema {
	[key: string]: z.ZodSchema<any>;
}

// Enhanced block definitions with validation and advanced features
const DEFAULT_BLOCKS: Record<string, BlockDefinition> = {
	hero: {
		name: 'hero',
		title: 'Hero Section',
		description: 'Main hero section with headline and CTA',
		icon: '🌟',
		category: 'layout',
		fields: [
			{
				name: 'headline',
				type: 'text',
				required: true,
				validation: z.string().min(1).max(100),
				placeholder: 'Enter your main headline',
			},
			{
				name: 'subheadline',
				type: 'text',
				validation: z.string().max(200).optional(),
				placeholder: 'Enter a subheadline',
			},
			{
				name: 'description',
				type: 'textarea',
				validation: z.string().max(500).optional(),
				placeholder: 'Describe your offering',
			},
			{
				name: 'cta_text',
				type: 'text',
				validation: z.string().min(1).max(50),
				placeholder: 'Button text',
			},
			{
				name: 'cta_link',
				type: 'url',
				required: true,
				validation: z.string().url(),
				placeholder: 'https://example.com',
			},
			{
				name: 'background_image',
				type: 'image',
				validation: z.string().url().optional(),
			},
			{
				name: 'show_particles',
				type: 'boolean',
				defaultValue: false,
			},
		],
	},
	textBlock: {
		name: 'textBlock',
		title: 'Text Block',
		description: 'Rich text content block with advanced formatting',
		icon: '📝',
		category: 'content',
		fields: [
			{
				name: 'title',
				type: 'text',
				validation: z.string().max(200).optional(),
				placeholder: 'Optional title',
			},
			{
				name: 'content',
				type: 'richtext',
				required: true,
				validation: z.string().min(1),
				placeholder: 'Enter your content...',
			},
			{
				name: 'alignment',
				type: 'select',
				options: {
					choices: [
						{ value: 'left', label: 'Left' },
						{ value: 'center', label: 'Center' },
						{ value: 'right', label: 'Right' },
						{ value: 'justify', label: 'Justify' },
					],
				},
				defaultValue: 'left',
			},
			{
				name: 'font_size',
				type: 'select',
				options: {
					choices: [
						{ value: 'small', label: 'Small' },
						{ value: 'medium', label: 'Medium' },
						{ value: 'large', label: 'Large' },
						{ value: 'xlarge', label: 'Extra Large' },
					],
				},
				defaultValue: 'medium',
			},
			{
				name: 'drop_cap',
				type: 'boolean',
				defaultValue: false,
			},
		],
	},
	imageBlock: {
		name: 'imageBlock',
		title: 'Image Block',
		description: 'Image with optional caption',
		icon: '🖼️',
		fields: [
			{ name: 'image', type: 'image', required: true },
			{ name: 'caption', type: 'text' },
			{ name: 'alt_text', type: 'text' },
			{
				name: 'width',
				type: 'select',
				options: {
					choices: [
						{ value: 'full', label: 'Full Width' },
						{ value: 'large', label: 'Large' },
						{ value: 'medium', label: 'Medium' },
						{ value: 'small', label: 'Small' },
					],
				},
			},
		],
	},
	features: {
		name: 'features',
		title: 'Features Grid',
		description: 'Grid of feature items',
		icon: '⚡',
		fields: [
			{ name: 'title', type: 'text' },
			{ name: 'items', type: 'component', options: { template: 'feature_item' } },
			{
				name: 'columns',
				type: 'select',
				options: {
					choices: [
						{ value: '2', label: '2 Columns' },
						{ value: '3', label: '3 Columns' },
						{ value: '4', label: '4 Columns' },
					],
				},
			},
		],
	},
	stats: {
		name: 'stats',
		title: 'Statistics',
		description: 'Statistics grid with numbers',
		icon: '📊',
		fields: [
			{ name: 'title', type: 'text' },
			{ name: 'items', type: 'component', options: { template: 'stat_item' } },
		],
	},
	cta: {
		name: 'cta',
		title: 'Call to Action',
		description: 'Call to action section',
		icon: '🎯',
		fields: [
			{ name: 'title', type: 'text', required: true },
			{ name: 'description', type: 'textarea' },
			{ name: 'button_text', type: 'text', required: true },
			{ name: 'button_link', type: 'url', required: true },
			{
				name: 'style',
				type: 'select',
				options: {
					choices: [
						{ value: 'primary', label: 'Primary' },
						{ value: 'secondary', label: 'Secondary' },
						{ value: 'gradient', label: 'Gradient' },
					],
				},
			},
		],
	},
	testimonials: {
		name: 'testimonials',
		title: 'Testimonials',
		description: 'Customer testimonials',
		icon: '💬',
		fields: [
			{ name: 'title', type: 'text' },
			{ name: 'items', type: 'component', options: { template: 'testimonial_item' } },
		],
	},
	gallery: {
		name: 'gallery',
		title: 'Image Gallery',
		description: 'Gallery with multiple images',
		icon: '🖼️',
		fields: [
			{ name: 'title', type: 'text' },
			{ name: 'images', type: 'component', options: { template: 'gallery_item' } },
			{
				name: 'layout',
				type: 'select',
				options: {
					choices: [
						{ value: 'grid', label: 'Grid' },
						{ value: 'masonry', label: 'Masonry' },
						{ value: 'carousel', label: 'Carousel' },
					],
				},
			},
		],
	},
};

export function BlocksEditor({
	value = [],
	onChange,
	allowedBlocks = Object.keys(DEFAULT_BLOCKS),
	disabled = false,
	readonly = false,
}: BlocksEditorProps) {
	const [blocks, setBlocks] = useState<BlockInstance[]>(() =>
		value.map((block, index) => ({
			id: block._key || `block_${index}`,
			type: block.blockType,
			data: block,
		}))
	);
	const [editingBlock, setEditingBlock] = useState<BlockInstance | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [selectedBlockType, setSelectedBlockType] = useState<string>('');

	const addBlock = (type: string) => {
		const blockDefinition = DEFAULT_BLOCKS[type];
		if (!blockDefinition) return;

		const newBlock: BlockInstance = {
			id: `block_${Date.now()}`,
			type,
			data: {
				_type: 'blocks',
				_key: `block_${Date.now()}`,
				blockType: type,
				...blockDefinition.fields.reduce(
					(acc, field) => {
						acc[field.name] =
							field.type === 'select' ? field.options?.choices?.[0]?.value || '' : '';
						return acc;
					},
					{} as Record<string, any>
				),
			},
		};

		const updatedBlocks = [...blocks, newBlock];
		setBlocks(updatedBlocks);
		onChange(updatedBlocks.map((b) => b.data as BlockArrayField));
	};

	const updateBlock = (blockId: string, data: Record<string, any>) => {
		const updatedBlocks = blocks.map((block) =>
			block.id === blockId ? { ...block, data: { ...block.data, ...data } } : block
		);
		setBlocks(updatedBlocks);
		onChange(updatedBlocks.map((b) => b.data as BlockArrayField));
	};

	const removeBlock = (blockId: string) => {
		const updatedBlocks = blocks.filter((block) => block.id !== blockId);
		setBlocks(updatedBlocks);
		onChange(updatedBlocks.map((b) => b.data as BlockArrayField));
	};

	const moveBlock = (blockId: string, direction: 'up' | 'down') => {
		const index = blocks.findIndex((block) => block.id === blockId);
		if (index === -1) return;

		const newBlocks = [...blocks];
		if (direction === 'up' && index > 0) {
			[newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]];
		} else if (direction === 'down' && index < blocks.length - 1) {
			[newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
		}

		setBlocks(newBlocks);
		onChange(newBlocks.map((b) => b.data));
	};

	const duplicateBlock = (blockId: string) => {
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;

		const newBlock: BlockInstance = {
			...block,
			id: `block_${Date.now()}`,
			data: {
				...block.data,
				_key: `block_${Date.now()}`,
			},
		};

		const updatedBlocks = [...blocks, newBlock];
		setBlocks(updatedBlocks);
		onChange(updatedBlocks.map((b) => b.data as BlockArrayField));
	};

	const openEditDialog = (block: BlockInstance) => {
		setEditingBlock(block);
		setIsEditDialogOpen(true);
	};

	const renderBlockPreview = (block: BlockInstance) => {
		const definition = DEFAULT_BLOCKS[block.type];
		if (!definition) return null;

		return (
			<div className="p-4 border rounded-lg bg-muted/50">
				<div className="flex items-center gap-2 mb-2">
					<span className="text-lg">{definition.icon}</span>
					<div className="flex-1">
						<h4 className="font-medium">{definition.title}</h4>
						<p className="text-sm text-muted-foreground">{definition.description}</p>
					</div>
				</div>

				<div className="space-y-2 text-sm">
					{definition.fields.map((field) => {
						const fieldValue = block.data[field.name];
						if (!fieldValue) return null;

						return (
							<div key={field.name}>
								<span className="font-medium">{field.name}:</span>{' '}
								<span className="text-muted-foreground">
									{typeof fieldValue === 'string' ? fieldValue : JSON.stringify(fieldValue)}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	const renderBlockEditor = (block: BlockInstance) => {
		const definition = DEFAULT_BLOCKS[block.type];
		if (!definition) return null;

		return (
			<div className="space-y-4">
				<div className="flex items-center gap-2">
					<span className="text-lg">{definition.icon}</span>
					<h3 className="text-lg font-semibold">{definition.title}</h3>
				</div>

				{definition.fields.map((field) => (
					<div key={field.name} className="space-y-2">
						<Label htmlFor={field.name}>
							{field.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
							{field.required && <span className="text-destructive ml-1">*</span>}
						</Label>

						{field.type === 'text' && (
							<Input
								id={field.name}
								value={block.data[field.name] || ''}
								onChange={(e) => updateBlock(block.id, { [field.name]: e.target.value })}
								disabled={disabled}
							/>
						)}

						{field.type === 'textarea' && (
							<Textarea
								id={field.name}
								value={block.data[field.name] || ''}
								onChange={(e) => updateBlock(block.id, { [field.name]: e.target.value })}
								disabled={disabled}
								rows={3}
							/>
						)}

						{field.type === 'url' && (
							<Input
								id={field.name}
								type="url"
								value={block.data[field.name] || ''}
								onChange={(e) => updateBlock(block.id, { [field.name]: e.target.value })}
								disabled={disabled}
							/>
						)}

						{field.type === 'select' && (
							<Select
								value={block.data[field.name] || ''}
								onValueChange={(value) => updateBlock(block.id, { [field.name]: value })}
								disabled={disabled}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{field.options?.choices?.map((choice: any) => (
										<SelectItem key={choice.value} value={choice.value}>
											{choice.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
				))}
			</div>
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Content Blocks</h3>
					<p className="text-sm text-muted-foreground">
						Build your page using content blocks ({blocks.length} blocks)
					</p>
				</div>

				<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
					<DialogTrigger asChild>
						<Button disabled={disabled || readonly}>
							<Plus className="w-4 h-4 mr-2" />
							Add Block
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Content Block</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<Select value={selectedBlockType} onValueChange={setSelectedBlockType}>
								<SelectTrigger>
									<SelectValue placeholder="Select a block type" />
								</SelectTrigger>
								<SelectContent>
									{allowedBlocks.map((type) => {
										const definition = DEFAULT_BLOCKS[type];
										if (!definition) return null;
										return (
											<SelectItem key={type} value={type}>
												<div className="flex items-center gap-2">
													<span>{definition.icon}</span>
													<div>
														<div className="font-medium">{definition.title}</div>
														<div className="text-sm text-muted-foreground">
															{definition.description}
														</div>
													</div>
												</div>
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>

							<Button
								onClick={() => {
									if (selectedBlockType) {
										addBlock(selectedBlockType);
										setSelectedBlockType('');
										setIsAddDialogOpen(false);
									}
								}}
								disabled={!selectedBlockType}
								className="w-full"
							>
								Add Block
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{blocks.length === 0 ? (
				<Card>
					<CardContent className="p-12 text-center">
						<div className="text-4xl mb-4">🧱</div>
						<h3 className="text-lg font-semibold mb-2">No content blocks yet</h3>
						<p className="text-muted-foreground mb-4">
							Start building your page by adding content blocks
						</p>
						<Button onClick={() => setIsAddDialogOpen(true)} disabled={disabled || readonly}>
							<Plus className="w-4 h-4 mr-2" />
							Add Your First Block
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{blocks.map((block, index) => {
						const definition = DEFAULT_BLOCKS[block.type];
						if (!definition) return null;

						return (
							<Card key={block.id} className="group">
								<CardContent className="p-4">
									<div className="flex items-start gap-4">
										<div className="flex flex-col gap-1 mt-1">
											<GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
											<Badge variant="outline" className="text-xs">
												{index + 1}
											</Badge>
										</div>

										<div className="flex-1">
											<div className="flex items-center gap-2 mb-3">
												<span className="text-lg">{definition.icon}</span>
												<h4 className="font-medium">{definition.title}</h4>
												<Badge variant="secondary" className="text-xs">
													{block.type}
												</Badge>
											</div>

											{renderBlockPreview(block)}
										</div>

										<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => moveBlock(block.id, 'up')}
												disabled={index === 0 || disabled || readonly}
											>
												<MoveUp className="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => moveBlock(block.id, 'down')}
												disabled={index === blocks.length - 1 || disabled || readonly}
											>
												<MoveDown className="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => duplicateBlock(block.id)}
												disabled={disabled || readonly}
											>
												<Copy className="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => openEditDialog(block)}
												disabled={disabled || readonly}
											>
												<Edit3 className="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => removeBlock(block.id)}
												disabled={disabled || readonly}
												className="text-destructive"
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Edit Block Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							Edit Block: {editingBlock && DEFAULT_BLOCKS[editingBlock.type]?.title}
						</DialogTitle>
					</DialogHeader>
					{editingBlock && renderBlockEditor(editingBlock)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default BlocksEditor;
