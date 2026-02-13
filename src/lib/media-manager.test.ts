import { beforeEach, describe, expect, it, vi } from 'vitest';

function createMediaRow() {
	const row: Record<string, unknown> = {
		id: 'test-id',
		filename: 'test.jpg',
		url: 'https://example.com/test.jpg',
		size: 1024,
		width: 100,
		height: 100,
		metadata: {},
	};

	// biome-ignore lint/complexity/useLiteralKeys: preserving backend snake_case contract in test fixture.
	row['thumbnail_url'] = 'https://example.com/test-thumb.jpg';
	// biome-ignore lint/complexity/useLiteralKeys: preserving backend snake_case contract in test fixture.
	row['mime_type'] = 'image/jpeg';
	// biome-ignore lint/complexity/useLiteralKeys: preserving backend snake_case contract in test fixture.
	row['alt_text'] = 'Test';
	// biome-ignore lint/complexity/useLiteralKeys: preserving backend snake_case contract in test fixture.
	row['created_at'] = '2024-01-01';

	return row;
}

function createCloudinarySuccessPayload() {
	const payload: Record<string, unknown> = {
		width: 100,
		height: 100,
	};

	// biome-ignore lint/complexity/useLiteralKeys: preserving Cloudinary response key shape in test fixture.
	payload['secure_url'] = 'https://example.com/test.jpg';
	// biome-ignore lint/complexity/useLiteralKeys: preserving Cloudinary response key shape in test fixture.
	payload.eager = [{ ['secure_url']: 'https://example.com/test-thumb.jpg' }];

	return payload;
}

// Mock Supabase
const mockSupabase = {
	from: vi.fn(() => ({
		insert: vi.fn().mockReturnThis(),
		select: vi.fn().mockReturnThis(),
		single: vi.fn().mockResolvedValue({
			data: createMediaRow(),
			error: null,
		}),
	})),
	storage: {
		from: vi.fn(() => ({
			upload: vi.fn().mockResolvedValue({
				data: { path: 'test.jpg' },
				error: null,
			}),
			getPublicUrl: vi.fn().mockReturnValue({
				data: { publicUrl: 'https://example.com/test.jpg' },
			}),
		})),
	},
};

vi.mock('@/integrations/supabase/client', () => ({
	supabase: mockSupabase,
}));

describe('MediaManager', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => createCloudinarySuccessPayload(),
			})
		);
	});

	it('uploads file successfully', async () => {
		const { MediaManager } = await import('./media-manager');
		const manager = new MediaManager();

		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

		const result = await manager.upload(file, {
			folder: 'test',
			quality: 80,
		});

		expect(result).toBeDefined();
		expect(result.filename).toBe('test.jpg');
	});

	it('handles upload errors', async () => {
		const { MediaManager } = await import('./media-manager');
		const manager = new MediaManager();

		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				json: async () => ({
					error: { message: 'Upload failed' },
				}),
			})
		);

		const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

		await expect(manager.upload(file, { folder: 'test' })).rejects.toThrow('Upload failed');
	});

	it('builds transformation string correctly', async () => {
		const { MediaManager } = await import('./media-manager');
		const manager = new MediaManager();

		const transformation = {
			width: 100,
			height: 100,
			crop: 'fit' as const,
			quality: 80,
			format: 'auto' as const,
		};

		const result = manager.buildTransformationString(transformation);
		expect(result).toBe('w_100,h_100,c_fit,q_80,f_auto');
	});
});
