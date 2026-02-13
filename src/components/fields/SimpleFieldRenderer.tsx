// Simplified Field Renderer - Core patterns from major CMS platforms

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type React from 'react';

import type { FieldDefinition } from '@/types/cms';

interface SimpleFieldRendererProps {
	field: FieldDefinition;
	value: any;
	onChange: (value: any) => void;
	error?: string;
	disabled?: boolean;
	readonly?: boolean;
}

export const SimpleFieldRenderer: React.FC<SimpleFieldRendererProps> = ({
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
						disabled={disabled || readonly}
						className={error ? 'border-destructive' : ''}
					/>
				);

			case 'textarea':
				return (
					<Textarea
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.options?.placeholder}
						disabled={disabled || readonly}
						rows={field.options?.max === 255 ? 3 : 6}
						className={error ? 'border-destructive' : ''}
					/>
				);

			case 'richtext':
				return (
					<Textarea
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder="Rich text content..."
						disabled={disabled || readonly}
						rows={8}
						className="font-mono text-sm"
					/>
				);

			case 'number':
				return (
					<Input
						type="number"
						value={value || ''}
						onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
						placeholder={field.options?.placeholder}
						disabled={disabled || readonly}
						className={error ? 'border-destructive' : ''}
					/>
				);

			case 'date':
			case 'datetime':
				return (
					<DatePicker
						value={value ? new Date(value) : null}
						onChange={(date) => onChange(date?.toISOString())}
						disabled={disabled || readonly}
					/>
				);

			case 'boolean':
				return (
					<Switch
						checked={value || false}
						onCheckedChange={onChange}
						disabled={disabled || readonly}
					/>
				);

			case 'checkbox':
				return (
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={value || false}
							onCheckedChange={onChange}
							disabled={disabled || readonly}
						/>
						<Label>{field.options?.placeholder || 'Check this option'}</Label>
					</div>
				);

			case 'email':
				return (
					<Input
						type="email"
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={field.options?.placeholder}
						disabled={disabled || readonly}
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
						disabled={disabled || readonly}
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
						disabled={disabled || readonly}
						className={error ? 'border-destructive' : ''}
					/>
				);

			case 'color':
				return (
					<Input
						type="color"
						value={value || '#000000'}
						onChange={(e) => onChange(e.target.value)}
						disabled={disabled || readonly}
						className="w-20 h-10"
					/>
				);

			case 'select':
				return (
					<Select value={value || ''} onValueChange={onChange} disabled={disabled || readonly}>
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
					<div className="space-y-2">
						{field.options?.choices?.map((choice) => (
							<div key={choice.value} className="flex items-center space-x-2">
								<Checkbox
									checked={value?.includes(choice.value)}
									onCheckedChange={(checked) => {
										const currentValues = value || [];
										if (checked) {
											onChange([...currentValues, choice.value]);
										} else {
											onChange(currentValues.filter((v: string) => v !== choice.value));
										}
									}}
									disabled={disabled || readonly}
								/>
								<Label className="flex items-center gap-2">
									{choice.icon && <span>{choice.icon}</span>}
									{choice.label}
								</Label>
							</div>
						))}
					</div>
				);

			case 'radio':
				return (
					<RadioGroup value={value || ''} onValueChange={onChange} disabled={disabled || readonly}>
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
					<Textarea
						value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
						onChange={(e) => {
							try {
								const parsed = JSON.parse(e.target.value);
								onChange(parsed);
							} catch {
								onChange(e.target.value);
							}
						}}
						placeholder="JSON data..."
						disabled={disabled || readonly}
						rows={6}
						className="font-mono text-sm"
					/>
				);

			case 'slug':
				return (
					<Input
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder="url-friendly-slug"
						disabled={disabled || readonly}
						className="font-mono text-sm"
					/>
				);

			case 'uuid':
				return (
					<Input
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder="00000000-0000-0000-0000-000000000000"
						disabled={disabled || readonly}
						className="font-mono text-sm"
					/>
				);

			case 'file':
			case 'image':
				return (
					<div className="space-y-2">
						<Input
							type="file"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) {
									// In a real implementation, you'd upload the file and store the URL
									onChange({
										name: file.name,
										size: file.size,
										type: file.type,
									});
								}
							}}
							disabled={disabled || readonly}
						/>
						{value && typeof value === 'object' && (
							<div className="text-sm text-muted-foreground">
								{value.name} ({Math.round(value.size / 1024)}KB)
							</div>
						)}
					</div>
				);

			case 'component':
				return (
					<Card>
						<CardContent className="p-4">
							<div className="text-sm text-muted-foreground">
								Component: {field.options?.template || 'Unknown'}
							</div>
							<pre className="mt-2 text-xs bg-muted p-2 rounded">
								{JSON.stringify(value || {}, null, 2)}
							</pre>
						</CardContent>
					</Card>
				);

			case 'blocks':
				return (
					<Card>
						<CardContent className="p-4">
							<div className="text-sm text-muted-foreground mb-2">
								Blocks Editor ({value?.length || 0} blocks)
							</div>
							<pre className="text-xs bg-muted p-2 rounded max-h-40 overflow-auto">
								{JSON.stringify(value || [], null, 2)}
							</pre>
							<Button variant="outline" size="sm" className="mt-2" disabled={disabled || readonly}>
								Add Block
							</Button>
						</CardContent>
					</Card>
				);

			case 'relation':
				return (
					<Select value={value || ''} onValueChange={onChange} disabled={disabled || readonly}>
						<SelectTrigger className={error ? 'border-destructive' : ''}>
							<SelectValue placeholder={`Select ${field.options?.template || 'item'}`} />
						</SelectTrigger>
						<SelectContent>
							{/* In a real implementation, you'd fetch related items */}
							<SelectItem value="1">Related Item 1</SelectItem>
							<SelectItem value="2">Related Item 2</SelectItem>
						</SelectContent>
					</Select>
				);

			case 'geometry':
				return (
					<Textarea
						value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
						onChange={(e) => {
							try {
								const parsed = JSON.parse(e.target.value);
								onChange(parsed);
							} catch {
								onChange(e.target.value);
							}
						}}
						placeholder='{"type": "Point", "coordinates": [0, 0]}'
						disabled={disabled || readonly}
						rows={4}
						className="font-mono text-sm"
					/>
				);

			default:
				return (
					<Input
						value={value || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={`Unknown field type: ${field.type}`}
						disabled={disabled || readonly}
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

export default SimpleFieldRenderer;
