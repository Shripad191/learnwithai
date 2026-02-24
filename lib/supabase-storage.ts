import { supabase } from './supabase';
import type {
    AnySavedContent,
    SavedContentRow,
    SavedContentListItem,
    StorageResult,
    ContentType,
    PaginatedResult,
    PaginationOptions,
} from '@/types/storage-types';
import { retryWithBackoff, createStorageError, logStorageError } from './storage-errors';

/**
 * Generate a unique key for saved content
 */
function generateKey(type: ContentType): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${type}_${timestamp}_${random}`;
}

/**
 * Get current user ID
 */
async function getCurrentUserId(): Promise<string> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error('User not authenticated');
    }

    return user.id;
}

/**
 * Save content to Supabase (insert or update)
 */
export async function saveContent(
    content: AnySavedContent,
    existingKey?: string
): Promise<StorageResult<SavedContentRow>> {
    try {
        const userId = await getCurrentUserId();
        const key = existingKey || generateKey(content.type);

        const result = await retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('saved_content')
                .upsert({
                    user_id: userId,
                    key,
                    value: content,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        });

        return {
            success: true,
            data: result as SavedContentRow,
        };
    } catch (error) {
        logStorageError(error, 'saveContent');
        return {
            success: false,
            error: createStorageError(error, 'Failed to save content'),
        };
    }
}

/**
 * Get specific content by key
 */
export async function getContent(key: string): Promise<StorageResult<SavedContentRow>> {
    try {
        const userId = await getCurrentUserId();

        const result = await retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('saved_content')
                .select('*')
                .eq('user_id', userId)
                .eq('key', key)
                .single();

            if (error) throw error;
            return data;
        });

        return {
            success: true,
            data: result as SavedContentRow,
        };
    } catch (error) {
        logStorageError(error, 'getContent');
        return {
            success: false,
            error: createStorageError(error, 'Failed to load content'),
        };
    }
}

/**
 * Get all saved content for current user
 */
export async function getAllContent(
    options?: PaginationOptions
): Promise<StorageResult<PaginatedResult<SavedContentListItem>>> {
    try {
        const userId = await getCurrentUserId();
        const page = options?.page || 1;
        const pageSize = options?.pageSize || 50;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const result = await retryWithBackoff(async () => {
            // Get total count
            const { count, error: countError } = await supabase
                .from('saved_content')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (countError) throw countError;

            // Get paginated data
            const { data, error } = await supabase
                .from('saved_content')
                .select('id, key, value, created_at, updated_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            // Transform to list items
            const items: SavedContentListItem[] = (data || []).map(row => ({
                id: row.id,
                key: row.key,
                type: row.value.type,
                metadata: row.value.metadata,
                created_at: row.created_at,
                updated_at: row.updated_at,
            }));

            return {
                items,
                total: count || 0,
                page,
                pageSize,
                hasMore: (count || 0) > to + 1,
            };
        });

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        logStorageError(error, 'getAllContent');
        return {
            success: false,
            error: createStorageError(error, 'Failed to load saved content'),
        };
    }
}

/**
 * Delete content by key
 */
export async function deleteContent(key: string): Promise<StorageResult<void>> {
    try {
        const userId = await getCurrentUserId();

        await retryWithBackoff(async () => {
            const { error } = await supabase
                .from('saved_content')
                .delete()
                .eq('user_id', userId)
                .eq('key', key);

            if (error) throw error;
        });

        return {
            success: true,
        };
    } catch (error) {
        logStorageError(error, 'deleteContent');
        return {
            success: false,
            error: createStorageError(error, 'Failed to delete content'),
        };
    }
}

/**
 * Search content by chapter name or subject
 */
export async function searchContent(
    query: string
): Promise<StorageResult<SavedContentListItem[]>> {
    try {
        const userId = await getCurrentUserId();
        const searchTerm = `%${query.toLowerCase()}%`;

        const result = await retryWithBackoff(async () => {
            const { data, error } = await supabase
                .from('saved_content')
                .select('id, key, value, created_at, updated_at')
                .eq('user_id', userId)
                .or(`value->metadata->>chapterName.ilike.${searchTerm},value->metadata->>subject.ilike.${searchTerm}`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            // Transform to list items
            const items: SavedContentListItem[] = (data || []).map(row => ({
                id: row.id,
                key: row.key,
                type: row.value.type,
                metadata: row.value.metadata,
                created_at: row.created_at,
                updated_at: row.updated_at,
            }));

            return items;
        });

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        logStorageError(error, 'searchContent');
        return {
            success: false,
            error: createStorageError(error, 'Failed to search content'),
        };
    }
}

/**
 * Get content count for current user
 */
export async function getContentCount(): Promise<StorageResult<number>> {
    try {
        const userId = await getCurrentUserId();

        const result = await retryWithBackoff(async () => {
            const { count, error } = await supabase
                .from('saved_content')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (error) throw error;
            return count || 0;
        });

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        logStorageError(error, 'getContentCount');
        return {
            success: false,
            error: createStorageError(error, 'Failed to get content count'),
        };
    }
}

/**
 * Delete all content for current user (use with caution)
 */
export async function deleteAllContent(): Promise<StorageResult<void>> {
    try {
        const userId = await getCurrentUserId();

        await retryWithBackoff(async () => {
            const { error } = await supabase
                .from('saved_content')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
        });

        return {
            success: true,
        };
    } catch (error) {
        logStorageError(error, 'deleteAllContent');
        return {
            success: false,
            error: createStorageError(error, 'Failed to delete all content'),
        };
    }
}
