import { createError } from '@/api/utils/error';
import { createErrorResponse, createSuccessResponse } from '@/api/utils/response';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();
export const authRouter = router;

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

const registerSchema = z.object({
	name: z.string().min(2).max(80),
	email: z.string().email(),
	password: z.string().min(8),
	role: z.enum(['viewer', 'editor', 'admin']).optional(),
});

type UserRecord = {
	id: string;
	name: string;
	email: string;
	passwordHash: string;
	role: 'viewer' | 'editor' | 'admin';
};

const users = new Map<string, UserRecord>();

const getJwtSecret = () => {
	const secret = process.env.JWT_SECRET;
	if (!secret && process.env.NODE_ENV === 'production') {
		throw createError('AUTH_CONFIGURATION_ERROR', 'JWT secret is not configured', 500);
	}
	return secret ?? 'dev-only-jwt-secret-change-me';
};

const getPermissions = (role: UserRecord['role']) => {
	if (role === 'admin') return ['*'];
	if (role === 'editor')
		return ['pages.read', 'pages.update', 'properties.read', 'properties.update'];
	return ['pages.read', 'properties.read'];
};

router.post('/register', async (req, res) => {
	try {
		const payload = registerSchema.parse(req.body);
		const emailKey = payload.email.trim().toLowerCase();

		if (users.has(emailKey)) {
			return res.status(409).json(createErrorResponse('USER_EXISTS', 'User already exists'));
		}

		const passwordHash = await bcrypt.hash(payload.password, 12);
		const user: UserRecord = {
			id: `user_${Date.now()}`,
			name: payload.name,
			email: emailKey,
			passwordHash,
			role: payload.role ?? 'viewer',
		};

		users.set(emailKey, user);

		const token = jwt.sign(
			{
				id: user.id,
				email: user.email,
				role: user.role,
				permissions: getPermissions(user.role),
			},
			getJwtSecret(),
			{ expiresIn: '24h' }
		);

		return res.status(201).json(
			createSuccessResponse(
				{
					token,
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role,
					},
				},
				'Registration successful'
			)
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res
				.status(400)
				.json(
					createErrorResponse('VALIDATION_ERROR', 'Invalid registration payload', error.flatten())
				);
		}

		return res
			.status(500)
			.json(createErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error'));
	}
});

router.post('/login', async (req, res) => {
	try {
		const payload = loginSchema.parse(req.body);
		const emailKey = payload.email.trim().toLowerCase();

		const user = users.get(emailKey);
		if (!user) {
			return res
				.status(401)
				.json(createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password'));
		}

		const isValidPassword = await bcrypt.compare(payload.password, user.passwordHash);
		if (!isValidPassword) {
			return res
				.status(401)
				.json(createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password'));
		}

		const token = jwt.sign(
			{
				id: user.id,
				email: user.email,
				role: user.role,
				permissions: getPermissions(user.role),
			},
			getJwtSecret(),
			{ expiresIn: '24h' }
		);

		return res.json(
			createSuccessResponse(
				{
					token,
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role,
					},
				},
				'Login successful'
			)
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res
				.status(400)
				.json(createErrorResponse('VALIDATION_ERROR', 'Invalid login payload', error.flatten()));
		}

		return res
			.status(500)
			.json(createErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error'));
	}
});

router.post('/refresh', (req, res) => {
	try {
		const schema = z.object({ token: z.string().min(1) });
		const { token } = schema.parse(req.body);
		const decoded = jwt.verify(token, getJwtSecret()) as {
			id: string;
			email: string;
			role: UserRecord['role'];
			permissions?: string[];
		};

		const nextToken = jwt.sign(
			{
				id: decoded.id,
				email: decoded.email,
				role: decoded.role,
				permissions: decoded.permissions ?? getPermissions(decoded.role),
			},
			getJwtSecret(),
			{ expiresIn: '24h' }
		);

		return res.json(createSuccessResponse({ token: nextToken }, 'Token refreshed successfully'));
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res
				.status(400)
				.json(createErrorResponse('VALIDATION_ERROR', 'Refresh token is required'));
		}

		return res.status(401).json(createErrorResponse('INVALID_TOKEN', 'Invalid or expired token'));
	}
});

export default router;
