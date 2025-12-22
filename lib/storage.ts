import type { SummaryStructure, JsMindData, ClassLevel } from '@/types';

// Storage key prefix
const STORAGE_PREFIX = 'mindmap_';
const SAVED_ITEMS_KEY = `${STORAGE_PREFIX}saved_items`;

export interface SavedMindMap {
    id: string;
    timestamp: number;
    chapterName: string;
    classLevel: ClassLevel;
    subject?: string;
    summary: SummaryStructure;
    mindMapData: JsMindData;
    chapterText: string;
}

/**
 * Get all saved mind maps from localStorage
 */
export function getSavedMindMaps(): SavedMindMap[] {
    if (typeof window === 'undefined') return [];

    try {
        const saved = localStorage.getItem(SAVED_ITEMS_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error loading saved mind maps:', error);
        return [];
    }
}

/**
 * Save a mind map to localStorage
 */
export function saveMindMap(
    chapterName: string,
    classLevel: ClassLevel,
    summary: SummaryStructure,
    mindMapData: JsMindData,
    chapterText: string,
    subject?: string
): SavedMindMap {
    const savedItem: SavedMindMap = {
        id: generateId(),
        timestamp: Date.now(),
        chapterName,
        classLevel,
        subject,
        summary,
        mindMapData,
        chapterText,
    };

    const items = getSavedMindMaps();
    items.unshift(savedItem); // Add to beginning

    // Keep only last 50 items to avoid localStorage limits
    const limitedItems = items.slice(0, 50);

    try {
        localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(limitedItems));
        return savedItem;
    } catch (error) {
        console.error('Error saving mind map:', error);
        throw new Error('Failed to save mind map. Storage might be full.');
    }
}

/**
 * Delete a saved mind map
 */
export function deleteSavedMindMap(id: string): void {
    const items = getSavedMindMaps();
    const filtered = items.filter(item => item.id !== id);

    try {
        localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting mind map:', error);
        throw new Error('Failed to delete mind map.');
    }
}

/**
 * Export a mind map as JSON file
 */
export function exportAsJSON(savedItem: SavedMindMap): void {
    const dataStr = JSON.stringify(savedItem, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${savedItem.chapterName}_Class${savedItem.classLevel}_${savedItem.id}.json`;
    link.click();

    URL.revokeObjectURL(url);
}

/**
 * Import a mind map from JSON file
 */
export function importFromJSON(file: File): Promise<SavedMindMap> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content) as SavedMindMap;

                // Validate the data structure
                if (!data.chapterName || !data.summary || !data.mindMapData) {
                    throw new Error('Invalid mind map file format');
                }

                // Generate new ID and timestamp
                data.id = generateId();
                data.timestamp = Date.now();

                resolve(data);
            } catch (error) {
                reject(new Error('Failed to parse JSON file'));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

/**
 * Generate a unique ID
 */
function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { used: number; total: number; percentage: number } {
    if (typeof window === 'undefined') {
        return { used: 0, total: 0, percentage: 0 };
    }

    try {
        const items = getSavedMindMaps();
        const dataStr = JSON.stringify(items);
        const used = new Blob([dataStr]).size;
        const total = 5 * 1024 * 1024; // Approximate 5MB localStorage limit
        const percentage = (used / total) * 100;

        return { used, total, percentage };
    } catch (error) {
        return { used: 0, total: 0, percentage: 0 };
    }
}
