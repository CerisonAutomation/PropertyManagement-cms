/**
 * Advanced Media Management System
 * Optimized image/video processing with Cloudinary
 */

import { supabase } from '@/integrations/supabase/client';

export interface MediaFile {
	id: string;
	filename: string;
	url: string;
	thumbnailUrl?: string;
	size: number;
	mimeType: string;
	width?: number;
	height?: number;
	duration?: number;
	altText?: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
}

type MediaRow = Record<string, unknown>;

const DB_FIELDS = {
	thumbnailUrl: 'thumbnail_url',
	mimeType: 'mime_type',
	altText: 'alt_text',
	createdAt: 'created_at',
	secureUrl: 'secure_url',
} as const;

function mapMediaRow(row: MediaRow): MediaFile {
	const thumbnailUrl =
		(row[DB_FIELDS.thumbnailUrl] as string | null | undefined) ??
		(row.thumbnailUrl as string | null | undefined);
	const mimeType =
		(row[DB_FIELDS.mimeType] as string | undefined) ?? (row.mimeType as string | undefined);
	const altText =
		(row[DB_FIELDS.altText] as string | null | undefined) ??
		(row.altText as string | null | undefined);
	const createdAt =
		(row[DB_FIELDS.createdAt] as string | undefined) ?? (row.createdAt as string | undefined);

	return {
		id: String(row.id),
		filename: String(row.filename),
		url: String(row.url),
		thumbnailUrl: thumbnailUrl ?? undefined,
		size: Number(row.size),
		mimeType: mimeType ?? '',
		width: (row.width as number | null | undefined) ?? undefined,
		height: (row.height as number | null | undefined) ?? undefined,
		duration: (row.duration as number | null | undefined) ?? undefined,
		altText: altText ?? undefined,
		metadata: (row.metadata as Record<string, unknown> | null | undefined) ?? undefined,
		createdAt: createdAt ?? '',
	};
}

export interface MediaUploadOptions {
	folder?: string;
	quality?: number;
	format?: string;
	transformation?: {
		width?: number;
		height?: number;
		crop?: string;
		quality?: number;
		format?: string;
	};
	generateThumbnail?: boolean;
	optimize?: boolean;
}

export class MediaManager {
	private cloudinaryConfig = {
		cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
		apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
		uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
	};

	async uploadFile(file: File, options: MediaUploadOptions = {}): Promise<MediaFile> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('upload_preset', this.cloudinaryConfig.uploadPreset);

		if (options.folder) {
			formData.append('folder', options.folder);
		}

		const transformation =
			options.transformation ??
			(options.quality || options.format
				? {
						quality: options.quality,
						format: options.format,
					}
				: undefined);

		if (transformation) {
			const transforms = this.buildTransformationString(transformation);
			formData.append('transformation', transforms);
		}

		try {
			// Upload to Cloudinary
			const response = await fetch(
				`https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/auto/upload`,
				{
					method: 'POST',
					body: formData,
				}
			);

			const cloudinaryResponse = await response.json();

			if (!response.ok) {
				throw new Error(cloudinaryResponse.error?.message || 'Upload failed');
			}

			// Save to Supabase
			const { data, error } = await supabase
				.from('media_files')
				.insert({
					filename: file.name,
					url: cloudinaryResponse[DB_FIELDS.secureUrl] ?? cloudinaryResponse.secureUrl,
					[DB_FIELDS.thumbnailUrl]:
						cloudinaryResponse.eager?.[0]?.[DB_FIELDS.secureUrl] ??
						cloudinaryResponse.eager?.[0]?.secureUrl,
					size: file.size,
					[DB_FIELDS.mimeType]: file.type,
					width: cloudinaryResponse.width,
					height: cloudinaryResponse.height,
					[DB_FIELDS.altText]: options.folder || '',
				})
				.select()
				.single();

			if (error) {
				throw error;
			}

			return mapMediaRow(data as MediaRow);
		} catch (error) {
			console.error('Upload error:', error);
			throw error;
		}
	}

	async upload(file: File, options: MediaUploadOptions = {}): Promise<MediaFile> {
		return this.uploadFile(file, options);
	}

	buildTransformationString(transform: NonNullable<MediaUploadOptions['transformation']>): string {
		const parts: string[] = [];

		if (transform.width) {
			parts.push(`w_${transform.width}`);
		}
		if (transform.height) {
			parts.push(`h_${transform.height}`);
		}
		if (transform.crop) {
			parts.push(`c_${transform.crop}`);
		}
		if (transform.quality) {
			parts.push(`q_${transform.quality}`);
		}
		if (transform.format) {
			parts.push(`f_${transform.format}`);
		}

		return parts.join(',');
	}

	async deleteFile(fileId: string): Promise<void> {
		const { error } = await supabase.from('media_files').delete().eq('id', fileId);

		if (error) {
			throw error;
		}
	}

	async getFiles(folder?: string): Promise<MediaFile[]> {
		let query = supabase.from('media_files').select('*').order('created_at', { ascending: false });

		if (folder) {
			query = query.ilike('url', `%/${folder}/%`);
		}

		const { data, error } = await query;

		if (error) {
			throw error;
		}

		return (data as MediaRow[] | null)?.map(mapMediaRow) ?? [];
	}

	async updateAltText(fileId: string, altText: string): Promise<MediaFile> {
		const { data, error } = await supabase
			.from('media_files')
			.update({ [DB_FIELDS.altText]: altText })
			.eq('id', fileId)
			.select()
			.single();

		if (error) {
			throw error;
		}

		return mapMediaRow(data as MediaRow);
	}

	generateOptimizedUrl(
		url: string,
		options: {
			width?: number;
			height?: number;
			quality?: 'auto' | number;
			format?: 'auto' | 'webp' | 'jpg' | 'png';
		} = {}
	): string {
		const baseUrl = url.split('/upload/')[1];
		if (!baseUrl) {
			return url;
		}

		const transforms: string[] = [];

		if (options.width) {
			transforms.push(`w_${options.width}`);
		}
		if (options.height) {
			transforms.push(`h_${options.height}`);
		}
		if (options.quality) {
			transforms.push(`q_${options.quality}`);
		}
		if (options.format) {
			transforms.push(`f_${options.format}`);
		}

		if (transforms.length === 0) {
			return url;
		}

		return `${url.split('/upload/')[0]}/upload/${transforms.join(',')}/${baseUrl}`;
	}

	async generateVideoThumbnail(videoUrl: string): Promise<string> {
		// Using Cloudinary's video thumbnail generation
		return this.generateOptimizedUrl(videoUrl, {
			width: 800,
			height: 450,
			format: 'jpg',
			quality: 80,
		});
	}
}

export const mediaManager = new MediaManager();
