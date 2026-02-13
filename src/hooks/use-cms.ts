import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface CmsContent {
	id: string;
	section_key: string;
	section_label: string;
	content: Json;
	sort_order: number;
	is_visible: boolean;
	updated_at: string;
}

export interface CmsPage {
	id: string;
	slug: string;
	title: string;
	content: Json;
	meta_title: string | null;
	meta_description: string | null;
	status: 'draft' | 'published' | 'archived';
	template: 'default' | 'landing' | 'blog' | 'portfolio';
	sort_order: number;
	created_at: string;
	updated_at: string;
	published_at: string | null;
}

export interface CmsSetting {
	id: string;
	key: string;
	value: Json;
	updated_at: string;
}

export interface CmsNavigation {
	id: string;
	label: string;
	href: string;
	sort_order: number;
	is_active: boolean;
	created_at: string;
}

export function useCmsPages() {
	return useQuery({
		queryKey: ['cms-pages'],
		queryFn: async () => {
			const { data, error } = await supabase.from('cms_pages').select('*').order('sort_order');
			if (error) throw error;
			return data as CmsPage[];
		},
	});
}

export function useCmsPage(slug: string) {
	return useQuery({
		queryKey: ['cms-page', slug],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('cms_pages')
				.select('*')
				.eq('slug', slug)
				.single();
			if (error) throw error;
			return data as CmsPage;
		},
	});
}

export function useCmsContent() {
	return useQuery({
		queryKey: ['cms-content'],
		queryFn: async () => {
			const { data, error } = await supabase.from('cms_content').select('*').order('sort_order');
			if (error) throw error;
			return data as CmsContent[];
		},
	});
}

export function useCmsSection(sectionKey: string) {
	return useQuery({
		queryKey: ['cms-content', sectionKey],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('cms_content')
				.select('*')
				.eq('section_key', sectionKey)
				.single();
			if (error) throw error;
			return data as CmsContent;
		},
	});
}

export function useCmsSettings() {
	return useQuery({
		queryKey: ['cms-settings'],
		queryFn: async () => {
			const { data, error } = await supabase.from('cms_settings').select('*').order('key');
			if (error) throw error;
			return data as CmsSetting[];
		},
	});
}

export function useCmsNavigation() {
	return useQuery({
		queryKey: ['cms-navigation'],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('cms_navigation')
				.select('*')
				.eq('is_active', true)
				.order('sort_order');
			if (error) throw error;
			return data as CmsNavigation[];
		},
	});
}

export function useUpdateCmsPage() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...updates }: Partial<CmsPage> & { id: string }) => {
			const { error } = await supabase.from('cms_pages').update(updates).eq('id', id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['cms-pages'] });
		},
	});
}

export function useCreateCmsPage() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (page: Omit<CmsPage, 'id' | 'created_at' | 'updated_at'>) => {
			const { data, error } = await supabase.from('cms_pages').insert(page).select().single();
			if (error) throw error;
			return data as CmsPage;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['cms-pages'] });
		},
	});
}

export function useDeleteCmsPage() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const { error } = await supabase.from('cms_pages').delete().eq('id', id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['cms-pages'] });
		},
	});
}

export function useUpdateCmsContent() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({
			sectionKey,
			content,
			isVisible,
		}: { sectionKey: string; content: Json; isVisible?: boolean }) => {
			const update: Record<string, Json | boolean> = { content };
			if (isVisible !== undefined) update.is_visible = isVisible;
			const { error } = await supabase
				.from('cms_content')
				.update(update)
				.eq('section_key', sectionKey);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['cms-content'] });
		},
	});
}

export function useUpdateCmsSetting() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ key, value }: { key: string; value: Json }) => {
			const { error } = await supabase.from('cms_settings').update({ value }).eq('key', key);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['cms-settings'] });
		},
	});
}

export function useUpdateCmsNavigation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (
			items: Array<{
				id: string;
				label: string;
				href: string;
				sort_order: number;
				is_active: boolean;
			}>
		) => {
			const { error } = await supabase.from('cms_navigation').upsert(items, { onConflict: 'id' });
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['cms-navigation'] });
		},
	});
}
