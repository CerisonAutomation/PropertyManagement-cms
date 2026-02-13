import { supabase } from '@/integrations/supabase/client';
import type { CMSEnhancedPage, CMSMedia, CMSQueryOptions } from '@/types/cms';
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Enhanced API Client for CMS
class EnhancedCMSClient {
	private queryClient: QueryClient;

	constructor(queryClient: QueryClient) {
		this.queryClient = queryClient;
	}

	// Pages API
	async getPages(options: CMSQueryOptions = {}) {
		const { limit = 10, offset = 0, filter, sort, search, fields } = options;

		let query = supabase
			.from('cms_pages_enhanced')
			.select(fields?.join(',') || '*', { count: 'exact' });

		// Apply filters
		if (filter) {
			filter.forEach((f) => {
				if (f.operator === 'eq') {
					query = query.eq(f.field, f.value);
				} else if (f.operator === 'neq') {
					query = query.neq(f.field, f.value);
				} else if (f.operator === 'like') {
					query = query.like(f.field, `%${f.value}%`);
				} else if (f.operator === 'ilike') {
					query = query.ilike(f.field, `%${f.value}%`);
				} else if (f.operator === 'in') {
					query = query.in(f.field, f.value);
				} else if (f.operator === 'contains') {
					query = query.contains(f.field, f.value);
				}
			});
		}

		// Apply search
		if (search) {
			query = query.or(`title.ilike.%${search}%,meta_description.ilike.%${search}%`);
		}

		// Apply sorting
		if (sort) {
			sort.forEach((s) => {
				query = query.order(s.field, { ascending: s.direction === 'asc' });
			});
		} else {
			query = query.order('published_at', { ascending: false });
		}

		// Apply pagination
		query = query.range(offset, offset + limit - 1);

		const { data, error, count } = await query;

		if (error) throw error;

		return {
			data: data || [],
			meta: {
				total_count: count || 0,
				current_page: Math.floor(offset / limit) + 1,
				per_page: limit,
				total_pages: Math.ceil((count || 0) / limit),
			},
		};
	}

	async getPageBySlug(slug: string) {
		const { data, error } = await supabase
			.from('cms_pages_enhanced')
			.select('*')
			.eq('slug', slug)
			.single();

		if (error) throw error;
		return data;
	}

	async createPage(page: Partial<CMSEnhancedPage>) {
		const { data, error } = await supabase
			.from('cms_pages_enhanced')
			.insert(page)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async updatePage(id: string, page: Partial<CMSEnhancedPage>) {
		const { data, error } = await supabase
			.from('cms_pages_enhanced')
			.update({ ...page, updated_at: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	async deletePage(id: string) {
		const { error } = await supabase.from('cms_pages_enhanced').delete().eq('id', id);

		if (error) throw error;
	}

	async incrementPageView(id: string) {
		const { error } = await supabase.rpc('increment_page_view', { p_page_id: id });
		if (error) throw error;
	}

	// Blog Posts API
	async getBlogPosts(options: CMSQueryOptions = {}) {
		const { limit = 10, offset = 0, filter, sort, search, fields } = options;

		let query = supabase
			.from('cms_blog_posts')
			.select(fields?.join(',') || '*', { count: 'exact' });

		// Apply filters
		if (filter) {
			filter.forEach((f) => {
				if (f.operator === 'eq') {
					query = query.eq(f.field, f.value);
				} else if (f.operator === 'neq') {
					query = query.neq(f.field, f.value);
				} else if (f.operator === 'ilike') {
					query = query.ilike(f.field, `%${f.value}%`);
				} else if (f.operator === 'in') {
					query = query.in(f.field, f.value);
				} else if (f.operator === 'contains') {
					query = query.contains(f.field, f.value);
				}
			});
		}

		// Apply search
		if (search) {
			query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
		}

		// Apply sorting
		if (sort) {
			sort.forEach((s) => {
				query = query.order(s.field, { ascending: s.direction === 'asc' });
			});
		} else {
			query = query.order('published_at', { ascending: false });
		}

		// Apply pagination
		query = query.range(offset, offset + limit - 1);

		const { data, error, count } = await query;

		if (error) throw error;

		return {
			data: data || [],
			meta: {
				total_count: count || 0,
				current_page: Math.floor(offset / limit) + 1,
				per_page: limit,
				total_pages: Math.ceil((count || 0) / limit),
			},
		};
	}

	async getBlogPostBySlug(slug: string) {
		const { data, error } = await supabase
			.from('cms_blog_posts')
			.select('*')
			.eq('slug', slug)
			.single();

		if (error) throw error;
		return data;
	}

	// Categories API
	async getCategories() {
		const { data, error } = await supabase.rpc('get_categories_with_counts');
		if (error) throw error;
		return data || [];
	}

	async getCategoryBySlug(slug: string) {
		const { data, error } = await supabase
			.from('cms_categories')
			.select('*')
			.eq('slug', slug)
			.single();

		if (error) throw error;
		return data;
	}

	// Properties API
	async searchProperties(
		options: {
			property_type?: string;
			min_price?: number;
			max_price?: number;
			min_bedrooms?: number;
			max_bedrooms?: number;
			min_area?: number;
			max_area?: number;
			features?: string[];
			location?: string;
			limit?: number;
			offset?: number;
		} = {}
	) {
		const {
			property_type,
			min_price,
			max_price,
			min_bedrooms,
			max_bedrooms,
			min_area,
			max_area,
			features,
			location,
			limit = 20,
			offset = 0,
		} = options;

		const { data, error } = await supabase.rpc('search_properties', {
			p_property_type: property_type,
			p_min_price: min_price,
			p_max_price: max_price,
			p_min_bedrooms: min_bedrooms,
			p_max_bedrooms: max_bedrooms,
			p_min_area: min_area,
			p_max_area: max_area,
			p_features: features,
			p_location: location,
			p_limit: limit,
			p_offset: offset,
		});

		if (error) throw error;
		return data || [];
	}

	async getPropertyBySlug(slug: string) {
		const { data, error } = await supabase
			.from('cms_properties')
			.select('*')
			.eq('slug', slug)
			.single();

		if (error) throw error;
		return data;
	}

	// Media API
	async getMediaFiles(
		options: {
			limit?: number;
			offset?: number;
			mime_type?: string;
			tags?: string[];
			category?: string;
			search?: string;
		} = {}
	) {
		const { limit = 50, offset = 0, mime_type, tags, category, search } = options;

		const { data, error } = await supabase.rpc('get_media_files', {
			p_limit: limit,
			p_offset: offset,
			p_mime_type: mime_type,
			p_tags: tags,
			p_category: category,
			p_search: search,
		});

		if (error) throw error;
		return data || [];
	}

	async uploadMedia(file: File, metadata: Partial<CMSMedia> = {}) {
		const fileName = `${Date.now()}-${file.name}`;
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('cms-media')
			.upload(fileName, file);

		if (uploadError) throw uploadError;

		// Get public URL
		const { data: urlData } = supabase.storage.from('cms-media').getPublicUrl(fileName);

		// Create media record
		const { data, error } = await supabase
			.from('cms_media')
			.insert({
				name: metadata.name || file.name,
				file_name: fileName,
				file_path: uploadData.path,
				file_size: file.size,
				mime_type: file.type,
				cdn_url: urlData.publicUrl,
				uploaded_by: (await supabase.auth.getUser()).data.user?.id,
				...metadata,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	}

	// Forms API
	async getForms() {
		const { data, error } = await supabase
			.from('cms_forms')
			.select('*')
			.eq('is_active', true)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	}

	async submitForm(
		formId: string,
		submissionData: Record<string, any>,
		metadata: {
			user_agent?: string;
			ip_address?: string;
			referrer?: string;
		} = {}
	) {
		const { data, error } = await supabase.rpc('submit_form', {
			p_form_id: formId,
			p_submission_data: submissionData,
			p_user_agent: metadata.user_agent,
			p_ip_address: metadata.ip_address,
			p_referrer: metadata.referrer,
		});

		if (error) throw error;
		return data;
	}

	async getFormSubmissions(formId: string) {
		const { data, error } = await supabase
			.from('cms_form_submissions')
			.select('*')
			.eq('form_id', formId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	}
}

// React Hooks
export function useEnhancedCMSClient() {
	const queryClient = useQueryClient();
	return new EnhancedCMSClient(queryClient);
}

// Pages Hooks
export function usePages(options: CMSQueryOptions = {}) {
	const client = useEnhancedCMSClient();

	return useQuery({
		queryKey: ['cms-pages', options],
		queryFn: () => client.getPages(options),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function usePageBySlug(slug: string) {
	const client = useEnhancedCMSClient();

	return useQuery({
		queryKey: ['cms-page', slug],
		queryFn: () => client.getPageBySlug(slug),
		enabled: !!slug,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

export function useCreatePage() {
	const queryClient = useQueryClient();
	const client = useEnhancedCMSClient();

	return useMutation({
		mutationFn: (page: Partial<CMSEnhancedPage>) => client.createPage(page),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
		},
	});
}

export function useUpdatePage() {
	const queryClient = useQueryClient();
	const client = useEnhancedCMSClient();

	return useMutation({
		mutationFn: ({ id, page }: { id: string; page: Partial<CMSEnhancedPage> }) =>
			client.updatePage(id, page),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
			queryClient.invalidateQueries({ queryKey: ['cms-page', id] });
		},
	});
}

export function useDeletePage() {
	const queryClient = useQueryClient();
	const client = useEnhancedCMSClient();

	return useMutation({
		mutationFn: (id: string) => client.deletePage(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cms-pages'] });
		},
	});
}

export function useIncrementPageView() {
	const client = useEnhancedCMSClient();

	return useMutation({
		mutationFn: (id: string) => client.incrementPageView(id),
	});
}

// Blog Posts Hooks
export function useBlogPosts(options: CMSQueryOptions = {}) {
	const client = useEnhancedCMSClient();

	return useQuery({
		queryKey: ['cms-blog-posts', options],
		queryFn: () => client.getBlogPosts(options),
		staleTime: 5 * 60 * 1000,
	});
}

export function useBlogPostBySlug(slug: string) {
	const client = useEnhancedCMSClient();

	return useQuery({
		queryKey: ['cms-blog-post', slug],
		queryFn: () => client.getBlogPostBySlug(slug),
		enabled: !!slug,
		staleTime: 10 * 60 * 1000,
	});
}

// Categories Hooks
export function useCategories() {
	const client = useEnhancedCMSClient();

	return useQuery({
		queryKey: ['cms-categories'],
		queryFn: () => client.getCategories(),
		staleTime: 15 * 60 * 1000, // 15 minutes
	});
}

export function useCategoryBySlug(slug: string) {
	const client = useEnhancedCMSClient();

	return useQuery({
		queryKey: ['cms-category', slug],
		queryFn: () => client.getCategoryBySlug(slug),
		enabled: !!slug,
		staleTime: 15 * 60 * 1000,
	});
}

// Properties Hooks
export function useProperties(
	searchOptions: Parameters<EnhancedCMSClient['searchProperties']>[0] = {}
) {
	const client = useEnhancedCMSClient();

	return useQuery({
		queryKey: ['cms-properties', searchOptions],
		queryFn: () => client.searchProperties(searchOptions),
		staleTime: 5 * 60 * 1000,
	});
}

export function usePropertyBySlug(slug: string) {
	const client = useEnhancedCMSClient();

	return useQuery({
		queryKey: ['cms-property', slug],
		queryFn: () => client.getPropertyBySlug(slug),
		enabled: !!slug,
		staleTime: 10 * 60 * 1000,
	});
}

// Media Hooks
export function useMediaFiles(options: Parameters<EnhancedCMSClient['getMediaFiles']>[0] = {}) {
	const client = useEnhancedCMSClient();

	return useQuery({
		queryKey: ['cms-media', options],
		queryFn: () => client.getMediaFiles(options),
		staleTime: 5 * 60 * 1000,
	});
}

export function useUploadMedia() {
	const queryClient = useQueryClient();
	const client = useEnhancedCMSClient();

	return useMutation({
		mutationFn: ({ file, metadata }: { file: File; metadata?: Partial<CMSMedia> }) =>
			client.uploadMedia(file, metadata),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cms-media'] });
		},
	});
}

// Forms Hooks
export function useForms() {
	const client = useEnhancedCMSClient();

	return useQuery({
		queryKey: ['cms-forms'],
		queryFn: () => client.getForms(),
		staleTime: 15 * 60 * 1000,
	});
}

export function useSubmitForm() {
	const queryClient = useQueryClient();
	const client = useEnhancedCMSClient();

	return useMutation({
		mutationFn: ({
			formId,
			submissionData,
			metadata,
		}: {
			formId: string;
			submissionData: Record<string, any>;
			metadata?: {
				user_agent?: string;
				ip_address?: string;
				referrer?: string;
			};
		}) => client.submitForm(formId, submissionData, metadata),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['cms-forms'] });
		},
	});
}

export function useFormSubmissions(formId: string) {
	const client = useEnhancedCMSClient();

	return useQuery({
		queryKey: ['cms-form-submissions', formId],
		queryFn: () => client.getFormSubmissions(formId),
		enabled: !!formId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
}

export default EnhancedCMSClient;
