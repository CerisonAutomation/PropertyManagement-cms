// Advanced Schema Builder - Mirroring patterns from Payload, Strapi, Directus, and Sanity

import type {
	BlockDefinition,
	BlockPreview,
	CMSSchema,
	ChoiceOption,
	CollectionDefinition,
	ComponentDefinition,
	FieldDefinition,
	FieldOptions,
	FieldType,
} from '@/types/cms';

export class SchemaBuilder {
	private collections: CollectionDefinition[] = [];
	private components: ComponentDefinition[] = [];
	private blocks: BlockDefinition[] = [];

	// Collection Builder (Strapi-inspired)
	collection(name: string, displayName: string) {
		const builder = new CollectionBuilder(name, displayName, this);
		return builder;
	}

	// Component Builder (Payload-inspired)
	component(name: string, displayName: string) {
		const builder = new ComponentBuilder(name, displayName, this);
		return builder;
	}

	// Block Builder (Sanity-inspired)
	block(name: string, title: string) {
		const builder = new BlockBuilder(name, title, this);
		return builder;
	}

	// Getters
	getCollections(): CollectionDefinition[] {
		return this.collections;
	}

	getComponents(): ComponentDefinition[] {
		return this.components;
	}

	getBlocks(): BlockDefinition[] {
		return this.blocks;
	}

	// Build final schema
	build(): CMSSchema {
		return {
			collections: this.collections,
			components: this.components,
			blocks: this.blocks,
			extensions: [],
			settings: this.getDefaultSettings(),
		};
	}

	private getDefaultSettings() {
		return {
			project_name: 'Christiano Vincenti CMS',
			project_description: 'Advanced Property Management CMS',
			default_language: 'en',
			supported_languages: ['en'],
			timezone: 'Europe/Malta',
			date_format: 'YYYY-MM-DD',
			time_format: 'HH:mm:ss',
			currency: 'EUR',
			theme: {
				primary_color: '#d4a574',
				secondary_color: '#1a1a1a',
				background_color: '#ffffff',
				text_color: '#1a1a1a',
				border_color: '#e5e5e5',
				font_family: 'Inter, sans-serif',
			},
			api: {
				rate_limit: 1000,
				cors_origins: ['http://localhost:3000'],
				graphql_enabled: true,
				rest_enabled: true,
				websocket_enabled: true,
				cache_ttl: 300,
			},
			security: {
				auth_provider: 'local' as const,
				session_timeout: 3600,
				password_policy: {
					min_length: 8,
					require_uppercase: true,
					require_lowercase: true,
					require_numbers: true,
					require_symbols: false,
				},
				two_factor_enabled: false,
			},
		};
	}

	// Internal methods
	addCollection(collection: CollectionDefinition) {
		this.collections.push(collection);
		return this;
	}

	addComponent(component: ComponentDefinition) {
		this.components.push(component);
		return this;
	}

	addBlock(block: BlockDefinition) {
		this.blocks.push(block);
		return this;
	}
}

// Collection Builder (Strapi-inspired with Directus patterns)
export class CollectionBuilder {
	private collection: Partial<CollectionDefinition> = {};
	private schemaBuilder: SchemaBuilder;

	constructor(name: string, displayName: string, schemaBuilder: SchemaBuilder) {
		this.schemaBuilder = schemaBuilder;
		this.collection = {
			name,
			display_name: displayName,
			singular_name: displayName.slice(0, -1),
			fields: [],
			settings: {
				sortable: true,
				filterable: true,
				searchable: true,
				default_sort: 'created_at',
				default_limit: 25,
			},
			hooks: {},
			permissions: {},
		};
	}

	// Basic properties
	description(desc: string) {
		this.collection.description = desc;
		return this;
	}

	singular(name: string) {
		this.collection.singular_name = name;
		return this;
	}

	icon(iconName: string) {
		this.collection.icon = iconName;
		return this;
	}

	color(color: string) {
		this.collection.color = color;
		return this;
	}

	// Settings (Directus-inspired)
	sortable(value = true) {
		this.collection.settings!.sortable = value;
		return this;
	}

	filterable(value = true) {
		this.collection.settings!.filterable = value;
		return this;
	}

	searchable(value = true) {
		this.collection.settings!.searchable = value;
		return this;
	}

	defaultSort(field: string) {
		this.collection.settings!.default_sort = field;
		return this;
	}

	defaultLimit(limit: number) {
		this.collection.settings!.default_limit = limit;
		return this;
	}

	archiveField(field: string) {
		this.collection.settings!.archive_field = field;
		return this;
	}

	statusField(field: string) {
		this.collection.settings!.status_field = field;
		return this;
	}

	// Fields
	field(name: string, type: FieldType) {
		const builder = new FieldBuilder(name, type, this);
		return builder;
	}

	// Add field to collection
	addField(field: FieldDefinition) {
		this.collection.fields!.push(field);
		return this;
	}

	// Hooks (Payload-inspired)
	beforeCreate(hook: (data: any, context: any) => any) {
		this.collection.hooks!.before_create = hook;
		return this;
	}

	afterCreate(hook: (result: any, context: any) => void) {
		this.collection.hooks!.after_create = hook;
		return this;
	}

	beforeUpdate(hook: (data: any, context: any) => any) {
		this.collection.hooks!.before_update = hook;
		return this;
	}

	afterUpdate(hook: (result: any, context: any) => void) {
		this.collection.hooks!.after_update = hook;
		return this;
	}

	beforeDelete(hook: (id: string, context: any) => void) {
		this.collection.hooks!.before_delete = hook;
		return this;
	}

	afterDelete(hook: (id: string, context: any) => void) {
		this.collection.hooks!.after_delete = hook;
		return this;
	}

	// Permissions (Directus-inspired)
	permissions(permissions: CollectionDefinition['permissions']) {
		this.collection.permissions = permissions;
		return this;
	}

	// Build and add to schema
	build() {
		this.schemaBuilder.addCollection(this.collection as CollectionDefinition);
		return this.schemaBuilder;
	}
}

// Component Builder (Payload-inspired)
export class ComponentBuilder {
	private component: Partial<ComponentDefinition> = {};
	private schemaBuilder: SchemaBuilder;

	constructor(name: string, displayName: string, schemaBuilder: SchemaBuilder) {
		this.schemaBuilder = schemaBuilder;
		this.component = {
			name,
			display_name: displayName,
			fields: [],
			interface: 'default',
		};
	}

	description(desc: string) {
		this.component.description = desc;
		return this;
	}

	icon(iconName: string) {
		this.component.icon = iconName;
		return this;
	}

	interface(type: 'default' | 'cards' | 'collapsible' | 'tabbed') {
		this.component.interface = type;
		return this;
	}

	field(name: string, type: FieldType) {
		const builder = new FieldBuilder(name, type, this);
		return builder;
	}

	addField(field: FieldDefinition) {
		this.component.fields!.push(field);
		return this;
	}

	build() {
		this.schemaBuilder.addComponent(this.component as ComponentDefinition);
		return this.schemaBuilder;
	}
}

// Block Builder (Sanity-inspired)
export class BlockBuilder {
	private block: Partial<BlockDefinition> = {};
	private schemaBuilder: SchemaBuilder;

	constructor(name: string, title: string, schemaBuilder: SchemaBuilder) {
		this.schemaBuilder = schemaBuilder;
		this.block = {
			name,
			title,
			fields: [],
		};
	}

	description(desc: string) {
		this.block.description = desc;
		return this;
	}

	icon(iconName: string) {
		this.block.icon = iconName;
		return this;
	}

	imageUrl(url: string) {
		this.block.image_url = url;
		return this;
	}

	imageAlt(text: string) {
		this.block.image_alt_text = text;
		return this;
	}

	preview(preview: BlockPreview) {
		this.block.preview = preview;
		return this;
	}

	field(name: string, type: FieldType) {
		const builder = new FieldBuilder(name, type, this);
		return builder;
	}

	addField(field: FieldDefinition) {
		this.block.fields!.push(field);
		return this;
	}

	build() {
		this.schemaBuilder.addBlock(this.block as BlockDefinition);
		return this.schemaBuilder;
	}
}

// Field Builder (Universal across all CMS patterns)
export class FieldBuilder {
	private field: Partial<FieldDefinition> = {};
	private parent: CollectionBuilder | ComponentBuilder | BlockBuilder;

	constructor(
		name: string,
		type: FieldType,
		parent: CollectionBuilder | ComponentBuilder | BlockBuilder
	) {
		this.parent = parent;
		this.field = {
			name,
			type,
		};
	}

	// Basic properties
	required(value = true) {
		this.field.required = value;
		return this;
	}

	unique(value = true) {
		this.field.unique = value;
		return this;
	}

	hidden(value = true) {
		this.field.hidden = value;
		return this;
	}

	default(value: any) {
		this.field.default = value;
		return this;
	}

	// Validation
	validation(rule: string, message?: string, value?: any) {
		if (!this.field.validation) {
			this.field.validation = [];
		}
		this.field.validation.push({ rule, message, value });
		return this;
	}

	// Interface
	interface(interfaceName: string) {
		this.field.interface = interfaceName;
		return this;
	}

	// Options
	options(options: FieldOptions) {
		this.field.options = options;
		return this;
	}

	// Specific field type helpers
	text() {
		this.field.type = 'text';
		return this;
	}

	textarea() {
		this.field.type = 'textarea';
		return this;
	}

	richtext() {
		this.field.type = 'richtext';
		return this;
	}

	number() {
		this.field.type = 'number';
		return this;
	}

	date() {
		this.field.type = 'date';
		return this;
	}

	datetime() {
		this.field.type = 'datetime';
		return this;
	}

	boolean() {
		this.field.type = 'boolean';
		return this;
	}

	email() {
		this.field.type = 'email';
		return this;
	}

	url() {
		this.field.type = 'url';
		return this;
	}

	password() {
		this.field.type = 'password';
		return this;
	}

	color() {
		this.field.type = 'color';
		return this;
	}

	file() {
		this.field.type = 'file';
		return this;
	}

	image() {
		this.field.type = 'image';
		return this;
	}

	json() {
		this.field.type = 'json';
		return this;
	}

	slug(source?: string) {
		this.field.type = 'slug';
		if (source) {
			this.field.options = { ...this.field.options, template: source };
		}
		return this;
	}

	uuid() {
		this.field.type = 'uuid';
		return this;
	}

	// Select field helpers
	select(choices: ChoiceOption[]) {
		this.field.type = 'select';
		this.field.options = { ...this.field.options, choices };
		return this;
	}

	multiselect(choices: ChoiceOption[]) {
		this.field.type = 'multiselect';
		this.field.options = { ...this.field.options, choices };
		return this;
	}

	radio(choices: ChoiceOption[]) {
		this.field.type = 'radio';
		this.field.options = { ...this.field.options, choices };
		return this;
	}

	// Advanced field types
	component(componentName: string) {
		this.field.type = 'component';
		this.field.options = { ...this.field.options, template: componentName };
		return this;
	}

	blocks(blockNames: string[]) {
		this.field.type = 'blocks';
		this.field.options = {
			...this.field.options,
			choices: blockNames.map((name) => ({ value: name, label: name })),
		};
		return this;
	}

	relation(collection: string, interfaceName?: string) {
		this.field.type = 'relation';
		this.field.interface = interfaceName || 'default';
		this.field.options = { ...this.field.options, template: collection };
		return this;
	}

	// Common field patterns
	placeholder(text: string) {
		this.field.options = { ...this.field.options, placeholder: text };
		return this;
	}

	help(text: string) {
		this.field.options = { ...this.field.options, help: text };
		return this;
	}

	maxLength(length: number) {
		this.field.options = { ...this.field.options, max: length };
		return this;
	}

	minLength(length: number) {
		this.field.options = { ...this.field.options, min: length };
		return this;
	}

	pattern(regex: string, message?: string) {
		this.field.options = { ...this.field.options, pattern: regex };
		if (message) {
			this.validation('pattern', message, regex);
		}
		return this;
	}

	// Build and add to parent
	build() {
		this.parent.addField(this.field as FieldDefinition);
		return this.parent;
	}
}

// Helper functions for common patterns
export function createSchema() {
	return new SchemaBuilder();
}

// Common field patterns (inspired by all major CMS)
export const commonFields = {
	id: () => new FieldBuilder('id', 'uuid', null as any).required().build(),
	createdAt: () => new FieldBuilder('created_at', 'datetime', null as any).required().build(),
	updatedAt: () => new FieldBuilder('updated_at', 'datetime', null as any).required().build(),
	publishedAt: () => new FieldBuilder('published_at', 'datetime', null as any).build(),
	status: (choices: ChoiceOption[] = []) =>
		new FieldBuilder('status', 'select', null as any)
			.select(
				choices.length > 0
					? choices
					: [
							{ value: 'draft', label: 'Draft' },
							{ value: 'published', label: 'Published' },
							{ value: 'archived', label: 'Archived' },
						]
			)
			.default('draft')
			.build(),
	slug: (source = 'title') =>
		new FieldBuilder('slug', 'slug', null as any).slug(source).unique().build(),
	title: () => new FieldBuilder('title', 'text', null as any).required().maxLength(255).build(),
	description: () => new FieldBuilder('description', 'textarea', null as any).build(),
	content: () => new FieldBuilder('content', 'richtext', null as any).build(),
	image: () => new FieldBuilder('image', 'image', null as any).build(),
	seoTitle: () => new FieldBuilder('seo_title', 'text', null as any).maxLength(60).build(),
	seoDescription: () =>
		new FieldBuilder('seo_description', 'textarea', null as any).maxLength(160).build(),
};
