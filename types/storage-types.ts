import type { SummaryStructure, JsMindData, ClassLevel, Board, Quiz, LessonPlan, SELSTEMActivity } from './index';

/**
 * Content types that can be saved
 */
export type ContentType = 'summary' | 'quiz' | 'lesson' | 'activity';

/**
 * Base metadata for all saved content
 */
export interface ContentMetadata {
    chapterName: string;
    classLevel: ClassLevel;
    subject?: string;
    board?: Board;
    timestamp: number;
}

/**
 * Summary content data
 */
export interface SummaryContentData {
    summary: SummaryStructure;
    mindMapData: JsMindData;
    chapterText: string;
}

/**
 * Quiz content data
 */
export interface QuizContentData {
    quiz: Quiz;
}

/**
 * Lesson plan content data
 */
export interface LessonContentData {
    lessonPlan: LessonPlan;
}

/**
 * SEL/STEM activity content data
 */
export interface ActivityContentData {
    activity: SELSTEMActivity;
}

/**
 * Generic saved content structure
 */
export interface SavedContent<T = any> {
    type: ContentType;
    metadata: ContentMetadata;
    data: T;
}

/**
 * Typed saved content variants
 */
export type SavedSummary = SavedContent<SummaryContentData> & { type: 'summary' };
export type SavedQuiz = SavedContent<QuizContentData> & { type: 'quiz' };
export type SavedLesson = SavedContent<LessonContentData> & { type: 'lesson' };
export type SavedActivity = SavedContent<ActivityContentData> & { type: 'activity' };

/**
 * Union type of all saved content types
 */
export type AnySavedContent = SavedSummary | SavedQuiz | SavedLesson | SavedActivity;

/**
 * Database row structure
 */
export interface SavedContentRow {
    id: string;
    user_id: string;
    key: string;
    value: AnySavedContent;
    created_at: string;
    updated_at: string;
}

/**
 * Storage operation result
 */
export interface StorageResult<T = any> {
    success: boolean;
    data?: T;
    error?: StorageError;
}

/**
 * Storage error types
 */
export enum StorageErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    AUTH_ERROR = 'AUTH_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Storage error structure
 */
export interface StorageError {
    type: StorageErrorType;
    message: string;
    originalError?: any;
    retryable: boolean;
}

/**
 * List of saved items for display
 */
export interface SavedContentListItem {
    id: string;
    key: string;
    type: ContentType;
    metadata: ContentMetadata;
    created_at: string;
    updated_at: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
    page: number;
    pageSize: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
