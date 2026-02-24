"use client";

import React, { useEffect, useRef, useCallback, memo } from 'react';
import EditorJS, { OutputData, API } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import Table from '@editorjs/table';

interface EditorProps {
    initialData?: OutputData;
    onChange?: (data: OutputData) => void;
    onReady?: () => void;
    readOnly?: boolean;
    placeholder?: string;
    minHeight?: number;
}

const Editor = memo(function Editor({
    initialData,
    onChange,
    onReady,
    readOnly = false,
    placeholder = 'Start writing your content...',
    minHeight = 300
}: EditorProps) {
    const editorRef = useRef<EditorJS | null>(null);
    const holderRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);

    const handleChange = useCallback(async (api: API) => {
        if (onChange && editorRef.current) {
            try {
                const data = await editorRef.current.save();
                onChange(data);
            } catch (error) {
                console.error('Error saving editor data:', error);
            }
        }
    }, [onChange]);

    useEffect(() => {
        if (!holderRef.current || isInitialized.current) return;

        const initEditor = async () => {
            try {
                const editor = new EditorJS({
                    holder: holderRef.current!,
                    data: initialData,
                    readOnly,
                    placeholder,
                    minHeight,
                    autofocus: !readOnly,
                    tools: {
                        header: {
                            class: Header as any,
                            config: {
                                placeholder: 'Enter a heading',
                                levels: [1, 2, 3, 4],
                                defaultLevel: 2
                            },
                            inlineToolbar: true
                        },
                        list: {
                            class: List as any,
                            inlineToolbar: true,
                            config: {
                                defaultStyle: 'unordered'
                            }
                        },
                        checklist: {
                            class: Checklist as any,
                            inlineToolbar: true
                        },
                        quote: {
                            class: Quote as any,
                            inlineToolbar: true,
                            config: {
                                quotePlaceholder: 'Enter a quote',
                                captionPlaceholder: 'Quote author'
                            }
                        },
                        code: {
                            class: Code as any
                        },
                        delimiter: Delimiter as any,
                        marker: {
                            class: Marker as any
                        },
                        inlineCode: {
                            class: InlineCode as any
                        },
                        table: {
                            class: Table as any,
                            inlineToolbar: true,
                            config: {
                                rows: 2,
                                cols: 3
                            }
                        }
                    },
                    onChange: handleChange,
                    onReady: () => {
                        isInitialized.current = true;
                        onReady?.();
                    }
                });

                editorRef.current = editor;
            } catch (error) {
                console.error('Error initializing Editor.js:', error);
            }
        };

        initEditor();

        return () => {
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                editorRef.current.destroy();
                editorRef.current = null;
                isInitialized.current = false;
            }
        };
    }, []);

    // Method to get current data (exposed for parent components)
    const getData = useCallback(async (): Promise<OutputData | null> => {
        if (editorRef.current) {
            try {
                return await editorRef.current.save();
            } catch (error) {
                console.error('Error getting editor data:', error);
                return null;
            }
        }
        return null;
    }, []);

    return (
        <div className="editor-wrapper bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div
                ref={holderRef}
                className="editor-container prose prose-slate max-w-none"
                style={{ minHeight: `${minHeight}px` }}
            />
            <style jsx global>{`
        .editor-container {
          padding: 1.5rem;
        }
        
        .editor-container .ce-block__content {
          max-width: 100%;
          margin: 0;
        }
        
        .editor-container .ce-toolbar__content {
          max-width: 100%;
        }
        
        .editor-container .codex-editor__redactor {
          padding-bottom: 100px !important;
        }
        
        .editor-container .ce-paragraph {
          font-size: 1rem;
          line-height: 1.75;
        }
        
        .editor-container h1.ce-header {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .editor-container h2.ce-header {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        
        .editor-container h3.ce-header {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .editor-container h4.ce-header {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .editor-container .cdx-quote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          font-style: italic;
          color: #4b5563;
        }
        
        .editor-container .cdx-checklist__item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        
        .editor-container .ce-code__textarea {
          background: #1e293b;
          color: #e2e8f0;
          border-radius: 0.5rem;
          font-family: 'Monaco', 'Menlo', monospace;
          padding: 1rem;
        }
        
        .editor-container .cdx-marker {
          background: rgba(251, 191, 36, 0.4);
          padding: 0.125rem 0;
        }
        
        .editor-container .inline-code {
          background: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.875em;
          color: #dc2626;
        }
        
        .editor-container .tc-table {
          border-collapse: collapse;
          width: 100%;
        }
        
        .editor-container .tc-table td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem;
        }
        
        .editor-container .ce-delimiter {
          line-height: 1.6em;
          width: 100%;
          text-align: center;
        }
        
        .editor-container .ce-delimiter::before {
          content: '***';
          display: inline-block;
          color: #9ca3af;
          font-size: 1.5rem;
          letter-spacing: 0.75rem;
        }
      `}</style>
        </div>
    );
});

export default Editor;
