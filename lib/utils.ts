import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClassLevel } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get complexity description for a class level
export function getComplexityDescription(classLevel: ClassLevel): string {
  const descriptions: Record<ClassLevel, string> = {
    1: "Basic concepts with simple language",
    2: "Simple topics with easy examples",
    3: "Elementary concepts with clear explanations",
    4: "Foundational topics with practical examples",
    5: "Intermediate concepts with detailed explanations",
    6: "Advanced topics with comprehensive coverage",
    7: "Complex concepts with in-depth analysis",
    8: "Challenging topics with critical thinking",
    9: "Advanced analytical skills and abstract thinking",
    10: "Sophisticated concepts with real-world applications",
    11: "Expert-level topics with research-based learning",
    12: "Mastery-level content with advanced problem-solving"
  };
  return descriptions[classLevel];
}

// Validate chapter input
export function validateChapterInput(chapterText: string, chapterName: string): { isValid: boolean; error?: string } {
  // If chapter name is provided, allow generation even without text (topic-based generation)
  if (chapterName.trim()) {
    return { isValid: true };
  }

  // If no chapter name, require chapter text
  if (!chapterText.trim()) {
    return { isValid: false, error: 'Please provide either a chapter name/topic or chapter content' };
  }

  // If chapter text is provided, ensure it's substantial enough
  if (chapterText.trim().length < 100) {
    return { isValid: false, error: 'Chapter content should be at least 100 characters long' };
  }

  return { isValid: true };
}
