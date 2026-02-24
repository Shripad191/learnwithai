"use client";

import React from 'react';
import type { EditorData, EditorBlock } from '@/types/editor';

interface EditorContentProps {
    data: EditorData;
    className?: string;
}

// Render individual block based on type
function renderBlock(block: EditorBlock, index: number): React.ReactNode {
    const { type, data } = block;

    switch (type) {
        case 'paragraph':
            return (
                <p
                    key={index}
                    className="text-gray-700 leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{ __html: data.text as string }}
                />
            );

        case 'header':
            const level = (data.level as number) || 2;
            const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
            const headerStyles: Record<number, string> = {
                1: 'text-3xl font-bold mb-4 mt-6',
                2: 'text-2xl font-semibold mb-3 mt-5',
                3: 'text-xl font-semibold mb-2 mt-4',
                4: 'text-lg font-medium mb-2 mt-3',
                5: 'text-base font-medium mb-2 mt-2',
                6: 'text-sm font-medium mb-1 mt-2'
            };
            return (
                <HeaderTag
                    key={index}
                    className={`text-gray-900 ${headerStyles[level] || headerStyles[2]}`}
                    dangerouslySetInnerHTML={{ __html: data.text as string }}
                />
            );

        case 'list':
            const ListTag = (data.style as string) === 'ordered' ? 'ol' : 'ul';
            const listStyle = (data.style as string) === 'ordered' ? 'list-decimal' : 'list-disc';
            return (
                <ListTag key={index} className={`${listStyle} list-inside mb-4 space-y-1 text-gray-700`}>
                    {(data.items as string[]).map((item, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ListTag>
            );

        case 'checklist':
            const items = data.items as Array<{ text: string; checked: boolean }>;
            return (
                <div key={index} className="mb-4 space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                checked={item.checked}
                                readOnly
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
                            />
                            <span
                                className={`text-gray-700 ${item.checked ? 'line-through text-gray-400' : ''}`}
                                dangerouslySetInnerHTML={{ __html: item.text }}
                            />
                        </div>
                    ))}
                </div>
            );

        case 'quote':
            const captionText = data.caption as string | undefined;
            return (
                <blockquote key={index} className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 rounded-r">
                    <p className="text-gray-700 italic" dangerouslySetInnerHTML={{ __html: data.text as string }} />
                    {captionText && (
                        <cite className="text-sm text-gray-500 mt-2 block">
                            — {captionText}
                        </cite>
                    )}
                </blockquote>
            );

        case 'code':
            return (
                <pre key={index} className="bg-slate-800 text-slate-100 rounded-lg p-4 mb-4 overflow-x-auto">
                    <code className="font-mono text-sm">{data.code as string}</code>
                </pre>
            );

        case 'delimiter':
            return (
                <div key={index} className="flex justify-center my-8">
                    <span className="text-gray-300 text-2xl tracking-widest">***</span>
                </div>
            );

        case 'table':
            const tableContent = data.content as string[][];
            const withHeadings = data.withHeadings as boolean;
            if (!tableContent || tableContent.length === 0) {
                return null;
            }
            return (
                <div key={index} className="overflow-x-auto mb-4">
                    <table className="min-w-full border-collapse border border-gray-200">
                        {withHeadings && tableContent.length > 0 && (
                            <thead className="bg-gray-50">
                                <tr>
                                    {tableContent[0].map((cell: string, i: number) => (
                                        <th
                                            key={i}
                                            className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700"
                                            dangerouslySetInnerHTML={{ __html: cell }}
                                        />
                                    ))}
                                </tr>
                            </thead>
                        )}
                        <tbody>
                            {tableContent.slice(withHeadings ? 1 : 0).map((row: string[], rowIndex: number) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    {row.map((cell: string, cellIndex: number) => (
                                        <td
                                            key={cellIndex}
                                            className="border border-gray-200 px-4 py-2 text-gray-700"
                                            dangerouslySetInnerHTML={{ __html: cell }}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

        default:
            // Fallback for unknown block types
            return (
                <div key={index} className="bg-gray-100 p-3 rounded mb-4 text-sm text-gray-600">
                    Unknown block type: {type}
                </div>
            );
    }
}

export default function EditorContent({ data, className = '' }: EditorContentProps) {
    if (!data || !data.blocks || data.blocks.length === 0) {
        return (
            <div className={`text-gray-400 italic ${className}`}>
                No content to display
            </div>
        );
    }

    return (
        <div className={`editor-content prose prose-slate max-w-none ${className}`}>
            {data.blocks.map((block, index) => renderBlock(block, index))}
        </div>
    );
}
