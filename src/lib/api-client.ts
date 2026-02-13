// Advanced API Client - Combining patterns from Strapi, Directus, Payload, and Sanity

import { supabase } from '@/integrations/supabase/client';
import type {
	APIResponse,
	QueryFilter,
	QueryOptions,
	RealtimeSubscription,
	ResponseMeta,
} from '@/types/cms';

export class AdvancedAPIClient {
	private static instance: AdvancedAPIClient;
	private subscriptions: Map<string, RealtimeSubscription> = new Map();

	private constructor() {}

	static getInstance(): AdvancedAPIClient {
		if (!AdvancedAPIClient.instance) {
			AdvancedAPIClient.instance = new AdvancedAPIClient();
		}
		return AdvancedAPIClient.instance;
	}

	// REST API Methods (Strapi-inspired)
	async findAll<T = any>(collection: string, options?: QueryOptions): Promise<APIResponse<T[]>> {
		try {
			let query = supabase.from(collection);

			// Apply fields selection
			if (options?.fields) {
				query = query.select(options.fields.join(','));
			}

			// Apply filters
			if (options?.filter) {
				options.filter.forEach((filter) => {
					const operator = this.getSupabaseOperator(filter.operator);
					if (operator === 'in' || operator === 'nin') {
						query = query.in(filter.field, filter.value);
					} else if (operator === 'contains') {
						query = query.like(filter.field, `%${filter.value}%`);
					} else if (operator === 'ncontains') {
						query = query.notLike(filter.field, `%${filter.value}%`);
					} else if (operator === 'starts_with') {
						query = query.like(filter.field, `${filter.value}%`);
					} else if (operator === 'nstarts_with') {
						query = query.notLike(filter.field, `${filter.value}%`);
					} else if (operator === 'ends_with') {
						query = query.like(filter.field, `%${filter.value}`);
					} else if (operator === 'nends_with') {
						query = query.notLike(filter.field, `%${filter.value}`);
					} else if (operator === 'between') {
						query = query.gte(filter.field, filter.value[0]).lte(filter.field, filter.value[1]);
					} else if (operator === 'nbetween') {
						query = query
							.lt(filter.field, filter.value[0])
							.or(`${filter.field}.gt.${filter.value[1]}`);
					} else if (operator === 'empty') {
						query = query.is(filter.field, null);
					} else if (operator === 'nempty') {
						query = query.not(filter.field, null);
					} else if (operator === 'null') {
						query = query.is(filter.field, null);
					} else if (operator === 'nnull') {
						query = query.not(filter.field, null);
					} else {
						// Standard operators
						query = query.filter(filter.field, operator, filter.value);
					}
				});
			}

			// Apply search (full-text search)
			if (options?.search) {
				query = query.textSearch('search', options.search);
			}

			// Apply sorting
			if (options?.sort) {
				options.sort.forEach((sort) => {
					query = query.order(sort.field, { ascending: sort.direction === 'asc' });
				});
			}

			// Apply pagination
			if (options?.limit) {
				query = query.limit(options.limit);
			}
			if (options?.offset) {
				query = query.range(options.offset, options.offset + (options.limit || 25) - 1);
			} else if (options?.page && options?.limit) {
				const offset = (options.page - 1) * options.limit;
				query = query.range(offset, offset + options.limit - 1);
			}

			const { data, error, count } = await query;

			if (error) throw error;

			const meta: ResponseMeta = {};
			if (count !== null) {
				meta.total_count = count;
				meta.filtered_count = count;
				if (options?.limit) {
					meta.page_count = Math.ceil(count / options.limit);
					meta.current_page = options.page || 1;
					meta.per_page = options.limit;
					meta.total_pages = Math.ceil(count / options.limit);
				}
			}

			return {
				data: data || [],
				meta,
			};
		} catch (error) {
			console.error(`Error fetching ${collection}:`, error);
			throw error;
		}
	}

	async findOne<T = any>(
		collection: string,
		id: string,
		options?: QueryOptions
	): Promise<APIResponse<T>> {
		try {
			let query = supabase.from(collection);

			// Apply fields selection
			if (options?.fields) {
				query = query.select(options.fields.join(','));
			}

			const { data, error } = await query.eq('id', id).single();

			if (error) throw error;

			return {
				data: data as T,
			};
		} catch (error) {
			console.error(`Error fetching ${collection} with id ${id}:`, error);
			throw error;
		}
	}

	async create<T = any>(
		collection: string,
		data: Partial<T>,
		options?: QueryOptions
	): Promise<APIResponse<T>> {
		try {
			let query = supabase.from(collection);

			// Apply fields selection
			if (options?.fields) {
				query = query.select(options.fields.join(','));
			}

			const { data: result, error } = await query
				.insert(data as any)
				.select()
				.single();

			if (error) throw error;

			return {
				data: result as T,
			};
		} catch (error) {
			console.error(`Error creating ${collection}:`, error);
			throw error;
		}
	}

	async update<T = any>(
		collection: string,
		id: string,
		data: Partial<T>,
		options?: QueryOptions
	): Promise<APIResponse<T>> {
		try {
			let query = supabase.from(collection);

			// Apply fields selection
			if (options?.fields) {
				query = query.select(options.fields.join(','));
			}

			const { data: result, error } = await query
				.update(data as any)
				.eq('id', id)
				.select()
				.single();

			if (error) throw error;

			return {
				data: result as T,
			};
		} catch (error) {
			console.error(`Error updating ${collection} with id ${id}:`, error);
			throw error;
		}
	}

	async delete(collection: string, id: string): Promise<APIResponse<null>> {
		try {
			const { error } = await supabase.from(collection).delete().eq('id', id);

			if (error) throw error;

			return {
				data: null,
			};
		} catch (error) {
			console.error(`Error deleting ${collection} with id ${id}:`, error);
			throw error;
		}
	}

	// GraphQL-like Query Builder (Directus-inspired)
	query<T = any>(collection: string) {
		return new QueryBuilder<T>(collection, this);
	}

	// Real-time Subscriptions (Directus-inspired)
	subscribe<T = any>(
		collection: string,
		action: 'create' | 'update' | 'delete',
		callback: (payload: T) => void
	): string {
		const subscriptionId = `${collection}_${action}_${Date.now()}`;

		const subscription = supabase
			.channel(`${collection}_changes`)
			.on('postgres_changes', { event: action, schema: 'public', table: collection }, (payload) => {
				callback(payload.new as T);
			})
			.subscribe();

		this.subscriptions.set(subscriptionId, {
			id: subscriptionId,
			collection,
			action,
			data: null as any,
		});

		return subscriptionId;
	}

	unsubscribe(subscriptionId: string): void {
		const subscription = this.subscriptions.get(subscriptionId);
		if (subscription) {
			supabase.removeChannel(subscriptionId);
			this.subscriptions.delete(subscriptionId);
		}
	}

	unsubscribeAll(): void {
		this.subscriptions.forEach((_, id) => {
			supabase.removeChannel(id);
		});
		this.subscriptions.clear();
	}

	// Helper methods
	private getSupabaseOperator(operator: QueryFilter['operator']): string {
		const operatorMap: Record<QueryFilter['operator'], string> = {
			eq: 'eq',
			neq: 'neq',
			lt: 'lt',
			lte: 'lte',
			gt: 'gt',
			gte: 'gte',
			in: 'in',
			nin: 'nin',
			contains: 'like',
			ncontains: 'notLike',
			starts_with: 'like',
			nstarts_with: 'notLike',
			ends_with: 'like',
			nends_with: 'notLike',
			between: 'gte',
			nbetween: 'lt',
			empty: 'is',
			nempty: 'not',
			null: 'is',
			nnull: 'not',
		};
		return operatorMap[operator] || 'eq';
	}

	// Advanced query methods
	async count(collection: string, options?: QueryOptions): Promise<number> {
		try {
			let query = supabase.from(collection);

			// Apply filters
			if (options?.filter) {
				options.filter.forEach((filter) => {
					const operator = this.getSupabaseOperator(filter.operator);
					if (operator === 'in' || operator === 'nin') {
						query = query.in(filter.field, filter.value);
					} else {
						query = query.filter(filter.field, operator, filter.value);
					}
				});
			}

			const { count, error } = await query.select('*', { count: 'exact', head: true });

			if (error) throw error;

			return count || 0;
		} catch (error) {
			console.error(`Error counting ${collection}:`, error);
			throw error;
		}
	}

	async search<T = any>(
		collection: string,
		searchTerm: string,
		options?: QueryOptions
	): Promise<APIResponse<T[]>> {
		return this.findAll<T>(collection, {
			...options,
			search: searchTerm,
		});
	}

	// Batch operations
	async createMany<T = any>(collection: string, items: Partial<T>[]): Promise<APIResponse<T[]>> {
		try {
			const { data, error } = await supabase
				.from(collection)
				.insert(items as any)
				.select();

			if (error) throw error;

			return {
				data: data as T[],
			};
		} catch (error) {
			console.error(`Error creating multiple ${collection}:`, error);
			throw error;
		}
	}

	async updateMany<T = any>(
		collection: string,
		updates: Array<{ id: string; data: Partial<T> }>
	): Promise<APIResponse<T[]>> {
		try {
			const results = await Promise.all(
				updates.map(({ id, data }) => this.update<T>(collection, id, data))
			);

			return {
				data: results.map((r) => r.data!).filter(Boolean) as T[],
			};
		} catch (error) {
			console.error(`Error updating multiple ${collection}:`, error);
			throw error;
		}
	}

	async deleteMany(collection: string, ids: string[]): Promise<APIResponse<null>> {
		try {
			const { error } = await supabase.from(collection).delete().in('id', ids);

			if (error) throw error;

			return {
				data: null,
			};
		} catch (error) {
			console.error(`Error deleting multiple ${collection}:`, error);
			throw error;
		}
	}

	// File operations
	async uploadFile(
		bucket: string,
		path: string,
		file: File,
		options?: {
			cacheControl?: string;
			upsert?: boolean;
			contentType?: string;
			metadata?: Record<string, any>;
		}
	): Promise<{ data: { path: string; fullPath: string } }> {
		try {
			const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
				cacheControl: options?.cacheControl,
				upsert: options?.upsert,
				contentType: options?.contentType,
				metadata: options?.metadata,
			});

			if (error) throw error;

			return { data: data! };
		} catch (error) {
			console.error(`Error uploading file to ${bucket}:`, error);
			throw error;
		}
	}

	async getPublicUrl(bucket: string, path: string): Promise<string> {
		try {
			const { data } = supabase.storage.from(bucket).getPublicUrl(path);

			return data.publicUrl;
		} catch (error) {
			console.error(`Error getting public URL for ${bucket}/${path}:`, error);
			throw error;
		}
	}

	async deleteFile(bucket: string, paths: string[]): Promise<void> {
		try {
			const { error } = await supabase.storage.from(bucket).remove(paths);

			if (error) throw error;
		} catch (error) {
			console.error(`Error deleting files from ${bucket}:`, error);
			throw error;
		}
	}
}

// Query Builder (Directus-inspired)
export class QueryBuilder<T = any> {
	private collection: string;
	private apiClient: AdvancedAPIClient;
	private options: QueryOptions = {};

	constructor(collection: string, apiClient: AdvancedAPIClient) {
		this.collection = collection;
		this.apiClient = apiClient;
	}

	select(fields: string[]): QueryBuilder<T> {
		this.options.fields = fields;
		return this;
	}

	filter(field: string, operator: QueryFilter['operator'], value: any): QueryBuilder<T> {
		if (!this.options.filter) {
			this.options.filter = [];
		}
		this.options.filter.push({ field, operator, value });
		return this;
	}

	sort(field: string, direction: 'asc' | 'desc' = 'asc'): QueryBuilder<T> {
		if (!this.options.sort) {
			this.options.sort = [];
		}
		this.options.sort.push({ field, direction });
		return this;
	}

	limit(count: number): QueryBuilder<T> {
		this.options.limit = count;
		return this;
	}

	offset(count: number): QueryBuilder<T> {
		this.options.offset = count;
		return this;
	}

	page(page: number, limit?: number): QueryBuilder<T> {
		this.options.page = page;
		if (limit) this.options.limit = limit;
		return this;
	}

	search(term: string): QueryBuilder<T> {
		this.options.search = term;
		return this;
	}

	async execute(): Promise<APIResponse<T[]>> {
		return this.apiClient.findAll<T>(this.collection, this.options);
	}

	async first(): Promise<APIResponse<T | null>> {
		const result = await this.apiClient.findAll<T>(this.collection, {
			...this.options,
			limit: 1,
		});
		return {
			data: result.data?.[0] || null,
			meta: result.meta,
		};
	}

	async count(): Promise<number> {
		return this.apiClient.count(this.collection, this.options);
	}
}

// Export singleton instance
export const apiClient = AdvancedAPIClient.getInstance();
