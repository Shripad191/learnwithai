import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Validates chapter input text
 * Now allows empty text if chapterName is provided (for topic-based generation)
 */
export function validateChapterInput(text: string, chapterName?: string): {
    isValid: boolean;
    error?: string;
    mode?: 'content' | 'topic';
} {
    // If no text but chapter name exists, use topic-based generation
    if ((!text || text.trim().length === 0) && chapterName && chapterName.trim().length > 0) {
        return { isValid: true, mode: 'topic' };
    }

    // If no text and no chapter name, error
    if (!text || text.trim().length === 0) {
        return { isValid: false, error: "Please enter either chapter content or just a chapter name/topic" };
    }

    // If text is too short
    if (text.trim().length < 100) {
        return {
            isValid: false,
            error: "Chapter content is too short. Please provide at least 100 characters, or just enter a chapter name/topic."
        };
    }

    // If text is too long
    if (text.length > 50000) {
        return {
            isValid: false,
            error: "Chapter content is too long. Please limit to 50,000 characters."
        };
    }

    return { isValid: true, mode: 'content' };
}

/**
 * Generates a unique ID for jsMind nodes
 */
export function generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Truncates text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formats class level for display
 */
export function formatClassLevel(level: number): string {
    return `Class ${level}`;
}

/**
 * Gets appropriate complexity description for class level
 */
export function getComplexityDescription(level: number): string {
    if (level <= 2) return "Very Simple - Basic concepts with simple vocabulary";
    if (level <= 4) return "Simple - Fundamental concepts with easy explanations";
    if (level <= 6) return "Moderate - Intermediate concepts with detailed explanations";
    return "Advanced - Complex concepts with technical terminology";
}
