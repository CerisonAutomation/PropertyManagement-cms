import { auditLogger } from '@/lib/audit-logger';
import { Router } from 'express';
import { z } from 'zod';

const router = Router();
export const pagesRouter = router;

// Validation schemas
const createPageSchema = z.object({
	title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
	slug: z.string().min(1, 'Slug is required').max(255, 'Slug must be less than 255 characters'),
	content: z.object({}).optional(),
	template: z.enum(['default', 'landing', 'blog', 'portfolio']).default('default'),
	status: z.enum(['draft', 'published', 'archived']).default('draft'),
	sort_order: z.number().int().default(0),
	seo_title: z.string().max(60, 'SEO title must be less than 60 characters').optional(),
	seo_description: z
		.string()
		.max(160, 'SEO description must be less than 160 characters')
		.optional(),
	meta_image: z.string().optional(),
});

const updatePageSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(255, 'Title must be less than 255 characters')
		.optional(),
	slug: z
		.string()
		.min(1, 'Slug is required')
		.max(255, 'Slug must be less than 255 characters')
		.optional(),
	content: z.object({}).optional(),
	template: z.enum(['default', 'landing', 'blog', 'portfolio']).optional(),
	status: z.enum(['draft', 'published', 'archived']).optional(),
	sort_order: z.number().int().optional(),
	seo_title: z.string().max(60, 'SEO title must be less than 60 characters').optional(),
	seo_description: z
		.string()
		.max(160, 'SEO description must be less than 160 characters')
		.optional(),
	meta_image: z.string().optional(),
});

// GET /pages - List all pages
router.get('/', async (req: any, res: any) => {
	try {
		const startTime = Date.now();

		// Parse query parameters
		const {
			limit = 10,
			offset = 0,
			sort = 'created_at.desc',
			filter = '{}',
			select = '*',
		} = req.query;

		// Convert parameters
		const limitNum = Number.parseInt(limit as string);
		const offsetNum = Number.parseInt(offset as string);
		const filterObj = typeof filter === 'string' ? JSON.parse(filter) : {};
		const selectArray = select === '*' ? ['*'] : (select as string).split(',');

		// Mock data - replace with database query
		const mockPages = [
			{
				id: 'page-1',
				title: 'Home',
				slug: 'home',
				content: { type: 'hero', data: { headline: 'Welcome to Christiano Property Management' } },
				template: 'default',
				status: 'published',
				sort_order: 1,
				seo_title: 'Christiano Property Management | Home',
				seo_description: 'Professional property management services in Malta',
				meta_image: '/images/home-hero.jpg',
				created_at: '2024-01-01T00:00:00.000Z',
				updated_at: '2024-01-01T00:00:00.000Z',
				published_at: '2024-01-01T00:00:00.000Z',
			},
			{
				id: 'page-2',
				title: 'About Us',
				slug: 'about',
				content: { type: 'text', data: 'Learn more about our company and team' },
				template: 'default',
				status: 'published',
				sort_order: 2,
				seo_title: 'About Christiano Property Management',
				seo_description: "Meet the team behind Malta's premier property management company",
				meta_image: '/images/about-team.jpg',
				created_at: '2024-01-02T00:00:00.000Z',
				updated_at: '2024-01-02T00:00:00.000Z',
				published_at: '2024-01-02T00:00:00.000Z',
			},
			{
				id: 'page-3',
				title: 'Services',
				slug: 'services',
				content: {
					type: 'features',
					data: { items: ['Full Management', 'Guest Services', 'Maintenance'] },
				},
				template: 'landing',
				status: 'published',
				sort_order: 3,
				seo_title: 'Property Management Services | Christiano',
				seo_description: 'Comprehensive property management services in Malta and Gozo',
				meta_image: '/images/services-hero.jpg',
				created_at: '2024-01-03T00:00:00.000Z',
				updated_at: '2024-01-03T00:00:00.000Z',
				published_at: '2024-01-03T00:00:00.000Z',
			},
			{
				id: 'page-4',
				title: 'Properties',
				slug: 'properties',
				content: { type: 'gallery', data: { properties: [] } },
				template: 'portfolio',
				status: 'published',
				sort_order: 4,
				seo_title: 'Properties for Rent & Sale | Christiano',
				seo_description: 'Browse our portfolio of premium properties in Malta',
				meta_image: '/images/properties-hero.jpg',
				created_at: '2024-01-04T00:00:00.000Z',
				updated_at: '2024-01-04T00:00:00.000Z',
				published_at: '2024-01-04T00:00:00.000Z',
			},
			{
				id: 'page-5',
				title: 'Blog',
				slug: 'blog',
				content: { type: 'text', data: 'Latest news and insights from Malta property market' },
				template: 'blog',
				status: 'published',
				sort_order: 5,
				seo_title: 'Property Management Blog | Christiano',
				seo_description: 'Expert insights on Malta real estate and property management',
				meta_image: '/images/blog-hero.jpg',
				created_at: '2024-01-05T00:00:00.000Z',
				updated_at: '2024-01-05T00:00:00.000Z',
				published_at: '2024-01-05T00:00:00.000Z',
			},
		];

		// Apply filters
		let filteredPages = mockPages;

		if (filterObj.status) {
			filteredPages = filteredPages.filter((page) => page.status === filterObj.status);
		}

		if (filterObj.template) {
			filteredPages = filteredPages.filter((page) => page.template === filterObj.template);
		}

		// Apply sorting
		const [sortField, sortDirection] = (sort as string).split('.');
		filteredPages.sort((a, b) => {
			let comparison = 0;

			if (
				sortField === 'created_at' ||
				sortField === 'updated_at' ||
				sortField === 'published_at'
			) {
				comparison =
					new Date(a[sortField as keyof typeof a]).getTime() -
					new Date(b[sortField as keyof typeof b]).getTime();
			}

			return sortDirection === 'desc' ? -comparison : comparison;
		});

		// Apply pagination
		const startIndex = offsetNum;
		const endIndex = startIndex + limitNum;
		const paginatedPages = filteredPages.slice(startIndex, endIndex);

		// Apply field selection
		const selectedPages = paginatedPages.map((page) => {
			const selected: any = {};

			if (selectArray.includes('*')) {
				return page;
			}

			selectArray.forEach((field: string) => {
				if (page[field as keyof typeof page] !== undefined) {
					selected[field] = page[field as keyof typeof page];
				}
			});

			return selected;
		});

		// Log the request
		auditLogger.log('PAGES_LIST', {
			filter: filterObj,
			sort,
			limit: limitNum,
			offset: offsetNum,
			resultCount: selectedPages.length,
			timestamp: new Date(),
			ip: req.ip,
		});

		res.json({
			success: true,
			data: selectedPages,
			meta: {
				pagination: {
					total: filteredPages.length,
					limit: limitNum,
					offset: offsetNum,
					page: Math.floor(offsetNum / limitNum) + 1,
					totalPages: Math.ceil(filteredPages.length / limitNum),
				},
				timestamp: new Date().toISOString(),
				requestId: req.id,
				duration: Date.now() - startTime,
			},
		});
	} catch (error: any) {
		auditLogger.log('PAGES_ERROR', {
			error: error.message,
			endpoint: '/pages',
			timestamp: new Date(),
			ip: req.ip,
		});

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Internal server error',
			},
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
			},
		});
	}
});

// GET /pages/:id - Get single page
router.get('/:id', async (req: any, res: any) => {
	try {
		const startTime = Date.now();
		const { id } = req.params;

		// Mock data - replace with database query
		const mockPages = [
			{
				id: 'page-1',
				title: 'Home',
				slug: 'home',
				content: { type: 'hero', data: { headline: 'Welcome to Christiano Property Management' } },
				template: 'default',
				status: 'published',
				sort_order: 1,
				seo_title: 'Christiano Property Management | Home',
				seo_description: 'Professional property management services in Malta',
				meta_image: '/images/home-hero.jpg',
				created_at: '2024-01-01T00:00:00.000Z',
				updated_at: '2024-01-01T00:00:00.000Z',
				published_at: '2024-01-01T00:00:00.000Z',
			},
		];

		const page = mockPages.find((p) => p.id === id);

		if (!page) {
			return res.status(404).json({
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Page not found',
				},
				meta: {
					timestamp: new Date().toISOString(),
					requestId: req.id,
				},
			});
		}

		// Log the request
		auditLogger.log('PAGE_GET', {
			pageId: id,
			found: true,
			timestamp: new Date(),
			ip: req.ip,
		});

		res.json({
			success: true,
			data: page,
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
				duration: Date.now() - startTime,
			},
		});
	} catch (error: any) {
		auditLogger.log('PAGES_ERROR', {
			error: error.message,
			endpoint: '/pages/:id',
			timestamp: new Date(),
			ip: req.ip,
		});

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Internal server error',
			},
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
			},
		});
	}
});

// GET /pages/slug/:slug - Get page by slug
router.get('/slug/:slug', async (req: any, res: any) => {
	try {
		const startTime = Date.now();
		const { slug } = req.params;

		// Mock data - replace with database query
		const mockPages = [
			{
				id: 'page-1',
				title: 'Home',
				slug: 'home',
				content: { type: 'hero', data: { headline: 'Welcome to Christiano Property Management' } },
				template: 'default',
				status: 'published',
				sort_order: 1,
				seo_title: 'Christiano Property Management | Home',
				seo_description: 'Professional property management services in Malta',
				meta_image: '/images/home-hero.jpg',
				created_at: '2024-01-01T00:00:00.000Z',
				updated_at: '2024-01-01T00:00:00.000Z',
				published_at: '2024-01-01T00:00:00.000Z',
			},
		];

		const page = mockPages.find((p) => p.slug === slug);

		if (!page) {
			return res.status(404).json({
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Page not found',
				},
				meta: {
					timestamp: new Date().toISOString(),
					requestId: req.id,
				},
			});
		}

		// Log the request
		auditLogger.log('PAGE_GET_BY_SLUG', {
			slug,
			found: true,
			timestamp: new Date(),
			ip: req.ip,
		});

		res.json({
			success: true,
			data: page,
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
				duration: Date.now() - startTime,
			},
		});
	} catch (error: any) {
		auditLogger.log('PAGES_ERROR', {
			error: error.message,
			endpoint: '/pages/slug/:slug',
			timestamp: new Date(),
			ip: req.ip,
		});

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Internal server error',
			},
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
			},
		});
	}
});

// POST /pages - Create new page
router.post('/', async (req: any, res: any) => {
	try {
		const startTime = Date.now();

		// Validate input
		const validatedData = createPageSchema.parse(req.body);

		// Generate unique ID
		const id = `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Create page (mock implementation - replace with database insertion)
		const newPage = {
			id,
			...validatedData,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			published_at: validatedData.status === 'published' ? new Date().toISOString() : null,
		};

		// Log the creation
		auditLogger.log('PAGE_CREATE', {
			pageId: id,
			title: validatedData.title,
			slug: validatedData.slug,
			template: validatedData.template,
			status: validatedData.status,
			timestamp: new Date(),
			ip: req.ip,
		});

		res.status(201).json({
			success: true,
			data: newPage,
			message: 'Page created successfully',
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
				duration: Date.now() - startTime,
			},
		});
	} catch (error: any) {
		auditLogger.log('PAGES_ERROR', {
			error: error.message,
			endpoint: '/pages',
			timestamp: new Date(),
			ip: req.ip,
		});

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Internal server error',
			},
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
			},
		});
	}
});

// PUT /pages/:id - Update page
router.put('/:id', async (req: any, res: any) => {
	try {
		const startTime = Date.now();
		const { id } = req.params;

		// Validate input
		const validatedData = updatePageSchema.parse(req.body);

		// Update page (mock implementation - replace with database update)
		const updatedPage = {
			id,
			...validatedData,
			updated_at: new Date().toISOString(),
			published_at: validatedData.status === 'published' ? new Date().toISOString() : null,
		};

		// Log the update
		auditLogger.log('PAGE_UPDATE', {
			pageId: id,
			changes: Object.keys(validatedData),
			timestamp: new Date(),
			ip: req.ip,
		});

		res.json({
			success: true,
			data: updatedPage,
			message: 'Page updated successfully',
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
				duration: Date.now() - startTime,
			},
		});
	} catch (error: any) {
		auditLogger.log('PAGES_ERROR', {
			error: error.message,
			endpoint: '/pages/:id',
			timestamp: new Date(),
			ip: req.ip,
		});

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Internal server error',
			},
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
			},
		});
	}
});

// DELETE /pages/:id - Delete page
router.delete('/:id', async (req: any, res: any) => {
	try {
		const startTime = Date.now();
		const { id } = req.params;

		// Check if page exists (mock implementation - replace with database query)
		const mockPages = [
			{ id: 'page-1', title: 'Home' },
			{ id: 'page-2', title: 'About' },
			{ id: 'page-3', title: 'Services' },
		];

		const pageExists = mockPages.some((p) => p.id === id);

		if (!pageExists) {
			return res.status(404).json({
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Page not found',
				},
				meta: {
					timestamp: new Date().toISOString(),
					requestId: req.id,
				},
			});
		}

		// Log the deletion
		auditLogger.log('PAGE_DELETE', {
			pageId: id,
			timestamp: new Date(),
			ip: req.ip,
		});

		res.json({
			success: true,
			data: { id },
			message: 'Page deleted successfully',
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
				duration: Date.now() - startTime,
			},
		});
	} catch (error: any) {
		auditLogger.log('PAGES_ERROR', {
			error: error.message,
			endpoint: '/pages/:id',
			timestamp: new Date(),
			ip: req.ip,
		});

		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Internal server error',
			},
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
			},
		});
	}
});

export default router;
