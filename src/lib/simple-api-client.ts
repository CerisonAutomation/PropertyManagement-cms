// Simplified API Client - Core patterns from major CMS platforms

import { supabase } from '@/integrations/supabase/client';

export interface SimpleAPIResponse<T> {
  data: T;
  error?: any;
  count?: number;
}

export interface SimpleQueryOptions {
  select?: string[];
  filter?: Record<string, any>;
  orderBy?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export class SimpleAPIClient {
  private static instance: SimpleAPIClient;

  private constructor() {}

  static getInstance(): SimpleAPIClient {
    if (!SimpleAPIClient.instance) {
      SimpleAPIClient.instance = new SimpleAPIClient();
    }
    return SimpleAPIClient.instance;
  }

  // Basic CRUD operations
  async findAll<T = any>(
    collection: string,
    options?: SimpleQueryOptions
  ): Promise<SimpleAPIResponse<T[]>> {
    try {
      let query = supabase.from(collection);

      // Apply field selection
      if (options?.select) {
        query = query.select(options.select.join(','));
      }

      // Apply filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([field, value]) => {
          if (Array.isArray(value)) {
            query = query.in(field, value);
          } else if (typeof value === 'object' && value !== null) {
            // Handle range queries
            if (value.gte !== undefined) {
              query = query.gte(field, value.gte);
            }
            if (value.lte !== undefined) {
              query = query.lte(field, value.lte);
            }
          } else {
            query = query.eq(field, value);
          }
        });
      }

      // Apply search
      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
      }

      // Apply ordering
      if (options?.orderBy) {
        const [field, direction] = options.orderBy.split('.');
        query = query.order(field, { ascending: direction !== 'desc' });
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 25) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        count: count
      };
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error);
      throw error;
    }
  }

  async findOne<T = any>(
    collection: string,
    id: string,
    options?: SimpleQueryOptions
  ): Promise<SimpleAPIResponse<T>> {
    try {
      let query = supabase.from(collection);

      // Apply field selection
      if (options?.select) {
        query = query.select(options.select.join(','));
      }

      const { data, error } = await query.eq('id', id).single();

      if (error) throw error;

      return {
        data: data as T
      };
    } catch (error) {
      console.error(`Error fetching ${collection} with id ${id}:`, error);
      throw error;
    }
  }

  async create<T = any>(
    collection: string,
    data: Partial<T>,
    options?: SimpleQueryOptions
  ): Promise<SimpleAPIResponse<T>> {
    try {
      let query = supabase.from(collection);

      // Apply field selection
      if (options?.select) {
        query = query.select(options.select.join(','));
      }

      const { data: result, error } = await query.insert(data as any).select().single();

      if (error) throw error;

      return {
        data: result as T
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
    options?: SimpleQueryOptions
  ): Promise<SimpleAPIResponse<T>> {
    try {
      let query = supabase.from(collection);

      // Apply field selection
      if (options?.select) {
        query = query.select(options.select.join(','));
      }

      const { data: result, error } = await query
        .update(data as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: result as T
      };
    } catch (error) {
      console.error(`Error updating ${collection} with id ${id}:`, error);
      throw error;
    }
  }

  async delete(
    collection: string,
    id: string
  ): Promise<SimpleAPIResponse<null>> {
    try {
      const { error } = await supabase.from(collection).delete().eq('id', id);

      if (error) throw error;

      return {
        data: null
      };
    } catch (error) {
      console.error(`Error deleting ${collection} with id ${id}:`, error);
      throw error;
    }
  }

  // Advanced query methods
  async count(collection: string, options?: SimpleQueryOptions): Promise<number> {
    try {
      let query = supabase.from(collection);

      // Apply filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([field, value]) => {
          if (Array.isArray(value)) {
            query = query.in(field, value);
          } else if (typeof value === 'object' && value !== null) {
            if (value.gte !== undefined) {
              query = query.gte(field, value.gte);
            }
            if (value.lte !== undefined) {
              query = query.lte(field, value.lte);
            }
          } else {
            query = query.eq(field, value);
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
    options?: SimpleQueryOptions
  ): Promise<SimpleAPIResponse<T[]>> {
    return this.findAll<T>(collection, {
      ...options,
      search: searchTerm
    });
  }

  // Batch operations
  async createMany<T = any>(
    collection: string,
    items: Partial<T>[]
  ): Promise<SimpleAPIResponse<T[]>> {
    try {
      const { data, error } = await supabase
        .from(collection)
        .insert(items as any)
        .select();

      if (error) throw error;

      return {
        data: data as T[]
      };
    } catch (error) {
      console.error(`Error creating multiple ${collection}:`, error);
      throw error;
    }
  }

  async updateMany<T = any>(
    collection: string,
    updates: Array<{ id: string; data: Partial<T> }>
  ): Promise<SimpleAPIResponse<T[]>> {
    try {
      const results = await Promise.all(
        updates.map(({ id, data }) => this.update<T>(collection, id, data))
      );

      return {
        data: results.map(r => r.data!).filter(Boolean) as T[]
      };
    } catch (error) {
      console.error(`Error updating multiple ${collection}:`, error);
      throw error;
    }
  }

  async deleteMany(
    collection: string,
    ids: string[]
  ): Promise<SimpleAPIResponse<null>> {
    try {
      const { error } = await supabase
        .from(collection)
        .delete()
        .in('id', ids);

      if (error) throw error;

      return {
        data: null
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
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl,
          upsert: options?.upsert,
          contentType: options?.contentType,
          metadata: options?.metadata
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
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return data.publicUrl;
    } catch (error) {
      console.error(`Error getting public URL for ${bucket}/${path}:`, error);
      throw error;
    }
  }

  async deleteFile(bucket: string, paths: string[]): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting files from ${bucket}:`, error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribe<T = any>(
    collection: string,
    callback: (payload: { 
      eventType: 'INSERT' | 'UPDATE' | 'DELETE'; 
      new: T; 
      old: T; 
    }) => void
  ): () => void => {
    const channel = supabase
      .channel(`${collection}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: collection },
        (payload) => {
          callback(payload as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

// Export singleton instance
export const apiClient = SimpleAPIClient.getInstance();
