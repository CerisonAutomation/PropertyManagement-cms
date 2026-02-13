// Advanced Field Renderer - Combining patterns from Strapi, Directus, Payload, and Sanity

import { Badge } from '@/components/ui/badge';
import { BlocksEditor } from '@/components/ui/blocks-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPicker } from '@/components/ui/color-picker';
import { ComponentRenderer } from '@/components/ui/component-renderer';
import { DatePicker } from '@/components/ui/date-picker';
import { FileUpload } from '@/components/ui/file-upload';
import { GeoInput } from '@/components/ui/geo-input';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { JSONEditor } from '@/components/ui/json-editor';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RelationSelect } from '@/components/ui/relation-select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { SlugInput } from '@/components/ui/slug-input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { UUIDInput } from '@/components/ui/uuid-input';
import React from 'react';

import type { FieldDefinition } from '@/types/cms';

interface FieldRendererProps {
	field: FieldDefinition;
	value: any;
	onChange: (value: any) => void;
	error?: string;
	disabled?: boolean;
	readonly?: boolean;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
	field,
	value,
	onChange,
	error,
	disabled = false,
	readonly = false,
}) => {
	const renderField = () => {
		switch (field.type) {
			case 'text':
				return (
					<Input
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.options?.placeholder}
						disabled={disabled}
						readOnly={readonly}
						className={error ? 'border-destructive' : ''}
					/>
				);

			case 'textarea':
				return (
					<Textarea
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.options?.placeholder}
						disabled={disabled}
						readOnly={readonly}
						rows={field.options?.max === 255 ? 3 : 6}
						className={error ? 'border-destructive' : ''}
					/>
				);

			case 'richtext':
				return (
					<RichTextEditor
						value={value || ''}
						onChange={onChange}
						disabled={disabled}
						readonly={readonly}
					/>
				);

			case 'number':
				return (
					<Input
						type="number"
						value={value || ''}
						onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
						placeholder={field.options?.placeholder}
						disabled={disabled}
						readOnly={readonly}
						className={error ? 'border-destructive' : ''}
					/>
				);

			case 'date':
				return (
					<DatePicker
						value={value ? new Date(value) : null}
						onChange={(date) => onChange(date?.toISOString().split('T')[0])}
						disabled={disabled}
						readonly={readonly}
					/>
				);

			case 'datetime':
				return (
					<DatePicker
						value={value ? new Date(value) : null}
						onChange={(date) => onChange(date?.toISOString())}
						showTime
						disabled={disabled}
						readonly={readonly}
					/>
				);

			case 'boolean':
				return (
					<Switch
						checked={value || false}
						onCheckedChange={onChange}
						disabled={disabled}
						readOnly={readonly}
					/>
				);

			case 'checkbox':
				return (
					<Checkbox
						checked={value || false}
						onCheckedChange={onChange}
						disabled={disabled}
						readOnly={readonly}
					/>
				);

			case 'email':
				return (
					<Input
						type="email"
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.options?.placeholder}
						disabled={disabled}
						readOnly={readonly}
						className={error ? 'border-destructive' : ''}
					/>
				);

			case 'url':
				return (
					<Input
						type="url"
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.options?.placeholder || 'https://'}
						disabled={disabled}
						readOnly={readonly}
						className={error ? 'border-destructive' : ''}
					/>
				);

			case 'password':
				return (
					<Input
						type="password"
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.options?.placeholder}
						disabled={disabled}
						readOnly={readonly}
						className={error ? 'border-destructive' : ''}
					/>
				);

			case 'color':
				return (
					<ColorPicker
						value={value || ''}
						onChange={onChange}
						disabled={disabled}
						readonly={readonly}
					/>
				);

			case 'file':
				return (
					<FileUpload value={value} onChange={onChange} disabled={disabled} readonly={readonly} />
				);

			case 'image':
				return (
					<ImageUpload value={value} onChange={onChange} disabled={disabled} readonly={readonly} />
				);

			case 'select':
				return (
					<Select
						value={value || ''}
						onValueChange={onChange}
						disabled={disabled}
						readOnly={readonly}
					>
						<SelectTrigger className={error ? 'border-destructive' : ''}>
							<SelectValue placeholder={field.options?.placeholder || 'Select an option'} />
						</SelectTrigger>
						<SelectContent>
							{field.options?.choices?.map((choice) => (
								<SelectItem key={choice.value} value={choice.value}>
									<div className="flex items-center gap-2">
										{choice.icon && <span>{choice.icon}</span>}
										{choice.label}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);

			case 'multiselect':
				return (
					<Select
						value={value?.[0] || ''}
						onValueChange={(newValue) => {
							const currentValues = value || [];
							if (currentValues.includes(newValue)) {
								onChange(currentValues.filter((v: string) => v !== newValue));
							} else {
								onChange([...currentValues, newValue]);
							}
						}}
						disabled={disabled}
						readOnly={readonly}
					>
						<SelectTrigger className={error ? 'border-destructive' : ''}>
							<SelectValue placeholder={field.options?.placeholder || 'Select options'} />
						</SelectTrigger>
						<SelectContent>
							{field.options?.choices?.map((choice) => (
								<SelectItem key={choice.value} value={choice.value}>
									<div className="flex items-center gap-2">
										<Checkbox checked={value?.includes(choice.value)} readOnly />
										{choice.icon && <span>{choice.icon}</span>}
										{choice.label}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				);

			case 'radio':
				return (
					<RadioGroup
						value={value || ''}
						onValueChange={onChange}
						disabled={disabled}
						readOnly={readonly}
					>
						{field.options?.choices?.map((choice) => (
							<div key={choice.value} className="flex items-center space-x-2">
								<RadioGroupItem value={choice.value} id={choice.value} />
								<Label htmlFor={choice.value} className="flex items-center gap-2">
									{choice.icon && <span>{choice.icon}</span>}
									{choice.label}
								</Label>
							</div>
						))}
					</RadioGroup>
				);

			case 'json':
				return (
					<JSONEditor
						value={value || {}}
						onChange={onChange}
						disabled={disabled}
						readonly={readonly}
					/>
				);

			case 'slug':
				return (
					<SlugInput
						value={value || ''}
						onChange={onChange}
						sourceField={field.options?.template}
						disabled={disabled}
						readonly={readonly}
					/>
				);

			case 'uuid':
				return (
					<UUIDInput
						value={value || ''}
						onChange={onChange}
						disabled={disabled}
						readonly={readonly}
					/>
				);

			case 'relation':
				return (
					<RelationSelect
						value={value}
						onChange={onChange}
						collection={field.options?.template}
						interface={field.interface}
						disabled={disabled}
						readonly={readonly}
					/>
				);

			case 'component':
				return (
					<ComponentRenderer
						value={value || {}}
						onChange={onChange}
						componentType={field.options?.template}
						disabled={disabled}
						readonly={readonly}
					/>
				);

			case 'blocks':
				return (
					<BlocksEditor
						value={value || []}
						onChange={onChange}
						allowedBlocks={field.options?.choices?.map((c: any) => c.value) || []}
						disabled={disabled}
						readonly={readonly}
					/>
				);

			case 'geometry':
				return (
					<GeoInput
						value={value || {}}
						onChange={onChange}
						disabled={disabled}
						readonly={readonly}
					/>
				);

			default:
				return (
					<Input
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={`Unknown field type: ${field.type}`}
						disabled={disabled}
						readOnly={readonly}
						className="border-destructive"
					/>
				);
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2">
				<Label htmlFor={field.name} className={field.required ? 'font-medium' : ''}>
					{field.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
					{field.required && <span className="text-destructive ml-1">*</span>}
				</Label>
				{field.unique && (
					<Badge variant="outline" className="text-xs">
						Unique
					</Badge>
				)}
			</div>

			{renderField()}

			{field.options?.help && <p className="text-sm text-muted-foreground">{field.options.help}</p>}

			{error && <p className="text-sm text-destructive">{error}</p>}
		</div>
	);
};

// Advanced Field Components

export const FieldGroup: React.FC<{
	title: string;
	description?: string;
	children: React.ReactNode;
	collapsible?: boolean;
}> = ({ title, description, children, collapsible = false }) => {
	const [isOpen, setIsOpen] = React.useState(true);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-lg">{title}</CardTitle>
						{description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
					</div>
					{collapsible && (
						<Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
							{isOpen ? 'Collapse' : 'Expand'}
						</Button>
					)}
				</div>
			</CardHeader>
			{isOpen && <CardContent className="space-y-4">{children}</CardContent>}
		</Card>
	);
};

export const FieldTabs: React.FC<{
	tabs: Array<{
		label: string;
		value: string;
		content: React.ReactNode;
	}>;
	defaultValue?: string;
}> = ({ tabs, defaultValue }) => {
	const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.value);

	return (
		<div className="space-y-4">
			<div className="flex space-x-1 border-b">
				{tabs.map((tab) => (
					<button
						key={tab.value}
						onClick={() => setActiveTab(tab.value)}
						className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
							activeTab === tab.value
								? 'border-primary text-primary'
								: 'border-transparent text-muted-foreground hover:text-foreground'
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			<div className="mt-4">{tabs.find((tab) => tab.value === activeTab)?.content}</div>
		</div>
	);
};

export const FieldMatrix: React.FC<{
	field: FieldDefinition;
	value: any[];
	onChange: (value: any[]) => void;
	disabled?: boolean;
}> = ({ field, value = [], onChange, disabled }) => {
	const addItem = () => {
		const newItem: any = {};
		// Initialize with default values based on field configuration
		onChange([...value, newItem]);
	};

	const removeItem = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	const updateItem = (index: number, itemValue: any) => {
		const newValue = [...value];
		newValue[index] = itemValue;
		onChange(newValue);
	};

	return (
		<div className="space-y-4">
			{value.map((item, index) => (
				<Card key={index}>
					<CardContent className="p-4">
						<div className="flex items-center justify-between mb-4">
							<h4 className="font-medium">Item {index + 1}</h4>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => removeItem(index)}
								disabled={disabled}
							>
								Remove
							</Button>
						</div>

						{/* Render matrix fields here based on configuration */}
						{/* This would need to be implemented based on the matrix field configuration */}
					</CardContent>
				</Card>
			))}

			<Button onClick={addItem} disabled={disabled} variant="outline" className="w-full">
				Add Item
			</Button>
		</div>
	);
};

export default FieldRenderer;
