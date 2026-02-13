import { supabase } from '@/integrations/supabase/client';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';

const router = Router();

// Validation schema for wizard submission
const wizardSubmissionSchema = z.object({
	status: z.enum(['not_listed', 'already_listed', 'switching']),
	listingUrl: z.string().url().optional(),
	currentManager: z.string().optional(),
	locality: z.string().min(1, 'Locality is required'),
	propertyType: z.string().min(1, 'Property type is required'),
	bedrooms: z.string().min(1, 'Bedrooms is required'),
	sleeps: z.string().min(1, 'Sleeps is required'),
	timeline: z.string().min(1, 'Timeline is required'),
	goal: z.string().min(1, 'Goal is required'),
	handsOff: z.boolean(),
	licenceReady: z.boolean(),
	upgradeBudget: z.string().min(1, 'Budget is required'),
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Valid email is required'),
	phone: z.string().min(5, 'Phone number is required'),
	preferredContact: z.enum(['whatsapp', 'phone', 'email']),
	consent: z.boolean().refine((val) => val === true, 'Consent is required'),
});

// Rate limiting for wizard submissions
const wizardRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 wizard submissions per 15 minutes
	message: {
		error: 'Too many wizard submissions. Please try again later.',
		retryAfter: '15 minutes',
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Helper functions
function computeTier(data: any): string {
	if (data.timeline === 'asap' && data.handsOff) return 'A';
	if (data.timeline === 'exploring') return 'C';
	return 'B';
}

function computePlan(data: any): string {
	return data.handsOff ? 'Complete' : 'Essentials';
}

// POST /api/wizard/submit - Submit wizard form
router.post('/submit', wizardRateLimit, async (req, res) => {
	try {
		// Validate request body
		const validatedData = wizardSubmissionSchema.parse(req.body);

		// Add metadata
		const submission = {
			status: validatedData.status,
			listing_url: validatedData.listingUrl || null,
			current_manager: validatedData.currentManager || null,
			locality: validatedData.locality,
			property_type: validatedData.propertyType,
			bedrooms: validatedData.bedrooms,
			sleeps: validatedData.sleeps,
			timeline: validatedData.timeline,
			goal: validatedData.goal,
			hands_off: validatedData.handsOff,
			licence_ready: validatedData.licenceReady,
			upgrade_budget: validatedData.upgradeBudget,
			name: validatedData.name,
			email: validatedData.email,
			phone: validatedData.phone,
			preferred_contact: validatedData.preferredContact,
			consent: validatedData.consent,
			tier: computeTier(validatedData),
			plan: computePlan(validatedData),
			ip_address: req.ip || null,
			user_agent: req.get('User-Agent') || null,
			submitted_at: new Date().toISOString(),
		};

		// Insert using raw SQL since table might not be in types
		const { data, error } = await supabase.rpc('insert_wizard_submission', {
			submission_data: submission,
		});

		if (error) {
			console.error('Wizard submission error:', error);
			return res.status(500).json({
				success: false,
				error: {
					code: 'DATABASE_ERROR',
					message: 'Failed to save submission',
				},
			});
		}

		// Return success response
		res.json({
			success: true,
			data: {
				id: data,
				tier: submission.tier,
				plan: submission.plan,
				submitted_at: submission.submitted_at,
			},
			meta: {
				timestamp: new Date().toISOString(),
				version: '1.0.0',
			},
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid form data',
					details: error.errors.reduce(
						(acc, err) => {
							acc[err.path.join('.')] = err.message;
							return acc;
						},
						{} as Record<string, string>
					),
				},
			});
		}

		console.error('Wizard submission error:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Internal server error',
			},
		});
	}
});

// GET /api/wizard/submissions - Get all submissions (admin only)
router.get('/submissions', async (req, res) => {
	try {
		// Use raw SQL to query the wizard submissions table
		const { data, error } = await supabase.rpc('get_wizard_submissions', { limit_count: 100 });

		if (error) {
			console.error('Error fetching wizard submissions:', error);
			return res.status(500).json({
				success: false,
				error: {
					code: 'DATABASE_ERROR',
					message: 'Failed to fetch submissions',
				},
			});
		}

		res.json({
			success: true,
			data: data || [],
			meta: {
				count: data?.length || 0,
				timestamp: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error('Error fetching wizard submissions:', error);
		res.status(500).json({
			success: false,
			error: {
				code: 'INTERNAL_ERROR',
				message: 'Internal server error',
			},
		});
	}
});

export default router;
