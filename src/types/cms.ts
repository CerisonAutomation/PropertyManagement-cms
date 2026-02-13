// Enhanced CMS Types with Supabase Integration - Enterprise Grade

// Core Entity Types
export interface CMSEntity {
	id: string;
	created_at: string;
	updated_at: string;
	created_by?: string;
	updated_by?: string;
}

export interface SEOFields {
	meta_title?: string;
	meta_description?: string;
	meta_keywords?: string[];
	seo_score?: number;
}

export interface PublishingFields {
	status: 'draft' | 'published' | 'archived' | 'scheduled';
	published_at?: string;
	scheduled_at?: string;
	featured?: boolean;
	view_count?: number;
}

// Enhanced Page Types
export interface CMSEnhancedPage extends CMSEntity, SEOFields, PublishingFields {
	slug: string;
	title: string;
	content: Record<string, any>;
	template: 'default' | 'landing' | 'blog' | 'portfolio' | 'contact' | 'about';
	featured_image_url?: string;
	sort_order?: number;
	author_id?: string;
	tags?: string[];
	category?: string;
	language?: string;
	reading_time?: number;
	last_accessed_at?: string;
	version?: number;
}

// Enhanced Blog Post Types
export interface CMSBlogPost extends CMSEntity, SEOFields, PublishingFields {
	slug: string;
	title: string;
	content: Record<string, any>;
	excerpt?: string;
	featured_image_url?: string;
	author_id?: string;
	category_id?: string;
	tags?: string[];
	like_count?: number;
	comment_count?: number;
	reading_time?: number;
	language?: string;
	last_accessed_at?: string;
	version?: number;
}

// Category Types
export interface CMSCategory extends CMSEntity {
	name: string;
	slug: string;
	description?: string;
	meta_title?: string;
	meta_description?: string;
	parent_id?: string;
	icon_url?: string;
	color?: string;
	sort_order?: number;
	is_active?: boolean;
	post_count?: number;
}

// Property Types (Real Estate)
export interface CMSProperty extends CMSEntity {
	slug: string;
	title: string;
	description?: string;
	content: Record<string, any>;
	property_type: 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | 'office';
	status: 'available' | 'rented' | 'sold' | 'under_offer' | 'off_market';
	published_at?: string;
	scheduled_at?: string;
	featured?: boolean;
	view_count?: number;
	price?: number;
	currency?: string;
	bedrooms?: number;
	bathrooms?: number;
	area?: number;
	land_area?: number;
	year_built?: number;
	features?: string[];
	amenities?: string[];
	location: PropertyLocation;
	images?: string[];
	floor_plan_url?: string;
	virtual_tour_url?: string;
	energy_rating?: string;
	furnished?: boolean;
	parking_spaces?: number;
	agent_id?: string;
	featured_image_url?: string;
	inquiry_count?: number;
	expires_at?: string;
	reference_number?: string;
}

export interface PropertyLocation {
	address: string;
	city?: string;
	country?: string;
	postal_code?: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
	neighborhood?: string;
	landmarks?: string[];
}

// Media Types
export interface CMSMedia extends CMSEntity {
	name: string;
	alt_text?: string;
	caption?: string;
	description?: string;
	file_name: string;
	file_path: string;
	file_size?: number;
	mime_type?: string;
	width?: number;
	height?: number;
	duration?: number; // for videos
	thumbnail_url?: string;
	cdn_url?: string;
	tags?: string[];
	category?: string;
	uploaded_by?: string;
	is_public?: boolean;
	download_count?: number;
}

// Form Types
export interface CMSForm extends CMSEntity {
	name: string;
	title?: string;
	description?: string;
	form_config: FormConfig;
	success_message?: string;
	redirect_url?: string;
	email_recipients?: string[];
	is_active?: boolean;
	submission_count?: number;
	created_by?: string;
}

export interface FormConfig {
	fields: FormField[];
	validation?: FormValidation;
	settings?: FormSettings;
}

export interface FormField {
	id: string;
	name: string;
	type: FieldType;
	label: string;
	placeholder?: string;
	required?: boolean;
	options?: ChoiceOption[];
	validation?: FieldValidation;
	conditional?: ConditionalLogic;
}

export interface FormValidation {
	rules: ValidationRule[];
	error_messages: Record<string, string>;
}

export interface FormSettings {
	submit_button_text?: string;
	reset_button_text?: string;
	show_progress?: boolean;
	multi_step?: boolean;
	ajax_submit?: boolean;
}

export interface ConditionalLogic {
	field: string;
	operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
	value: any;
	action: 'show' | 'hide' | 'enable' | 'disable';
}

export interface FieldValidation {
	required?: boolean;
	min_length?: number;
	max_length?: number;
	pattern?: string;
	min?: number;
	max?: number;
	email?: boolean;
	url?: boolean;
}

// Form Submission Types
export interface CMSFormSubmission extends CMSEntity {
	form_id: string;
	submission_data: Record<string, any>;
	user_agent?: string;
	ip_address?: string;
	referrer?: string;
	status: 'new' | 'read' | 'processed' | 'spam';
	processed_at?: string;
}

// API Query Types
export interface CMSQueryOptions {
	limit?: number;
	offset?: number;
	page?: number;
	filter?: CMSFilter[];
	sort?: CMSSort[];
	search?: string;
	fields?: string[];
}

export interface CMSFilter {
	field: string;
	operator: FilterOperator;
	value?: any;
}

export interface CMSSort {
	field: string;
	direction: 'asc' | 'desc';
}

export type FilterOperator =
	| 'eq'
	| 'neq'
	| 'lt'
	| 'lte'
	| 'gt'
	| 'gte'
	| 'in'
	| 'nin'
	| 'contains'
	| 'ncontains'
	| 'starts_with'
	| 'nstarts_with'
	| 'ends_with'
	| 'nends_with'
	| 'between'
	| 'nbetween'
	| 'empty'
	| 'nempty'
	| 'null'
	| 'nnull';

// API Response Types
export interface CMSApiResponse<T = any> {
	data: T;
	meta?: CMSResponseMeta;
	errors?: CMSError[];
}

export interface CMSResponseMeta {
	total_count?: number;
	filtered_count?: number;
	page_count?: number;
	current_page?: number;
	per_page?: number;
	total_pages?: number;
	has_more?: boolean;
	next_page?: number;
	prev_page?: number;
}

// Search Types
export interface CMSSearchRequest {
	query: string;
	types?: string[];
	filters?: CMSFilter[];
	sort?: CMSSort[];
	limit?: number;
	offset?: number;
}

export interface CMSSearchResult {
	id: string;
	type: string;
	title: string;
	description?: string;
	url: string;
	score?: number;
	highlights?: string[];
	metadata?: Record<string, any>;
}

// Analytics Types
export interface CMSAnalytics {
	page_views: PageViewAnalytics;
	form_submissions: FormAnalytics;
	media_downloads: MediaAnalytics;
	search_queries: SearchAnalytics;
	user_activity: UserActivityAnalytics;
}

export interface PageViewAnalytics {
	total_views: number;
	unique_views: number;
	popular_pages: Array<{
		page_id: string;
		title: string;
		views: number;
		unique_views: number;
	}>;
	views_by_date: Array<{
		date: string;
		views: number;
	}>;
}

export interface FormAnalytics {
	total_submissions: number;
	conversion_rate: number;
	popular_forms: Array<{
		form_id: string;
		name: string;
		submissions: number;
		conversion_rate: number;
	}>;
	submissions_by_date: Array<{
		date: string;
		submissions: number;
	}>;
}

export interface MediaAnalytics {
	total_downloads: number;
	popular_files: Array<{
		media_id: string;
		name: string;
		downloads: number;
	}>;
	downloads_by_date: Array<{
		date: string;
		downloads: number;
	}>;
}

export interface SearchAnalytics {
	total_searches: number;
	popular_queries: Array<{
		query: string;
		count: number;
		results_count: number;
	}>;
	searches_by_date: Array<{
		date: string;
		searches: number;
	}>;
}

export interface UserActivityAnalytics {
	active_users: number;
	total_sessions: number;
	average_session_duration: number;
	top_users: Array<{
		user_id: string;
		name: string;
		activity_score: number;
	}>;
}

// Webhook Types
export interface CMSWebhook {
	id: string;
	name: string;
	url: string;
	events: WebhookEvent[];
	headers?: Record<string, string>;
	secret?: string;
	active: boolean;
	last_triggered?: string;
	created_at: string;
	updated_at: string;
}

export type WebhookEvent =
	| 'page.created'
	| 'page.updated'
	| 'page.deleted'
	| 'blog_post.created'
	| 'blog_post.updated'
	| 'blog_post.deleted'
	| 'property.created'
	| 'property.updated'
	| 'property.deleted'
	| 'form.submitted'
	| 'media.uploaded'
	| 'category.created'
	| 'category.updated'
	| 'category.deleted';

export interface WebhookPayload {
	event: WebhookEvent;
	data: any;
	timestamp: string;
	signature?: string;
}

// Settings Types
export interface CMSSettings {
	site: SiteSettings;
	seo: SEOSettings;
	analytics: AnalyticsSettings;
	security: SecuritySettings;
	email: EmailSettings;
	storage: StorageSettings;
}

export interface SiteSettings {
	name: string;
	description: string;
	url: string;
	logo?: string;
	favicon?: string;
	default_language: string;
	timezone: string;
	date_format: string;
	time_format: string;
}

export interface SEOSettings {
	default_meta_title?: string;
	default_meta_description?: string;
	default_meta_keywords?: string[];
	robots_txt?: string;
	sitemap_enabled?: boolean;
	google_analytics_id?: string;
	google_search_console?: string;
}

export interface AnalyticsSettings {
	enabled: boolean;
	track_page_views?: boolean;
	track_form_submissions?: boolean;
	track_media_downloads?: boolean;
	track_search_queries?: boolean;
	retention_days?: number;
}

export interface SecuritySettings {
	enable_captcha?: boolean;
	captcha_site_key?: string;
	rate_limiting?: boolean;
	max_requests_per_minute?: number;
	ip_whitelist?: string[];
	ip_blacklist?: string[];
}

export interface EmailSettings {
	provider: 'smtp' | 'sendgrid' | 'ses' | 'mailgun';
	from_email: string;
	from_name: string;
	reply_to?: string;
	smtp_host?: string;
	smtp_port?: number;
	smtp_username?: string;
	smtp_password?: string;
	api_key?: string;
	region?: string;
}

export interface StorageSettings {
	provider: 'local' | 's3' | 'gcs' | 'azure';
	bucket?: string;
	region?: string;
	access_key_id?: string;
	secret_access_key?: string;
	cdn_url?: string;
	max_file_size?: number;
	allowed_mime_types?: string[];
}

// Legacy types for compatibility

export interface FieldDefinition {
	name: string;
	type: FieldType;
	required?: boolean;
	unique?: boolean;
	default?: any;
	validation?: ValidationRule[];
	hidden?: boolean;
	interface?: string;
	options?: FieldOptions;
}

export type FieldType =
	| 'text'
	| 'textarea'
	| 'richtext'
	| 'number'
	| 'date'
	| 'datetime'
	| 'boolean'
	| 'select'
	| 'multiselect'
	| 'radio'
	| 'checkbox'
	| 'email'
	| 'url'
	| 'password'
	| 'color'
	| 'file'
	| 'image'
	| 'json'
	| 'alias'
	| 'component'
	| 'blocks'
	| 'relation'
	| 'tree'
	| 'group'
	| 'tabs'
	| 'matrix'
	| 'slug'
	| 'uuid'
	| 'geometry';

export interface ValidationRule {
	rule: string;
	message?: string;
	value?: any;
}

export interface FieldOptions {
	choices?: ChoiceOption[];
	max?: number;
	min?: number;
	pattern?: string;
	placeholder?: string;
	help?: string;
	interface?: string;
	template?: string;
	display?: DisplayOptions;
}

export interface ChoiceOption {
	value: string;
	label: string;
	group?: string;
	icon?: string;
	color?: string;
}

export interface DisplayOptions {
	template?: string;
	preview?: boolean;
	badge?: boolean;
	date_format?: string;
	relation_options?: RelationDisplayOptions;
}

export interface RelationDisplayOptions {
	template?: string;
	image_source?: string;
	text_secondary?: string;
}

// Component Types (Payload-inspired)
export interface ComponentDefinition {
	name: string;
	display_name: string;
	fields: FieldDefinition[];
	interface?: 'default' | 'cards' | 'collapsible' | 'tabbed';
	icon?: string;
	description?: string;
}

// Block Types (Sanity-inspired)
export interface BlockDefinition {
	name: string;
	title: string;
	description?: string;
	icon?: string;
	fields: FieldDefinition[];
	preview?: BlockPreview;
	image_url?: string;
	image_alt_text?: string;
}

export interface BlockPreview {
	url?: string;
	prepare?: (fields: any) => any;
}

// Collection Types (Strapi-inspired)
export interface CollectionDefinition {
	name: string;
	display_name: string;
	singular_name: string;
	description?: string;
	icon?: string;
	color?: string;
	fields: FieldDefinition[];
	settings: CollectionSettings;
	hooks?: CollectionHooks;
	permissions?: CollectionPermissions;
}

export interface CollectionSettings {
	sortable?: boolean;
	filterable?: boolean;
	searchable?: boolean;
	default_sort?: string;
	default_limit?: number;
	archive_field?: string;
	status_field?: string;
	template?: string;
}

export interface CollectionHooks {
	before_create?: (data: any, context: HookContext) => any;
	after_create?: (result: any, context: HookContext) => void;
	before_update?: (data: any, context: HookContext) => any;
	after_update?: (result: any, context: HookContext) => void;
	before_delete?: (id: string, context: HookContext) => void;
	after_delete?: (id: string, context: HookContext) => void;
}

export interface CollectionPermissions {
	create?: PermissionRule[];
	read?: PermissionRule[];
	update?: PermissionRule[];
	delete?: PermissionRule[];
}

export interface PermissionRule {
	role?: string;
	user_id?: string;
	condition?: PermissionCondition;
	fields?: string[];
}

export interface PermissionCondition {
	and?: PermissionCondition[];
	or?: PermissionCondition[];
	field?: string;
	operator?: string;
	value?: any;
}

// Rich Text Types (Sanity Portable Text-inspired)
export interface PortableTextBlock {
	_type: 'block';
	_key?: string;
	style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote' | 'code';
	list?: 'bullet' | 'number';
	level?: number;
	markDefs?: MarkDefinition[];
	children: PortableTextSpan[];
}

export interface PortableTextSpan {
	_type: 'span';
	_key?: string;
	text: string;
	marks?: string[];
}

export interface MarkDefinition {
	_key: string;
	_type: string;
	[key: string]: any;
}

export interface PortableTextInline {
	_type: string;
	_key?: string;
	[key: string]: any;
}

// Block Array Types (Payload-inspired)
export interface BlockArrayField {
	_type: 'blocks';
	_key?: string;
	blockType: string;
	[key: string]: any;
}

// Advanced Content Types
export interface ContentVersion {
	id: string;
	document_id: string;
	version: number;
	content: any;
	created_at: string;
	created_by: string;
	label?: string;
	published?: boolean;
}

export interface ContentTranslation {
	id: string;
	document_id: string;
	language: string;
	content: any;
	created_at: string;
	updated_at: string;
	created_by: string;
}

export interface ContentWorkflow {
	id: string;
	document_id: string;
	status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
	assigned_to?: string;
	created_by: string;
	created_at: string;
	updated_at: string;
	comments?: WorkflowComment[];
}

export interface WorkflowComment {
	id: string;
	user_id: string;
	content: string;
	created_at: string;
	mentions?: string[];
}

// API Types (Directus-inspired)
export interface QueryFilter {
	field: string;
	operator: FilterOperator;
	value?: any;
}

export interface QuerySort {
	field: string;
	direction: 'asc' | 'desc';
}

export interface QueryOptions {
	limit?: number;
	offset?: number;
	page?: number;
	filter?: QueryFilter[];
	sort?: QuerySort[];
	search?: string;
	fields?: string[];
	deep?: DeepQuery;
}

export interface DeepQuery {
	[collection: string]: {
		fields?: string[];
		filter?: QueryFilter[];
		sort?: QuerySort[];
		limit?: number;
	};
}

// Real-time Types (Directus-inspired)
export interface RealtimeSubscription {
	id: string;
	collection: string;
	action: 'create' | 'update' | 'delete';
	data?: any;
	key?: string;
}

// Extension Types (Strapi-inspired)
export interface Extension {
	name: string;
	type: 'field' | 'component' | 'hook' | 'middleware' | 'theme' | 'plugin';
	enabled: boolean;
	config?: any;
	dependencies?: string[];
}

// Schema Types
export interface CMSSchema {
	collections: CollectionDefinition[];
	components: ComponentDefinition[];
	blocks: BlockDefinition[];
	extensions: Extension[];
	settings: CMSSettings;
}

export interface CMSSettings {
	project_name: string;
	project_description: string;
	default_language: string;
	supported_languages: string[];
	timezone: string;
	date_format: string;
	time_format: string;
	currency: string;
	theme: ThemeSettings;
	api: APISettings;
	security: SecuritySettings;
}

export interface ThemeSettings {
	primary_color: string;
	secondary_color: string;
	background_color: string;
	text_color: string;
	border_color: string;
	font_family: string;
	logo?: string;
	favicon?: string;
}

export interface APISettings {
	rate_limit: number;
	cors_origins: string[];
	graphql_enabled: boolean;
	rest_enabled: boolean;
	websocket_enabled: boolean;
	cache_ttl: number;
}

export interface SecuritySettings {
	auth_provider: 'local' | 'oauth' | 'saml';
	session_timeout: number;
	password_policy: PasswordPolicy;
	two_factor_enabled: boolean;
	ip_whitelist?: string[];
}

export interface PasswordPolicy {
	min_length: number;
	require_uppercase: boolean;
	require_lowercase: boolean;
	require_numbers: boolean;
	require_symbols: boolean;
}

// Hook Context
export interface HookContext {
	user: any;
	collection: string;
	action: string;
	payload: any;
	headers: Record<string, string>;
}

// Error Types
export interface CMSError {
	code: string;
	message: string;
	details?: any;
	stack?: string;
}

// Response Types
export interface APIResponse<T = any> {
	data: T;
	meta?: ResponseMeta;
	errors?: CMSError[];
}

export interface ResponseMeta {
	total_count?: number;
	filtered_count?: number;
	page_count?: number;
	current_page?: number;
	per_page?: number;
	total_pages?: number;
}
