import type { SummaryStructure, JsMindData, ClassLevel, Quiz, LessonPlan, SELSTEMActivity, Board } from '@/types';
import type { SavedSummary, SavedQuiz, SavedLesson, SavedActivity, SavedContentListItem } from '@/types/storage-types';
import { saveContent, getAllContent, deleteContent, getContent } from './supabase-storage';

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
 * Get all saved mind maps from Supabase
 */
export async function getSavedMindMaps(): Promise<SavedMindMap[]> {
    const result = await getAllContent();

    if (!result.success || !result.data) {
        console.error('Failed to load saved content:', result.error);
        return [];
    }

    // Filter only summary type and convert to old format for compatibility
    const summaries = result.data.items.filter(item => item.type === 'summary');

    // Fetch full data for each summary
    const mindMaps: SavedMindMap[] = [];

    for (const item of summaries) {
        const contentResult = await getContent(item.key);

        if (contentResult.success && contentResult.data) {
            const content = contentResult.data.value as SavedSummary;

            mindMaps.push({
                id: item.key,
                timestamp: item.metadata.timestamp,
                chapterName: item.metadata.chapterName,
                classLevel: item.metadata.classLevel,
                subject: item.metadata.subject,
                summary: content.data.summary,
                mindMapData: content.data.mindMapData,
                chapterText: content.data.chapterText,
            });
        }
    }

    return mindMaps;
}

/**
 * Get all saved quizzes from Supabase
 */
export async function getSavedQuizzes(): Promise<Array<SavedQuiz & { id: string; timestamp: number }>> {
    const result = await getAllContent();

    if (!result.success || !result.data) {
        console.error('Failed to load saved content:', result.error);
        return [];
    }

    const quizzes = result.data.items.filter(item => item.type === 'quiz');
    const quizData: Array<SavedQuiz & { id: string; timestamp: number }> = [];

    for (const item of quizzes) {
        const contentResult = await getContent(item.key);

        if (contentResult.success && contentResult.data) {
            const content = contentResult.data.value as SavedQuiz;
            quizData.push({
                ...content,
                id: item.key,
                timestamp: item.metadata.timestamp,
            });
        }
    }

    return quizData;
}

/**
 * Get all saved lesson plans from Supabase
 */
export async function getSavedLessonPlans(): Promise<Array<SavedLesson & { id: string; timestamp: number }>> {
    const result = await getAllContent();

    if (!result.success || !result.data) {
        console.error('Failed to load saved content:', result.error);
        return [];
    }

    const lessons = result.data.items.filter(item => item.type === 'lesson');
    const lessonData: Array<SavedLesson & { id: string; timestamp: number }> = [];

    for (const item of lessons) {
        const contentResult = await getContent(item.key);

        if (contentResult.success && contentResult.data) {
            const content = contentResult.data.value as SavedLesson;
            lessonData.push({
                ...content,
                id: item.key,
                timestamp: item.metadata.timestamp,
            });
        }
    }

    return lessonData;
}

/**
 * Get all saved SEL/STEM activities from Supabase
 */
export async function getSavedActivities(): Promise<Array<SavedActivity & { id: string; timestamp: number }>> {
    const result = await getAllContent();

    if (!result.success || !result.data) {
        console.error('Failed to load saved content:', result.error);
        return [];
    }

    const activities = result.data.items.filter(item => item.type === 'activity');
    const activityData: Array<SavedActivity & { id: string; timestamp: number }> = [];

    for (const item of activities) {
        const contentResult = await getContent(item.key);

        if (contentResult.success && contentResult.data) {
            const content = contentResult.data.value as SavedActivity;
            activityData.push({
                ...content,
                id: item.key,
                timestamp: item.metadata.timestamp,
            });
        }
    }

    return activityData;
}

/**
 * Save a mind map to Supabase
 */
export async function saveMindMap(
    chapterName: string,
    classLevel: ClassLevel,
    summary: SummaryStructure,
    mindMapData: JsMindData,
    chapterText: string,
    subject?: string
): Promise<SavedMindMap> {
    const content: SavedSummary = {
        type: 'summary',
        metadata: {
            chapterName,
            classLevel,
            subject,
            timestamp: Date.now(),
        },
        data: {
            summary,
            mindMapData,
            chapterText,
        },
    };

    const result = await saveContent(content);

    if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to save mind map');
    }

    return {
        id: result.data.key,
        timestamp: content.metadata.timestamp,
        chapterName,
        classLevel,
        subject,
        summary,
        mindMapData,
        chapterText,
    };
}

/**
 * Save a quiz to Supabase
 */
export async function saveQuiz(
    chapterName: string,
    classLevel: ClassLevel,
    quiz: Quiz,
    subject?: string,
    board?: Board
): Promise<{ id: string; timestamp: number }> {
    const content: SavedQuiz = {
        type: 'quiz',
        metadata: {
            chapterName,
            classLevel,
            subject,
            board,
            timestamp: Date.now(),
        },
        data: {
            quiz,
        },
    };

    const result = await saveContent(content);

    if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to save quiz');
    }

    return {
        id: result.data.key,
        timestamp: content.metadata.timestamp,
    };
}

/**
 * Save a lesson plan to Supabase
 */
export async function saveLessonPlan(
    lessonPlan: LessonPlan
): Promise<{ id: string; timestamp: number }> {
    const content: SavedLesson = {
        type: 'lesson',
        metadata: {
            chapterName: lessonPlan.topic,
            classLevel: lessonPlan.classLevel,
            subject: lessonPlan.subject,
            board: lessonPlan.board,
            timestamp: Date.now(),
        },
        data: {
            lessonPlan,
        },
    };

    const result = await saveContent(content);

    if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to save lesson plan');
    }

    return {
        id: result.data.key,
        timestamp: content.metadata.timestamp,
    };
}

/**
 * Save a SEL/STEM activity to Supabase
 */
export async function saveSELSTEMActivity(
    activity: SELSTEMActivity,
    chapterName: string,
    classLevel: ClassLevel,
    subject: string
): Promise<{ id: string; timestamp: number }> {
    const content: SavedActivity = {
        type: 'activity',
        metadata: {
            chapterName,
            classLevel,
            subject,
            timestamp: Date.now(),
        },
        data: {
            activity,
        },
    };

    const result = await saveContent(content);

    if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to save activity');
    }

    return {
        id: result.data.key,
        timestamp: content.metadata.timestamp,
    };
}

/**
 * Delete a saved mind map
 */
export async function deleteSavedMindMap(key: string): Promise<void> {
    const result = await deleteContent(key);

    if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete mind map');
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
