import { auditLogger } from '@/lib/audit-logger';
import { Router } from 'express';
import { z } from 'zod';

const router = Router();
export const propertiesRouter = router;

// Validation schemas
const createPropertySchema = z.object({
	title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
	type: z.enum(['apartment', 'villa', 'townhouse', 'studio', 'penthouse']),
	location: z.string().min(1, 'Location is required'),
	price: z.number().min(0, 'Price must be positive'),
	bedrooms: z.number().int().min(1, 'Bedrooms must be at least 1'),
	bathrooms: z.number().int().min(1, 'Bathrooms must be at least 1'),
	area: z.number().min(1, 'Area must be positive'),
	description: z.string().optional(),
	amenities: z.array(z.string()).optional(),
	available: z.boolean().default(true),
});

const BASE_PROPERTIES = [
	{
		id: 1,
		title: 'Seaview Penthouse with Panoramic Views',
		type: 'penthouse',
		location: 'Sliema',
		price: 3500,
		bedrooms: 3,
		bathrooms: 2,
		area: 150,
		image: '/src/assets/portfolio-1.jpg',
		featured: true,
		rating: 4.97,
		reviews: 24,
		amenities: ['WiFi', 'AC', 'Parking', 'Sea View', 'Panoramic Terrace', 'Fully Furnished'],
		available: true,
		description:
			'Luxurious penthouse in prime Sliema location with breathtaking sea views and expansive terrace',
	},
	{
		id: 2,
		title: 'Harbour Terrace Apartment',
		type: 'apartment',
		location: 'Valletta',
		price: 2800,
		bedrooms: 2,
		bathrooms: 1,
		area: 110,
		image: '/src/assets/portfolio-2.jpg',
		featured: true,
		rating: 4.95,
		reviews: 18,
		amenities: ['WiFi', 'AC', 'Historic Building', 'Elevator', 'Double Glazing'],
		available: true,
		description: "Charming apartment in Valletta's historic harbour area with modern amenities",
	},
	{
		id: 3,
		title: 'Heritage Suite in Mdina',
		type: 'apartment',
		location: 'Mdina',
		price: 2200,
		bedrooms: 1,
		bathrooms: 1,
		area: 75,
		image: '/src/assets/portfolio-3.jpg',
		featured: false,
		rating: 4.98,
		reviews: 31,
		amenities: ['WiFi', 'AC', 'Historic Charm', 'Quiet Area'],
		available: true,
		description: "Intimate suite in Mdina's ancient walled city, perfect for couples",
	},
] as const;

// GET /properties - List all properties
router.get('/', async (req: any, res: any) => {
	try {
		const startTime = Date.now();

		// Parse query parameters
		const { limit = 10, offset = 0, sort = 'price.asc', filter = '{}', select = '*' } = req.query;

		// Convert parameters
		const limitNum = Number.parseInt(limit as string);
		const offsetNum = Number.parseInt(offset as string);
		const filterObj = typeof filter === 'string' ? JSON.parse(filter) : {};
		const selectArray = select === '*' ? ['*'] : (select as string).split(',');

		// Mock data - replace with database query
		const mockProperties = [
			...BASE_PROPERTIES,
			{
				id: 4,
				title: 'Family Villa with Pool',
				type: 'villa',
				location: 'Mellieha',
				price: 4500,
				bedrooms: 5,
				bathrooms: 4,
				area: 300,
				image: '/src/assets/portfolio-4.jpg',
				featured: true,
				rating: 5.0,
				reviews: 8,
				amenities: ['WiFi', 'AC', 'Pool', 'Garden', 'Parking'],
				available: false,
				description: 'Spacious villa in Mellieha with private pool and stunning views',
			},
			{
				id: 5,
				title: 'Penthouse with Panoramic Views',
				type: 'penthouse',
				location: 'Gzira',
				price: 3800,
				bedrooms: 3,
				bathrooms: 2,
				area: 150,
				image: '/src/assets/portfolio-2.jpg',
				featured: false,
				rating: 4.8,
				reviews: 22,
				amenities: ['WiFi', 'AC', 'Panoramic Terrace', 'Rooftop Access', 'Modern Kitchen'],
				available: true,
				description: "Stunning penthouse with 360-degree views from Gzira's historic citadel",
			},
			{
				id: 6,
				title: 'Cozy Beach Apartment',
				type: 'apartment',
				location: "St. Paul's Bay",
				price: 2500,
				bedrooms: 2,
				bathrooms: 1,
				area: 85,
				image: '/src/assets/portfolio-3.jpg',
				featured: false,
				rating: 4.6,
				reviews: 19,
				amenities: ['WiFi', 'AC', 'Sea View', 'Balcony', 'Modern Furnishings', 'Gym Access'],
				available: true,
				description:
					"Premium apartment in Malta's vibrant capital with luxury amenities and stunning sea views",
			},
			{
				id: 7,
				title: "Luxury Apartment in St. Julian's",
				type: 'apartment',
				location: "St. Julian's",
				price: 4200,
				bedrooms: 4,
				bathrooms: 2,
				area: 160,
				image: '/src/assets/portfolio-1.jpg',
				featured: false,
				rating: 4.9,
				reviews: 15,
				amenities: ['WiFi', 'AC', 'Sea View', 'Balcony', 'Modern Kitchen', 'Parking'],
				available: true,
				description: "Modern luxury apartment in the heart of Malta's entertainment district",
			},
		];

		// Apply filters
		let filteredProperties = mockProperties;

		if (filterObj.type) {
			filteredProperties = filteredProperties.filter(
				(property) => property.type === filterObj.type
			);
		}

		if (filterObj.location) {
			filteredProperties = filteredProperties.filter((property) =>
				property.location.toLowerCase().includes(filterObj.location.toLowerCase())
			);
		}

		if (filterObj.price) {
			const { gte, lte } = filterObj.price;
			if (gte) {
				filteredProperties = filteredProperties.filter((property) => property.price >= gte);
			}
			if (lte) {
				filteredProperties = filteredProperties.filter((property) => property.price <= lte);
			}
		}

		if (filterObj.bedrooms) {
			filteredProperties = filteredProperties.filter(
				(property) => property.bedrooms === filterObj.bedrooms
			);
		}

		if (filterObj.available !== undefined) {
			filteredProperties = filteredProperties.filter(
				(property) => property.available === filterObj.available
			);
		}

		// Apply sorting
		const [sortField, sortDirection] = (sort as string).split('.');
		filteredProperties.sort((a, b) => {
			let comparison = 0;

			if (
				sortField === 'price' ||
				sortField === 'bedrooms' ||
				sortField === 'bathrooms' ||
				sortField === 'area'
			) {
				comparison = a[sortField as keyof typeof a] - b[sortField as keyof typeof b];
			}

			if (sortField === 'rating' || sortField === 'reviews') {
				comparison = a[sortField as keyof typeof a] - b[sortField as keyof typeof b];
			}

			return sortDirection === 'desc' ? -comparison : comparison;
		});

		// Apply pagination
		const startIndex = offsetNum;
		const endIndex = startIndex + limitNum;
		const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

		// Apply field selection
		const selectedProperties = paginatedProperties.map((property) => {
			const selected: any = {};

			if (selectArray.includes('*')) {
				return property;
			}

			selectArray.forEach((field: string) => {
				if (property[field as keyof typeof property] !== undefined) {
					selected[field] = property[field as keyof typeof property];
				}
			});

			return selected;
		});

		// Log the request
		auditLogger.log('PROPERTIES_LIST', {
			filter: filterObj,
			sort,
			limit: limitNum,
			offset: offsetNum,
			resultCount: selectedProperties.length,
			timestamp: new Date(),
			ip: req.ip,
		});

		res.json({
			success: true,
			data: selectedProperties,
			meta: {
				pagination: {
					total: filteredProperties.length,
					limit: limitNum,
					offset: offsetNum,
					page: Math.floor(offsetNum / limitNum) + 1,
					totalPages: Math.ceil(filteredProperties.length / limitNum),
				},
				timestamp: new Date().toISOString(),
				requestId: req.id,
				duration: Date.now() - startTime,
			},
		});
	} catch (error: any) {
		auditLogger.log('PROPERTIES_ERROR', {
			error: error.message,
			endpoint: '/properties',
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

// GET /properties/:id - Get single property
router.get('/:id', async (req: any, res: any) => {
	try {
		const startTime = Date.now();
		const { id } = req.params;

		// Mock data - replace with database query
		const mockProperties = [...BASE_PROPERTIES];

		const property = mockProperties.find((p) => p.id === Number.parseInt(id));

		if (!property) {
			return res.status(404).json({
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Property not found',
				},
				meta: {
					timestamp: new Date().toISOString(),
					requestId: req.id,
				},
			});
		}

		// Log the request
		auditLogger.log('PROPERTY_GET', {
			propertyId: id,
			found: true,
			timestamp: new Date(),
			ip: req.ip,
		});

		res.json({
			success: true,
			data: property,
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
				duration: Date.now() - startTime,
			},
		});
	} catch (error: any) {
		auditLogger.log('PROPERTIES_ERROR', {
			error: error.message,
			endpoint: '/properties/:id',
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

// POST /properties - Create new property
router.post('/', async (req: any, res: any) => {
	try {
		const startTime = Date.now();

		// Validate input
		const validatedData = createPropertySchema.parse(req.body);

		// Generate unique ID
		const id = Math.max(...BASE_PROPERTIES.map((p) => p.id)) + 1;

		// Create property (mock implementation - replace with database insertion)
		const newProperty = {
			id,
			...validatedData,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		// Log the creation
		auditLogger.log('PROPERTY_CREATE', {
			propertyId: id,
			title: validatedData.title,
			type: validatedData.type,
			location: validatedData.location,
			price: validatedData.price,
			timestamp: new Date(),
			ip: req.ip,
		});

		res.status(201).json({
			success: true,
			data: newProperty,
			message: 'Property created successfully',
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
				duration: Date.now() - startTime,
			},
		});
	} catch (error: any) {
		auditLogger.log('PROPERTIES_ERROR', {
			error: error.message,
			endpoint: '/properties',
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

// PUT /properties/:id - Update property
router.put('/:id', async (req: any, res: any) => {
	try {
		const startTime = Date.now();
		const { id } = req.params;

		// Validate input
		const validatedData = createPropertySchema.partial().parse(req.body);

		// Update property (mock implementation - replace with database update)
		const updatedProperty = {
			id: Number.parseInt(id),
			...validatedData,
			updated_at: new Date().toISOString(),
		};

		// Log the update
		auditLogger.log('PROPERTY_UPDATE', {
			propertyId: id,
			changes: Object.keys(validatedData),
			timestamp: new Date(),
			ip: req.ip,
		});

		res.json({
			success: true,
			data: updatedProperty,
			message: 'Property updated successfully',
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
				duration: Date.now() - startTime,
			},
		});
	} catch (error: any) {
		auditLogger.log('PROPERTIES_ERROR', {
			error: error.message,
			endpoint: '/properties/:id',
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

// DELETE /properties/:id - Delete property
router.delete('/:id', async (req: any, res: any) => {
	try {
		const startTime = Date.now();
		const { id } = req.params;

		// Check if property exists (mock implementation - replace with database query)
		const mockProperties = [
			{ id: 1, title: 'Seaview Penthouse' },
			{ id: 2, title: 'Harbour Terrace Apartment' },
			{ id: 3, title: 'Heritage Suite in Mdina' },
		];

		const propertyExists = mockProperties.some((p) => p.id === Number.parseInt(id));

		if (!propertyExists) {
			return res.status(404).json({
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Property not found',
				},
				meta: {
					timestamp: new Date().toISOString(),
					requestId: req.id,
				},
			});
		}

		// Log the deletion
		auditLogger.log('PROPERTY_DELETE', {
			propertyId: id,
			timestamp: new Date(),
			ip: req.ip,
		});

		res.json({
			success: true,
			data: { id: Number.parseInt(id) },
			message: 'Property deleted successfully',
			meta: {
				timestamp: new Date().toISOString(),
				requestId: req.id,
				duration: Date.now() - startTime,
			},
		});
	} catch (error: any) {
		auditLogger.log('PROPERTIES_ERROR', {
			error: error.message,
			endpoint: '/properties/:id',
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
