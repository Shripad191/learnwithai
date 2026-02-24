// Editor.js TypeScript type definitions

export interface EditorBlock {
    id?: string;
    type: string;
    data: Record<string, unknown>;
}

export interface EditorData {
    time?: number;
    blocks: EditorBlock[];
    version?: string;
}

// Specific block data types
export interface ParagraphData {
    text: string;
}

export interface HeaderData {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ListData {
    style: 'ordered' | 'unordered';
    items: string[];
}

export interface ChecklistData {
    items: Array<{
        text: string;
        checked: boolean;
    }>;
}

export interface QuoteData {
    text: string;
    caption: string;
    alignment: 'left' | 'center';
}

export interface CodeData {
    code: string;
}

export interface DelimiterData {
    // Empty block type
}

export interface TableData {
    withHeadings: boolean;
    content: string[][];
}

// Saved editor content structure for storage
export interface SavedEditorContent {
    type: 'editor';
    metadata: {
        title: string;
        classLevel: number;
        subject?: string;
        createdAt: string;
        updatedAt: string;
    };
    data: {
        content: EditorData;
    };
}
