// Validation Middleware - Request validation using Joi schemas

import { createError } from '@/api/utils/error';
import type { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

type PrimitiveRuleType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'uuid';

type RuleDefinition = {
	type: PrimitiveRuleType;
	required?: boolean;
	optional?: boolean;
	minLength?: number;
	maxLength?: number;
	minimum?: number;
	maximum?: number;
	enum?: Array<string | number | boolean>;
	items?: RuleDefinition;
	properties?: Record<string, RuleDefinition>;
	pattern?: RegExp | string;
	default?: unknown;
};

type ObjectDescriptor = {
	type: 'object';
	required?: string[];
	properties?: Record<string, RuleDefinition>;
};

type LightweightSchema = Record<string, RuleDefinition> | ObjectDescriptor;

const isJoiSchema = (value: unknown): value is Joi.Schema => Joi.isSchema(value);

const toObjectSchema = (
	schemaLike: Joi.ObjectSchema | LightweightSchema | undefined,
	key: string
): Joi.ObjectSchema | undefined => {
	if (!schemaLike) return undefined;
	if (isJoiSchema(schemaLike)) return schemaLike as Joi.ObjectSchema;

	if (typeof schemaLike !== 'object' || schemaLike === null) {
		throw createError('VALIDATION_SCHEMA_ERROR', `Invalid schema provided for ${key}`, 500);
	}

	// Descriptor format: { type: 'object', required: [...], properties: {...} }
	if ('type' in schemaLike && schemaLike.type === 'object') {
		return buildObjectFromDescriptor(schemaLike as ObjectDescriptor);
	}

	// Field map format: { fieldName: { type: 'string', ... } }
	return buildObjectFromFieldMap(schemaLike as Record<string, RuleDefinition>);
};

const buildObjectFromDescriptor = (descriptor: ObjectDescriptor): Joi.ObjectSchema => {
	const properties = descriptor.properties ?? {};
	const requiredFields = new Set(descriptor.required ?? []);
	const map: Record<string, RuleDefinition> = {};

	for (const [key, rule] of Object.entries(properties)) {
		map[key] = {
			...rule,
			required: requiredFields.has(key) || rule.required,
			optional: requiredFields.has(key) ? false : rule.optional,
		};
	}

	return buildObjectFromFieldMap(map);
};

const buildObjectFromFieldMap = (fieldMap: Record<string, RuleDefinition>): Joi.ObjectSchema => {
	const joiMap: Record<string, Joi.Schema> = {};

	for (const [field, rule] of Object.entries(fieldMap)) {
		joiMap[field] = buildRuleSchema(rule, field);
	}

	return Joi.object(joiMap);
};

const buildRuleSchema = (rule: RuleDefinition, fieldName: string): Joi.Schema => {
	let schema: Joi.Schema;

	switch (rule.type) {
		case 'string': {
			let base = Joi.string();
			if (typeof rule.minLength === 'number') base = base.min(rule.minLength);
			if (typeof rule.maxLength === 'number') base = base.max(rule.maxLength);
			if (rule.pattern instanceof RegExp) base = base.pattern(rule.pattern);
			if (typeof rule.pattern === 'string') base = base.pattern(new RegExp(rule.pattern));
			schema = base;
			break;
		}
		case 'number': {
			let base = Joi.number();
			if (typeof rule.minimum === 'number') base = base.min(rule.minimum);
			if (typeof rule.maximum === 'number') base = base.max(rule.maximum);
			schema = base;
			break;
		}
		case 'boolean':
			schema = Joi.boolean();
			break;
		case 'uuid':
			schema = Joi.string().uuid();
			break;
		case 'array': {
			let base = Joi.array();
			if (rule.items) base = base.items(buildRuleSchema(rule.items, `${fieldName}[]`));
			schema = base;
			break;
		}
		case 'object': {
			if (rule.properties) {
				schema = buildObjectFromFieldMap(rule.properties);
			} else {
				schema = Joi.object();
			}
			break;
		}
		default:
			throw createError('VALIDATION_SCHEMA_ERROR', `Unsupported schema type for ${fieldName}`, 500);
	}

	if (Array.isArray(rule.enum) && rule.enum.length > 0) {
		schema = (schema as Joi.AnySchema).valid(...rule.enum);
	}

	if (rule.default !== undefined) {
		schema = (schema as Joi.AnySchema).default(rule.default);
	}

	if (rule.required === true || rule.optional === false) {
		return schema.required();
	}

	if (rule.optional === true) {
		return schema.optional();
	}

	return schema;
};

export interface ValidationSchema {
	body?: Joi.ObjectSchema | LightweightSchema;
	params?: Joi.ObjectSchema | LightweightSchema;
	query?: Joi.ObjectSchema | LightweightSchema;
	headers?: Joi.ObjectSchema | LightweightSchema;
}

// Validation middleware factory
export const validate = (schema: ValidationSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const errors: Record<string, string[]> = {};

		const bodySchema = toObjectSchema(schema.body, 'body');
		const paramsSchema = toObjectSchema(schema.params, 'params');
		const querySchema = toObjectSchema(schema.query, 'query');
		const headersSchema = toObjectSchema(schema.headers, 'headers');

		// Validate request body
		if (bodySchema) {
			const { error } = bodySchema.validate(req.body, {
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
				convert: true,
			});
			if (error) {
				errors.body = error.details.map((detail) => detail.message);
			}
		}

		// Validate request parameters
		if (paramsSchema) {
			const { error } = paramsSchema.validate(req.params, {
				abortEarly: false,
				allowUnknown: false,
				stripUnknown: true,
				convert: true,
			});
			if (error) {
				errors.params = error.details.map((detail) => detail.message);
			}
		}

		// Validate query parameters
		if (querySchema) {
			const { error } = querySchema.validate(req.query, {
				abortEarly: false,
				allowUnknown: true,
				stripUnknown: false,
				convert: true,
			});
			if (error) {
				errors.query = error.details.map((detail) => detail.message);
			}
		}

		// Validate headers
		if (headersSchema) {
			const { error } = headersSchema.validate(req.headers, {
				abortEarly: false,
				allowUnknown: true,
				stripUnknown: false,
				convert: true,
			});
			if (error) {
				errors.headers = error.details.map((detail) => detail.message);
			}
		}

		// If there are validation errors, return 400 response
		if (Object.keys(errors).length > 0) {
			throw createError('VALIDATION_ERROR', 'Validation failed', 400, errors);
		}

		next();
	};
};

// Query parameter validation middleware
export const validateQuery = (schema: Joi.ObjectSchema | LightweightSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const joiSchema = toObjectSchema(schema, 'query');
		if (!joiSchema) {
			throw createError('VALIDATION_SCHEMA_ERROR', 'Query schema is required', 500);
		}

		const { error } = joiSchema.validate(req.query, {
			abortEarly: false,
			allowUnknown: true,
			stripUnknown: false,
			convert: true,
		});

		if (error) {
			const errors = error.details.reduce((acc: any, detail: any) => {
				acc[detail.path[0]] = detail.message;
				return acc;
			}, {});

			throw createError('VALIDATION_ERROR', 'Query validation failed', 400, errors);
		}

		next();
	};
};

// Common validation schemas
export const commonSchemas = {
	// ID validation
	id: Joi.string().uuid().required(),

	// Slug validation
	slug: Joi.string()
		.min(1)
		.max(255)
		.pattern(/^[a-z0-9-]+$/)
		.required(),

	// Pagination
	pagination: {
		limit: Joi.number().integer().min(1).max(100).default(25),
		offset: Joi.number().integer().min(0).default(0),
		page: Joi.number().integer().min(1).optional(),
	},

	// Sorting
	sort: Joi.string()
		.pattern(/^[a-zA-Z0-9_]+(:(asc|desc))?$/)
		.optional(),

	// Search
	search: Joi.string().min(2).max(100).optional(),

	// Array of strings
	stringArray: Joi.array().items(Joi.string()).optional(),

	// Date range
	dateRange: {
		from: Joi.date().optional(),
		to: Joi.date().optional(),
	},

	// Price range
	priceRange: {
		min: Joi.number().min(0).optional(),
		max: Joi.number().min(0).optional(),
	},
};

// Resource-specific schemas
export const resourceSchemas = {
	// Page schemas
	page: {
		create: Joi.object({
			title: Joi.string().min(1).max(255).required(),
			slug: commonSchemas.slug,
			content: Joi.object().optional(),
			template: Joi.string().valid('default', 'landing', 'blog', 'portfolio').default('default'),
			status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
			sort_order: Joi.number().integer().default(0),
			seo_title: Joi.string().max(60).optional(),
			seo_description: Joi.string().max(160).optional(),
			meta_image: Joi.string().uri().optional(),
		}),

		update: Joi.object({
			title: Joi.string().min(1).max(255).optional(),
			slug: commonSchemas.slug.optional(),
			content: Joi.object().optional(),
			template: Joi.string().valid('default', 'landing', 'blog', 'portfolio').optional(),
			status: Joi.string().valid('draft', 'published', 'archived').optional(),
			sort_order: Joi.number().integer().optional(),
			seo_title: Joi.string().max(60).optional(),
			seo_description: Joi.string().max(160).optional(),
			meta_image: Joi.string().uri().optional(),
		}),
	},

	// Blog post schemas
	blogPost: {
		create: Joi.object({
			title: Joi.string().min(1).max(255).required(),
			slug: commonSchemas.slug,
			content: Joi.object().required(),
			excerpt: Joi.string().max(500).optional(),
			featured_image: Joi.string().uri().optional(),
			author: Joi.string().optional(),
			category: Joi.string().optional(),
			tags: commonSchemas.stringArray,
			reading_time: Joi.number().integer().min(1).optional(),
			status: Joi.string().valid('draft', 'published').default('draft'),
			seo_title: Joi.string().max(60).optional(),
			seo_description: Joi.string().max(160).optional(),
		}),

		update: Joi.object({
			title: Joi.string().min(1).max(255).optional(),
			slug: commonSchemas.slug.optional(),
			content: Joi.object().optional(),
			excerpt: Joi.string().max(500).optional(),
			featured_image: Joi.string().uri().optional(),
			author: Joi.string().optional(),
			category: Joi.string().optional(),
			tags: commonSchemas.stringArray.optional(),
			reading_time: Joi.number().integer().min(1).optional(),
			status: Joi.string().valid('draft', 'published').optional(),
			seo_title: Joi.string().max(60).optional(),
			seo_description: Joi.string().max(160).optional(),
		}),
	},

	// Property schemas
	property: {
		create: Joi.object({
			name: Joi.string().min(1).max(255).required(),
			slug: commonSchemas.slug,
			description: Joi.string().optional(),
			type: Joi.string()
				.valid('apartment', 'villa', 'penthouse', 'townhouse', 'bungalow')
				.required(),
			location: Joi.object({
				address: Joi.string().required(),
				city: Joi.string().required(),
				country: Joi.string().required(),
				postal_code: Joi.string().optional(),
				coordinates: Joi.object({
					lat: Joi.number().min(-90).max(90).optional(),
					lng: Joi.number().min(-180).max(180).optional(),
				}).optional(),
			}).required(),
			features: commonSchemas.stringArray,
			bedrooms: Joi.number().integer().min(0).optional(),
			bathrooms: Joi.number().integer().min(0).optional(),
			area: Joi.number().min(0).optional(),
			price: Joi.number().min(0).required(),
			currency: Joi.string().valid('EUR', 'USD', 'GBP').default('EUR'),
			images: Joi.array().items(Joi.string().uri()).optional(),
			status: Joi.string().valid('available', 'rented', 'maintenance').default('available'),
		}),

		update: Joi.object({
			name: Joi.string().min(1).max(255).optional(),
			slug: commonSchemas.slug.optional(),
			description: Joi.string().optional(),
			type: Joi.string()
				.valid('apartment', 'villa', 'penthouse', 'townhouse', 'bungalow')
				.optional(),
			location: Joi.object({
				address: Joi.string().optional(),
				city: Joi.string().optional(),
				country: Joi.string().optional(),
				postal_code: Joi.string().optional(),
				coordinates: Joi.object({
					lat: Joi.number().min(-90).max(90).optional(),
					lng: Joi.number().min(-180).max(180).optional(),
				}).optional(),
			}).optional(),
			features: commonSchemas.stringArray.optional(),
			bedrooms: Joi.number().integer().min(0).optional(),
			bathrooms: Joi.number().integer().min(0).optional(),
			area: Joi.number().min(0).optional(),
			price: Joi.number().min(0).optional(),
			currency: Joi.string().valid('EUR', 'USD', 'GBP').optional(),
			images: Joi.array().items(Joi.string().uri()).optional(),
			status: Joi.string().valid('available', 'rented', 'maintenance').optional(),
		}),
	},

	// User schemas
	user: {
		create: Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string()
				.min(8)
				.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
				.required(),
			first_name: Joi.string().min(1).max(50).required(),
			last_name: Joi.string().min(1).max(50).required(),
			role: Joi.string().valid('admin', 'editor', 'author', 'viewer').default('viewer'),
			avatar: Joi.string().uri().optional(),
			bio: Joi.string().max(500).optional(),
		}),

		update: Joi.object({
			email: Joi.string().email().optional(),
			first_name: Joi.string().min(1).max(50).optional(),
			last_name: Joi.string().min(1).max(50).optional(),
			role: Joi.string().valid('admin', 'editor', 'author', 'viewer').optional(),
			avatar: Joi.string().uri().optional(),
			bio: Joi.string().max(500).optional(),
		}),

		login: Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string().required(),
		}),

		register: Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string()
				.min(8)
				.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
				.required(),
			first_name: Joi.string().min(1).max(50).required(),
			last_name: Joi.string().min(1).max(50).required(),
		}),
	},
};

// Custom validation functions
export const customValidators = {
	// Validate unique slug
	uniqueSlug: async (slug: string, excludeId?: string) => {
		// This would check the database for existing slug
		// Implementation depends on your database client
		return true; // Placeholder
	},

	// Validate file size
	fileSize: (maxSize: number) => {
		return (value: any) => {
			if (value && value.size > maxSize) {
				throw new Error(`File size exceeds ${maxSize} bytes`);
			}
			return value;
		};
	},

	// Validate file type
	fileType: (allowedTypes: string[]) => {
		return (value: any) => {
			if (value && !allowedTypes.includes(value.mimetype)) {
				throw new Error(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`);
			}
			return value;
		};
	},
};
