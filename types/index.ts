// Type definitions for the Educational Mind Map Generator

export type ClassLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Board = 'CBSE' | 'ICSE' | 'State Board' | 'IB' | 'IGCSE';

export interface KeyPoint {
    point: string;
    description: string;
}

export interface SubTopic {
    name: string;
    keyPoints: KeyPoint[];
}

export interface MainTopic {
    name: string;
    subTopics: SubTopic[];
}

export interface SummaryStructure {
    chapterName: string;
    classLevel: ClassLevel;
    mainTopics: MainTopic[];
}

// jsMind compatible types
export interface JsMindNode {
    id: string;
    topic: string;
    direction?: 'left' | 'right';
    expanded?: boolean;
    children?: JsMindNode[];
}

export interface JsMindData {
    meta: {
        name: string;
        author: string;
        version: string;
    };
    format: 'node_tree';
    data: JsMindNode;
}

export interface MindMapTheme {
    backgroundColor: string;
    nodeColor: string;
    nodeTextColor: string;
    lineColor: string;
    lineWidth: number;
}

export type GenerationStatus =
    | 'idle'
    | 'generating-summary'
    | 'generating-mindmap'
    | 'complete'
    | 'error';

export interface GenerationError {
    message: string;
    code?: string;
    suggestion?: string;
}

export interface AppState {
    chapterText: string;
    classLevel: ClassLevel;
    summary: SummaryStructure | null;
    mindMapData: JsMindData | null;
    status: GenerationStatus;
    error: GenerationError | null;
}

// Quiz types
export interface QuizQuestion {
    id: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    question: string;
    options?: string[]; // For multiple choice (4 options)
    correctAnswer: string | number; // Index for MCQ, "true"/"false" for T/F, text for SA
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string; // Which main topic this relates to
}

export interface Quiz {
    id: string;
    chapterName: string;
    classLevel: ClassLevel;
    questions: QuizQuestion[];
    generatedAt: number;
}

// Lesson Planner Types
export interface LessonSegment {
    id: string;
    topic: string;
    subtopics: string[];
    allocatedMinutes: number;
    importance: 'high' | 'medium' | 'low';
    complexity: 'easy' | 'moderate' | 'difficult';
    teachingTips: string[];
    prerequisites: string[];
    order: number;
    covered?: boolean;
    customNotes?: string;
}

export interface Lecture {
    lectureNumber: number;
    title: string;
    duration: number; // in minutes
    topics: string[]; // topics covered in this lecture
    complexity: 'easy' | 'moderate' | 'difficult';
    hasRecap: boolean; // true for lectures 2+
    recapContent?: string; // 5-min recap of previous lecture
    teachPackCards: {
        todaysPlan: string;
        start: string;
        explain: string;
        do: string;
        talk: string;
        check: string;
    };
    isActivityLecture: boolean; // true for the last lecture
}

export interface LessonPlan {
    id: string;
    board: Board;
    classLevel: ClassLevel;
    subject: string;
    topic: string; // chapter name
    totalMinutes: number;
    totalLectures: number;
    lectures: Lecture[]; // array of lectures
    homework: string; // not time-bounded, at the end
    parentMessage: string;
    teachingPace: 'traditional' | 'activity' | 'nep';
    generatedAt: number;
    customized: boolean;
    language: string;
}

export type QuizGenerationStatus =
    | 'idle'
    | 'generating'
    | 'complete'
    | 'error';

// SEL/STEM Activity Types
export type ActivityType = 'solo' | 'group';

export interface SELSTEMActivity {
    id: string;
    classLevel: ClassLevel;
    subject: string;
    activityType: ActivityType;
    title: string;
    selFocus: string[]; // e.g., ['Collaboration', 'Problem-solving', 'Empathy']
    realWorldConnection: string;
    materials: string[];
    duration: string;
    instructions: {
        setup: string;
        steps: string[];
        reflection: string;
    };
    learningObjectives: string[];
    assessmentCriteria: string[];
    extensions: string[];
    generatedAt: number;
}

// PPT/Presentation Types
export interface PPTSlide {
    slideNumber: number;
    title: string;
    content: string; // markdown content
    imagePrompt?: string; // AI-generated prompt for image
    imageUrl?: string; // path to generated image (optional)
    hasImage: boolean; // whether image has been generated
}

export interface LecturePresentation {
    id: string;
    lectureNumber: number;
    lectureTitle: string;
    topic: string;
    classLevel: ClassLevel;
    subject: string;
    slides: PPTSlide[];
    totalSlides: number;
    generatedAt: number;
    imagesGenerated: boolean; // track if VISUALIZE was clicked
}
