import { StorageError, StorageErrorType } from '@/types/storage-types';

/**
 * Custom error class for storage operations
 */
export class StorageOperationError extends Error {
    public readonly storageError: StorageError;

    constructor(storageError: StorageError) {
        super(storageError.message);
        this.name = 'StorageOperationError';
        this.storageError = storageError;
    }
}

/**
 * Create a storage error from an unknown error
 */
export function createStorageError(
    error: any,
    defaultMessage: string = 'An unexpected error occurred'
): StorageError {
    // Network errors
    if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
        return {
            type: StorageErrorType.NETWORK_ERROR,
            message: 'Network connection failed. Please check your internet connection.',
            originalError: error,
            retryable: true,
        };
    }

    // Auth errors
    if (error?.message?.includes('auth') || error?.message?.includes('JWT') || error?.code === 'PGRST301') {
        return {
            type: StorageErrorType.AUTH_ERROR,
            message: 'Authentication failed. Please sign in again.',
            originalError: error,
            retryable: false,
        };
    }

    // Database errors
    if (error?.code?.startsWith('PG') || error?.code?.startsWith('23')) {
        return {
            type: StorageErrorType.DATABASE_ERROR,
            message: 'Database operation failed. Please try again.',
            originalError: error,
            retryable: true,
        };
    }

    // Quota exceeded
    if (error?.message?.includes('quota') || error?.message?.includes('storage limit')) {
        return {
            type: StorageErrorType.QUOTA_EXCEEDED,
            message: 'Storage quota exceeded. Please delete some items to free up space.',
            originalError: error,
            retryable: false,
        };
    }

    // Not found errors
    if (error?.code === 'PGRST116' || error?.message?.includes('not found')) {
        return {
            type: StorageErrorType.NOT_FOUND,
            message: 'Content not found.',
            originalError: error,
            retryable: false,
        };
    }

    // Unknown error
    return {
        type: StorageErrorType.UNKNOWN_ERROR,
        message: error?.message || defaultMessage,
        originalError: error,
        retryable: true,
    };
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Don't retry if error is not retryable
            const storageError = createStorageError(error);
            if (!storageError.retryable || attempt === maxRetries) {
                throw new StorageOperationError(storageError);
            }

            // Calculate delay with exponential backoff and jitter
            const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new StorageOperationError(createStorageError(lastError));
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
    if (error instanceof StorageOperationError) {
        return error.storageError.message;
    }

    const storageError = createStorageError(error);
    return storageError.message;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
    if (error instanceof StorageOperationError) {
        return error.storageError.retryable;
    }

    const storageError = createStorageError(error);
    return storageError.retryable;
}

/**
 * Log error for debugging
 */
export function logStorageError(error: any, context: string): void {
    const storageError = error instanceof StorageOperationError
        ? error.storageError
        : createStorageError(error);

    console.error(`[Storage Error] ${context}:`, {
        type: storageError.type,
        message: storageError.message,
        retryable: storageError.retryable,
        originalError: storageError.originalError,
    });
}
