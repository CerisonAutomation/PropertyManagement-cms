// Advanced REST API Routes - Combining patterns from Strapi, Directus, Payload, and Sanity

import { audit } from '@/api/middleware/audit';
import { authenticate, authorize } from '@/api/middleware/auth';
import { cache } from '@/api/middleware/cache';
import { rateLimit } from '@/api/middleware/rateLimit';
import { validate, validateQuery } from '@/api/middleware/validation';
import { createError } from '@/api/utils/error';
import { createPaginatedResponse, createSuccessResponse } from '@/api/utils/response';
import { apiClient } from '@/lib/simple-api-client';
import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';

const router = Router();

const parseJsonQueryParam = <T>(value: unknown, field: string): T | undefined => {
	if (value === undefined || value === null || value === '') return undefined;
	if (typeof value === 'object') return value as T;

	if (typeof value === 'string') {
		try {
			return JSON.parse(value) as T;
		} catch {
			throw createError('INVALID_QUERY_PARAM', `Invalid JSON for query parameter "${field}"`, 400);
		}
	}

	throw createError('INVALID_QUERY_PARAM', `Invalid value for query parameter "${field}"`, 400);
};

const parseNumberQueryParam = (value: unknown, field: string): number | undefined => {
	if (value === undefined || value === null || value === '') return undefined;

	const parsed = Number(value);
	if (!Number.isFinite(parsed)) {
		throw createError('INVALID_QUERY_PARAM', `Query parameter "${field}" must be a number`, 400);
	}

	return parsed;
};

const parseStringArrayQueryParam = (value: unknown, field: string): string[] | undefined => {
	if (value === undefined || value === null || value === '') return undefined;
	if (Array.isArray(value)) return value.map(String);

	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed.startsWith('[')) {
			const parsed = parseJsonQueryParam<unknown[]>(value, field);
			if (!Array.isArray(parsed)) {
				throw createError(
					'INVALID_QUERY_PARAM',
					`Query parameter "${field}" must be an array`,
					400
				);
			}
			return parsed.map(String);
		}

		return trimmed
			.split(',')
			.map((part) => part.trim())
			.filter(Boolean);
	}

	throw createError('INVALID_QUERY_PARAM', `Invalid value for query parameter "${field}"`, 400);
};

// =============================================================================
// PAGES API ROUTES
// =============================================================================

// GET /api/pages - List all pages with filtering, sorting, and pagination
router.get(
	'/pages',
	rateLimit({ max: 100, windowMs: 60000 }), // 100 requests per minute
	cache({ ttl: 300 }), // 5 minute cache
	validateQuery({
		select: { type: 'array', items: { type: 'string' }, optional: true },
		filter: { type: 'object', optional: true },
		sort: { type: 'string', optional: true },
		limit: { type: 'number', minimum: 1, maximum: 100, optional: true },
		offset: { type: 'number', minimum: 0, optional: true },
		search: { type: 'string', optional: true },
	}),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { select, filter, sort, limit, offset, search } = req.query as any;

			const options: any = {};
			if (select) options.select = select;
			if (filter) options.filter = parseJsonQueryParam<Record<string, unknown>>(filter, 'filter');
			if (sort) options.orderBy = sort;
			if (limit !== undefined) options.limit = parseNumberQueryParam(limit, 'limit');
			if (offset !== undefined) options.offset = parseNumberQueryParam(offset, 'offset');
			if (search) options.search = search;

			const result = await apiClient.findAll('pages', options);

			// Get total count for pagination
			const totalCount = await apiClient.count('pages', { filter: options.filter });

			res.json(
				createPaginatedResponse(result.data, totalCount, options.limit || 25, options.offset || 0)
			);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/pages/:id - Get a single page by ID
router.get(
	'/pages/:id',
	rateLimit({ max: 200, windowMs: 60000 }),
	cache({ ttl: 600 }), // 10 minute cache
	validate({ params: { id: { type: 'uuid', required: true } } }),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const { select } = req.query as any;

			const options: any = {};
			if (select) options.select = select;

			const result = await apiClient.findOne('pages', id, options);

			if (!result.data) {
				throw createError('PAGE_NOT_FOUND', 'Page not found', 404);
			}

			res.json(createSuccessResponse(result.data));
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/pages/slug/:slug - Get a page by slug
router.get(
	'/pages/slug/:slug',
	rateLimit({ max: 200, windowMs: 60000 }),
	cache({ ttl: 600 }),
	validate({ params: { slug: { type: 'string', required: true, minLength: 1 } } }),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { slug } = req.params;

			const result = await apiClient.findAll('pages', {
				filter: { slug },
				limit: 1,
			});

			if (!result.data || result.data.length === 0) {
				throw createError('PAGE_NOT_FOUND', 'Page not found', 404);
			}

			res.json(createSuccessResponse(result.data[0]));
		} catch (error) {
			next(error);
		}
	}
);

// POST /api/pages - Create a new page
router.post(
	'/pages',
	authenticate,
	authorize('pages', 'create'),
	rateLimit({ max: 50, windowMs: 60000 }),
	audit('page.create'),
	validate({
		body: {
			type: 'object',
			required: ['title', 'slug'],
			properties: {
				title: { type: 'string', minLength: 1, maxLength: 255 },
				slug: { type: 'string', minLength: 1, maxLength: 255 },
				content: { type: 'object', optional: true },
				template: {
					type: 'string',
					enum: ['default', 'landing', 'blog', 'portfolio'],
					optional: true,
				},
				status: {
					type: 'string',
					enum: ['draft', 'published', 'archived'],
					optional: true,
				},
				sort_order: { type: 'number', optional: true },
				seo_title: { type: 'string', maxLength: 60, optional: true },
				seo_description: { type: 'string', maxLength: 160, optional: true },
				meta_image: { type: 'string', optional: true },
			},
		},
	}),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const pageData = req.body;

			// Check if slug already exists
			const existing = await apiClient.findAll('pages', {
				filter: { slug: pageData.slug },
				limit: 1,
			});

			if (existing.data && existing.data.length > 0) {
				throw createError('SLUG_EXISTS', 'A page with this slug already exists', 409);
			}

			const result = await apiClient.create('pages', {
				...pageData,
				sort_order: pageData.sort_order || 0,
				status: pageData.status || 'draft',
				template: pageData.template || 'default',
				published_at: pageData.status === 'published' ? new Date().toISOString() : null,
			});

			res.status(201).json(createSuccessResponse(result.data, 'Page created successfully'));
		} catch (error) {
			next(error);
		}
	}
);

// PUT /api/pages/:id - Update a page
router.put(
	'/pages/:id',
	authenticate,
	authorize('pages', 'update'),
	rateLimit({ max: 50, windowMs: 60000 }),
	audit('page.update'),
	validate({
		params: { id: { type: 'uuid', required: true } },
		body: {
			type: 'object',
			properties: {
				title: { type: 'string', minLength: 1, maxLength: 255, optional: true },
				slug: { type: 'string', minLength: 1, maxLength: 255, optional: true },
				content: { type: 'object', optional: true },
				template: {
					type: 'string',
					enum: ['default', 'landing', 'blog', 'portfolio'],
					optional: true,
				},
				status: {
					type: 'string',
					enum: ['draft', 'published', 'archived'],
					optional: true,
				},
				sort_order: { type: 'number', optional: true },
				seo_title: { type: 'string', maxLength: 60, optional: true },
				seo_description: { type: 'string', maxLength: 160, optional: true },
				meta_image: { type: 'string', optional: true },
			},
		},
	}),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const updateData = req.body;

			// Check if page exists
			const existing = await apiClient.findOne('pages', id);
			if (!existing.data) {
				throw createError('PAGE_NOT_FOUND', 'Page not found', 404);
			}

			// If slug is being updated, check for conflicts
			if (updateData.slug && updateData.slug !== existing.data.slug) {
				const slugCheck = await apiClient.findAll('pages', {
					filter: { slug: updateData.slug },
					limit: 1,
				});

				if (slugCheck.data && slugCheck.data.length > 0) {
					throw createError('SLUG_EXISTS', 'A page with this slug already exists', 409);
				}
			}

			// Auto-set published_at when status changes to published
			if (updateData.status === 'published' && existing.data.status !== 'published') {
				updateData.published_at = new Date().toISOString();
			} else if (updateData.status !== 'published' && existing.data.status === 'published') {
				updateData.published_at = null;
			}

			const result = await apiClient.update('pages', id, updateData);

			res.json(createSuccessResponse(result.data, 'Page updated successfully'));
		} catch (error) {
			next(error);
		}
	}
);

// DELETE /api/pages/:id - Delete a page
router.delete(
	'/pages/:id',
	authenticate,
	authorize('pages', 'delete'),
	rateLimit({ max: 50, windowMs: 60000 }),
	audit('page.delete'),
	validate({ params: { id: { type: 'uuid', required: true } } }),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;

			// Check if page exists
			const existing = await apiClient.findOne('pages', id);
			if (!existing.data) {
				throw createError('PAGE_NOT_FOUND', 'Page not found', 404);
			}

			await apiClient.delete('pages', id);

			res.json(createSuccessResponse(null, 'Page deleted successfully'));
		} catch (error) {
			next(error);
		}
	}
);

// =============================================================================
// BLOG POSTS API ROUTES
// =============================================================================

// GET /api/blog-posts - List all blog posts
router.get(
	'/blog-posts',
	rateLimit({ max: 100, windowMs: 60000 }),
	cache({ ttl: 300 }),
	validateQuery({
		select: { type: 'array', items: { type: 'string' }, optional: true },
		filter: { type: 'object', optional: true },
		sort: { type: 'string', optional: true },
		limit: { type: 'number', minimum: 1, maximum: 100, optional: true },
		offset: { type: 'number', minimum: 0, optional: true },
		search: { type: 'string', optional: true },
		category: { type: 'string', optional: true },
		tags: { type: 'array', items: { type: 'string' }, optional: true },
	}),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { select, filter, sort, limit, offset, search, category, tags } = req.query as any;

			const options: any = {};
			if (select) options.select = select;
			if (filter) options.filter = parseJsonQueryParam<Record<string, unknown>>(filter, 'filter');
			if (sort) options.orderBy = sort;
			if (limit !== undefined) options.limit = parseNumberQueryParam(limit, 'limit');
			if (offset !== undefined) options.offset = parseNumberQueryParam(offset, 'offset');
			if (search) options.search = search;

			// Add category and tags to filter
			if (category) {
				options.filter = { ...options.filter, category };
			}
			if (tags) {
				options.filter = { ...options.filter, tags: parseStringArrayQueryParam(tags, 'tags') };
			}

			const result = await apiClient.findAll('blog_posts', options);
			const totalCount = await apiClient.count('blog_posts', { filter: options.filter });

			res.json(
				createPaginatedResponse(result.data, totalCount, options.limit || 25, options.offset || 0)
			);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/blog-posts/:slug - Get a blog post by slug
router.get(
	'/blog-posts/:slug',
	rateLimit({ max: 200, windowMs: 60000 }),
	cache({ ttl: 600 }),
	validate({ params: { slug: { type: 'string', required: true, minLength: 1 } } }),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { slug } = req.params;

			const result = await apiClient.findAll('blog_posts', {
				filter: { slug },
				limit: 1,
			});

			if (!result.data || result.data.length === 0) {
				throw createError('POST_NOT_FOUND', 'Blog post not found', 404);
			}

			res.json(createSuccessResponse(result.data[0]));
		} catch (error) {
			next(error);
		}
	}
);

// POST /api/blog-posts - Create a new blog post
router.post(
	'/blog-posts',
	authenticate,
	authorize('blog_posts', 'create'),
	rateLimit({ max: 50, windowMs: 60000 }),
	audit('blog_post.create'),
	validate({
		body: {
			type: 'object',
			required: ['title', 'slug', 'content'],
			properties: {
				title: { type: 'string', minLength: 1, maxLength: 255 },
				slug: { type: 'string', minLength: 1, maxLength: 255 },
				content: { type: 'object' },
				excerpt: { type: 'string', maxLength: 500, optional: true },
				featured_image: { type: 'string', optional: true },
				author: { type: 'string', optional: true },
				category: { type: 'string', optional: true },
				tags: { type: 'array', items: { type: 'string' }, optional: true },
				reading_time: { type: 'number', optional: true },
				status: {
					type: 'string',
					enum: ['draft', 'published'],
					optional: true,
				},
				seo_title: { type: 'string', maxLength: 60, optional: true },
				seo_description: { type: 'string', maxLength: 160, optional: true },
			},
		},
	}),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const postData = req.body;

			// Check if slug already exists
			const existing = await apiClient.findAll('blog_posts', {
				filter: { slug: postData.slug },
				limit: 1,
			});

			if (existing.data && existing.data.length > 0) {
				throw createError('SLUG_EXISTS', 'A blog post with this slug already exists', 409);
			}

			const result = await apiClient.create('blog_posts', {
				...postData,
				status: postData.status || 'draft',
				published_at: postData.status === 'published' ? new Date().toISOString() : null,
			});

			res.status(201).json(createSuccessResponse(result.data, 'Blog post created successfully'));
		} catch (error) {
			next(error);
		}
	}
);

// =============================================================================
// PROPERTIES API ROUTES
// =============================================================================

// GET /api/properties - List all properties
router.get(
	'/properties',
	rateLimit({ max: 100, windowMs: 60000 }),
	cache({ ttl: 300 }),
	validateQuery({
		select: { type: 'array', items: { type: 'string' }, optional: true },
		filter: { type: 'object', optional: true },
		sort: { type: 'string', optional: true },
		limit: { type: 'number', minimum: 1, maximum: 100, optional: true },
		offset: { type: 'number', minimum: 0, optional: true },
		search: { type: 'string', optional: true },
		type: { type: 'string', optional: true },
		status: { type: 'string', optional: true },
		minPrice: { type: 'number', optional: true },
		maxPrice: { type: 'number', optional: true },
		bedrooms: { type: 'number', optional: true },
		bathrooms: { type: 'number', optional: true },
	}),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const {
				select,
				filter,
				sort,
				limit,
				offset,
				search,
				type,
				status,
				minPrice,
				maxPrice,
				bedrooms,
				bathrooms,
			} = req.query as any;

			const options: any = {};
			if (select) options.select = select;
			if (filter) options.filter = parseJsonQueryParam<Record<string, unknown>>(filter, 'filter');
			if (sort) options.orderBy = sort;
			if (limit !== undefined) options.limit = parseNumberQueryParam(limit, 'limit');
			if (offset !== undefined) options.offset = parseNumberQueryParam(offset, 'offset');
			if (search) options.search = search;

			// Add property-specific filters
			const propertyFilter: any = { ...options.filter };
			if (type) propertyFilter.type = type;
			if (status) propertyFilter.status = status;
			const parsedMinPrice = parseNumberQueryParam(minPrice, 'minPrice');
			const parsedMaxPrice = parseNumberQueryParam(maxPrice, 'maxPrice');
			if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) {
				propertyFilter.price = {};
				if (parsedMinPrice !== undefined) propertyFilter.price.gte = parsedMinPrice;
				if (parsedMaxPrice !== undefined) propertyFilter.price.lte = parsedMaxPrice;
			}
			const parsedBedrooms = parseNumberQueryParam(bedrooms, 'bedrooms');
			const parsedBathrooms = parseNumberQueryParam(bathrooms, 'bathrooms');
			if (parsedBedrooms !== undefined) propertyFilter.bedrooms = parsedBedrooms;
			if (parsedBathrooms !== undefined) propertyFilter.bathrooms = parsedBathrooms;

			options.filter = propertyFilter;

			const result = await apiClient.findAll('properties', options);
			const totalCount = await apiClient.count('properties', { filter: options.filter });

			res.json(
				createPaginatedResponse(result.data, totalCount, options.limit || 25, options.offset || 0)
			);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/properties/:id - Get a single property
router.get(
	'/properties/:id',
	rateLimit({ max: 200, windowMs: 60000 }),
	cache({ ttl: 600 }),
	validate({ params: { id: { type: 'uuid', required: true } } }),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params;
			const { select } = req.query as any;

			const options: any = {};
			if (select) options.select = select;

			const result = await apiClient.findOne('properties', id, options);

			if (!result.data) {
				throw createError('PROPERTY_NOT_FOUND', 'Property not found', 404);
			}

			res.json(createSuccessResponse(result.data));
		} catch (error) {
			next(error);
		}
	}
);

// =============================================================================
// MEDIA API ROUTES
// =============================================================================

// GET /api/media - List all media files
router.get(
	'/media',
	authenticate,
	authorize('media', 'read'),
	rateLimit({ max: 100, windowMs: 60000 }),
	cache({ ttl: 300 }),
	validateQuery({
		filter: { type: 'object', optional: true },
		sort: { type: 'string', optional: true },
		limit: { type: 'number', minimum: 1, maximum: 100, optional: true },
		offset: { type: 'number', minimum: 0, optional: true },
		search: { type: 'string', optional: true },
		type: { type: 'string', enum: ['image', 'video', 'document'], optional: true },
	}),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { filter, sort, limit, offset, search, type } = req.query as any;

			const options: any = {};
			if (filter) options.filter = parseJsonQueryParam<Record<string, unknown>>(filter, 'filter');
			if (sort) options.orderBy = sort;
			if (limit !== undefined) options.limit = parseNumberQueryParam(limit, 'limit');
			if (offset !== undefined) options.offset = parseNumberQueryParam(offset, 'offset');
			if (search) options.search = search;
			if (type) options.filter = { ...options.filter, type };

			const result = await apiClient.findAll('media', options);
			const totalCount = await apiClient.count('media', { filter: options.filter });

			res.json(
				createPaginatedResponse(result.data, totalCount, options.limit || 25, options.offset || 0)
			);
		} catch (error) {
			next(error);
		}
	}
);

// POST /api/media/upload - Upload a file
router.post(
	'/media/upload',
	authenticate,
	authorize('media', 'create'),
	rateLimit({ max: 20, windowMs: 60000 }), // Lower limit for uploads
	audit('media.upload'),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// This would typically use multer or similar for file uploads
			// For now, we'll simulate the upload process

			const uploadResult = await apiClient.uploadFile(
				'media',
				req.body.filename || 'unknown',
				req.file, // This would come from multer
				{
					cacheControl: '31536000', // 1 year
					upsert: false,
					contentType: req.file?.mimetype,
					metadata: {
						uploaded_by: req.user.id,
						original_name: req.file?.originalname,
						size: req.file?.size,
					},
				}
			);

			// Create media record in database
			const mediaRecord = await apiClient.create('media', {
				name: req.file?.originalname,
				url: uploadResult.data.path,
				type: req.file?.mimetype?.startsWith('image/')
					? 'image'
					: req.file?.mimetype?.startsWith('video/')
						? 'video'
						: 'document',
				size: req.file?.size,
				metadata: uploadResult.data,
				created_by: req.user.id,
			});

			res.status(201).json(createSuccessResponse(mediaRecord.data, 'File uploaded successfully'));
		} catch (error) {
			next(error);
		}
	}
);

// =============================================================================
// SEARCH API ROUTES
// =============================================================================

// GET /api/search - Global search across all content
router.get(
	'/search',
	rateLimit({ max: 50, windowMs: 60000 }),
	cache({ ttl: 300 }),
	validateQuery({
		q: { type: 'string', required: true, minLength: 2 },
		types: { type: 'array', items: { type: 'string' }, optional: true },
		limit: { type: 'number', minimum: 1, maximum: 50, optional: true },
		offset: { type: 'number', minimum: 0, optional: true },
	}),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { q, types, limit = 10, offset = 0 } = req.query as any;

			const searchTypes = parseStringArrayQueryParam(types, 'types') || [
				'pages',
				'blog_posts',
				'properties',
			];
			const safeLimit = parseNumberQueryParam(limit, 'limit') ?? 10;
			const safeOffset = parseNumberQueryParam(offset, 'offset') ?? 0;

			const searchPromises = searchTypes.map(async (type: string) => {
				try {
					const result = await apiClient.search(type, q, { limit: safeLimit, offset: safeOffset });
					return {
						type,
						results: result.data || [],
						total: result.count || 0,
					};
				} catch (error) {
					return { type, results: [], total: 0, error: error.message };
				}
			});

			const searchResults = await Promise.all(searchPromises);

			res.json(
				createSuccessResponse({
					query: q,
					results: searchResults,
					total: searchResults.reduce((sum, type) => sum + type.total, 0),
				})
			);
		} catch (error) {
			next(error);
		}
	}
);

// =============================================================================
// HEALTH AND STATUS ENDPOINTS
// =============================================================================

// GET /api/health - Health check endpoint
router.get(
	'/health',
	rateLimit({ max: 1000, windowMs: 60000 }),
	cache({ ttl: 30 }), // 30 second cache
	async (req: Request, res: Response) => {
		try {
			// Check database connection
			const dbCheck = await apiClient.findAll('pages', { limit: 1 });

			const health = {
				status: 'healthy',
				timestamp: new Date().toISOString(),
				version: process.env.npm_package_version || '1.0.0',
				environment: process.env.NODE_ENV || 'development',
				database: dbCheck.error ? 'unhealthy' : 'healthy',
				uptime: process.uptime(),
				memory: process.memoryUsage(),
				cache: 'healthy', // Would check Redis connection here
			};

			const statusCode = health.database === 'healthy' ? 200 : 503;
			res.status(statusCode).json(health);
		} catch (error) {
			res.status(503).json({
				status: 'unhealthy',
				timestamp: new Date().toISOString(),
				error: error.message,
			});
		}
	}
);

// GET /api/stats - API statistics
router.get(
	'/stats',
	authenticate,
	authorize('stats', 'read'),
	rateLimit({ max: 20, windowMs: 60000 }),
	cache({ ttl: 300 }),
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const [pagesCount, blogPostsCount, propertiesCount, mediaCount] = await Promise.all([
				apiClient.count('pages'),
				apiClient.count('blog_posts'),
				apiClient.count('properties'),
				apiClient.count('media'),
			]);

			const stats = {
				content: {
					pages: pagesCount,
					blog_posts: blogPostsCount,
					properties: propertiesCount,
					media: mediaCount,
				},
				api: {
					version: process.env.npm_package_version || '1.0.0',
					uptime: process.uptime(),
					memory: process.memoryUsage(),
				},
				timestamp: new Date().toISOString(),
			};

			res.json(createSuccessResponse(stats));
		} catch (error) {
			next(error);
		}
	}
);

export default router;
