import type { SavedMindMap } from './storage';
import type { SavedSummary } from '@/types/storage-types';
import { saveContent } from './supabase-storage';
import { supabase } from './supabase';

/**
 * Check if localStorage has any saved data
 */
export function hasLocalStorageData(): boolean {
    if (typeof window === 'undefined') return false;

    try {
        const keys = Object.keys(localStorage);
        return keys.some(key => key.startsWith('mindmap_'));
    } catch {
        return false;
    }
}

/**
 * Get localStorage data for migration
 */
function getLocalStorageData(): SavedMindMap[] {
    if (typeof window === 'undefined') return [];

    try {
        const saved = localStorage.getItem('mindmap_saved_items');
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error reading localStorage:', error);
        return [];
    }
}

/**
 * Convert old SavedMindMap format to new SavedContent format
 */
function convertToNewFormat(oldItem: SavedMindMap): SavedSummary {
    return {
        type: 'summary',
        metadata: {
            chapterName: oldItem.chapterName,
            classLevel: oldItem.classLevel,
            subject: oldItem.subject,
            timestamp: oldItem.timestamp,
        },
        data: {
            summary: oldItem.summary,
            mindMapData: oldItem.mindMapData,
            chapterText: oldItem.chapterText,
        },
    };
}

/**
 * Migration result
 */
export interface MigrationResult {
    success: boolean;
    totalItems: number;
    migratedItems: number;
    failedItems: number;
    errors: string[];
}

/**
 * Migrate localStorage data to Supabase
 */
export async function migrateLocalStorageToSupabase(): Promise<MigrationResult> {
    const result: MigrationResult = {
        success: false,
        totalItems: 0,
        migratedItems: 0,
        failedItems: 0,
        errors: [],
    };

    try {
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            result.errors.push('User not authenticated');
            return result;
        }

        // Get localStorage data
        const localData = getLocalStorageData();
        result.totalItems = localData.length;

        if (localData.length === 0) {
            result.success = true;
            return result;
        }

        // Migrate each item
        for (const item of localData) {
            try {
                // Convert to new format
                const newContent = convertToNewFormat(item);

                // Save to Supabase
                const saveResult = await saveContent(newContent);

                if (saveResult.success) {
                    result.migratedItems++;
                } else {
                    result.failedItems++;
                    result.errors.push(
                        `Failed to migrate "${item.chapterName}": ${saveResult.error?.message || 'Unknown error'}`
                    );
                }
            } catch (error) {
                result.failedItems++;
                result.errors.push(
                    `Error migrating "${item.chapterName}": ${error instanceof Error ? error.message : 'Unknown error'}`
                );
            }
        }

        // Migration is successful if at least some items were migrated
        result.success = result.migratedItems > 0;

        return result;
    } catch (error) {
        result.errors.push(
            `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        return result;
    }
}

/**
 * Clear localStorage after successful migration
 */
export function clearLocalStorageData(): void {
    if (typeof window === 'undefined') return;

    try {
        // Remove the saved items
        localStorage.removeItem('mindmap_saved_items');

        // Set migration flag
        localStorage.setItem('migrated_to_supabase', 'true');
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
}

/**
 * Check if migration has been completed
 */
export function isMigrationCompleted(): boolean {
    if (typeof window === 'undefined') return false;

    try {
        return localStorage.getItem('migrated_to_supabase') === 'true';
    } catch {
        return false;
    }
}

/**
 * Reset migration flag (for testing)
 */
export function resetMigrationFlag(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('migrated_to_supabase');
    } catch (error) {
        console.error('Error resetting migration flag:', error);
    }
}

/**
 * Get migration status
 */
export interface MigrationStatus {
    hasLocalData: boolean;
    isCompleted: boolean;
    itemCount: number;
}

export function getMigrationStatus(): MigrationStatus {
    return {
        hasLocalData: hasLocalStorageData(),
        isCompleted: isMigrationCompleted(),
        itemCount: getLocalStorageData().length,
    };
}
