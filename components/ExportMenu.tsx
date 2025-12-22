"use client";

import React, { useState } from 'react';
import type { SummaryStructure, JsMindData } from '@/types';
import {
    exportSummaryAsText,
    exportSummaryAsMarkdown,
    downloadTextFile,
    printPage,
    exportMindMapAsHighResPNG
} from '@/lib/export';
import { cn } from '@/lib/utils';

interface ExportMenuProps {
    summary: SummaryStructure;
    mindMapData: JsMindData;
    canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export default function ExportMenu({ summary, mindMapData, canvasRef }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [exported, setExported] = useState<string | null>(null);

    const handleExport = (type: string) => {
        const filename = `${summary.chapterName}_Class${summary.classLevel}`;

        switch (type) {
            case 'text':
                const textContent = exportSummaryAsText(summary);
                downloadTextFile(textContent, `${filename}.txt`);
                showSuccess('Text file downloaded!');
                break;

            case 'markdown':
                const mdContent = exportSummaryAsMarkdown(summary);
                downloadTextFile(mdContent, `${filename}.md`);
                showSuccess('Markdown file downloaded!');
                break;

            case 'print':
                printPage();
                setIsOpen(false);
                break;

            case 'png-hd':
                if (canvasRef?.current) {
                    exportMindMapAsHighResPNG(canvasRef.current, `${filename}_mindmap.png`, 3);
                    showSuccess('High-res PNG downloaded!');
                }
                break;

            case 'json':
                const jsonData = JSON.stringify({ summary, mindMapData }, null, 2);
                downloadTextFile(jsonData, `${filename}.json`);
                showSuccess('JSON file downloaded!');
                break;
        }
    };

    const showSuccess = (message: string) => {
        setExported(message);
        setTimeout(() => {
            setExported(null);
            setIsOpen(false);
        }, 2000);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50 overflow-hidden dropdown-enter">
                        {exported ? (
                            <div className="p-4 text-center bg-green-50 text-green-700 font-medium">
                                ✓ {exported}
                            </div>
                        ) : (
                            <div className="py-2">
                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                                    Summary Formats
                                </div>

                                <button
                                    onClick={() => handleExport('text')}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-3"
                                >
                                    <span className="text-2xl">📄</span>
                                    <div>
                                        <div className="font-medium">Plain Text</div>
                                        <div className="text-xs text-gray-500">Simple .txt file</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleExport('markdown')}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-3"
                                >
                                    <span className="text-2xl">📝</span>
                                    <div>
                                        <div className="font-medium">Markdown</div>
                                        <div className="text-xs text-gray-500">Formatted .md file</div>
                                    </div>
                                </button>

                                <div className="border-t border-gray-200 my-2" />

                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                                    Mind Map Formats
                                </div>

                                <button
                                    onClick={() => handleExport('png-hd')}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-3"
                                >
                                    <span className="text-2xl">🖼️</span>
                                    <div>
                                        <div className="font-medium">High-Res PNG</div>
                                        <div className="text-xs text-gray-500">3x resolution image</div>
                                    </div>
                                </button>

                                <div className="border-t border-gray-200 my-2" />

                                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                                    Other Options
                                </div>

                                <button
                                    onClick={() => handleExport('print')}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-3"
                                >
                                    <span className="text-2xl">🖨️</span>
                                    <div>
                                        <div className="font-medium">Print</div>
                                        <div className="text-xs text-gray-500">Print-friendly layout</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleExport('json')}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-3"
                                >
                                    <span className="text-2xl">💾</span>
                                    <div>
                                        <div className="font-medium">JSON Data</div>
                                        <div className="text-xs text-gray-500">Raw data export</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
