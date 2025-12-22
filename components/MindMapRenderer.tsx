"use client";

import React, { useEffect, useRef, useState } from 'react';
import type { JsMindData } from '@/types';
import 'jsmind/style/jsmind.css';

interface MindMapRendererProps {
    data: JsMindData;
}

export default function MindMapRenderer({ data }: MindMapRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const jmRef = useRef<any>(null);
    const [isClient, setIsClient] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !containerRef.current) return;

        // Dynamically import jsMind only on client side
        const loadJsMind = async () => {
            try {
                // Load jsMind library
                const jsMind = (await import('jsmind')).default;

                // Clear previous instance
                if (jmRef.current) {
                    jmRef.current = null;
                    if (containerRef.current) {
                        containerRef.current.innerHTML = '';
                    }
                }

                // Initialize jsMind with all required options
                const options = {
                    container: containerRef.current!,
                    theme: 'primary',
                    editable: false,
                    mode: 'full',
                    support_html: false,
                    log_level: 'warn',
                    default_event_handle: {
                        enable_mousedown_handle: true,
                        enable_click_handle: true,
                        enable_dblclick_handle: true,
                    },
                    view: {
                        engine: 'svg',
                        hmargin: 100,
                        vmargin: 50,
                        line_width: 2,
                        line_color: '#0ea5e9',
                        draggable: true,
                        hide_scrollbars_when_draggable: false,
                    },
                    layout: {
                        hspace: 60,
                        vspace: 20,
                        pspace: 13,
                    },
                    shortcut: {
                        enable: true,
                    },
                } as any;

                const jm = new jsMind(options);
                jm.show(data);
                jmRef.current = jm;

                // Force a small delay to ensure rendering
                setTimeout(() => {
                    if (jmRef.current) {
                        jmRef.current.resize();
                    }
                }, 100);
            } catch (error) {
                console.error('Error loading jsMind:', error);
            }
        };

        loadJsMind();

        return () => {
            if (jmRef.current) {
                jmRef.current = null;
            }
        };
    }, [data, isClient]);

    const handleZoomIn = () => {
        if (jmRef.current && zoomLevel < 2) {
            const newZoom = Math.min(zoomLevel + 0.1, 2);
            setZoomLevel(newZoom);
            jmRef.current.view.zoom_in();
        }
    };

    const handleZoomOut = () => {
        if (jmRef.current && zoomLevel > 0.5) {
            const newZoom = Math.max(zoomLevel - 0.1, 0.5);
            setZoomLevel(newZoom);
            jmRef.current.view.zoom_out();
        }
    };

    const handleZoomReset = () => {
        if (jmRef.current) {
            setZoomLevel(1);
            jmRef.current.show(data);
        }
    };

    const handleExportPNG = async () => {
        if (jmRef.current && containerRef.current) {
            try {
                // Import html2canvas
                const html2canvas = (await import('html2canvas')).default;

                // Get the container element
                const container = containerRef.current;

                // Store original styles
                const originalOverflow = container.style.overflow;
                const originalHeight = container.style.height;
                const originalWidth = container.style.width;

                // Get the SVG element to determine full size
                const svgElement = container.querySelector('svg');
                if (!svgElement) {
                    alert('Mind map not found. Please wait for it to load completely.');
                    return;
                }

                // Get the actual content dimensions
                const bbox = svgElement.getBBox();
                const fullWidth = Math.max(bbox.width + bbox.x + 100, container.scrollWidth);
                const fullHeight = Math.max(bbox.height + bbox.y + 100, container.scrollHeight);

                // Temporarily expand container to show all content
                container.style.overflow = 'visible';
                container.style.height = `${fullHeight}px`;
                container.style.width = `${fullWidth}px`;

                // Wait a bit for the layout to update
                await new Promise(resolve => setTimeout(resolve, 100));

                // Capture the entire container with html2canvas
                const canvas = await html2canvas(container, {
                    backgroundColor: '#f9fafb',
                    scale: 2,
                    logging: false,
                    width: fullWidth,
                    height: fullHeight,
                    windowWidth: fullWidth,
                    windowHeight: fullHeight,
                    x: 0,
                    y: 0,
                });

                // Restore original styles
                container.style.overflow = originalOverflow;
                container.style.height = originalHeight;
                container.style.width = originalWidth;

                // Download the canvas as PNG
                canvas.toBlob((blob) => {
                    if (blob) {
                        const link = document.createElement('a');
                        link.download = `${data.meta?.name || 'mindmap'}.png`;
                        link.href = URL.createObjectURL(blob);
                        link.click();
                        URL.revokeObjectURL(link.href);
                    }
                }, 'image/png');

            } catch (error) {
                console.error('Export error:', error);
                alert('Unable to export. Please try taking a screenshot manually (Ctrl+Shift+S or Cmd+Shift+4).');
            }
        }
    };

    if (!isClient) {
        return (
            <div className="w-full h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">Loading mind map...</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slide-up">
            {/* Header with Controls */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white">Interactive Mind Map</h2>
                    <p className="text-purple-100 text-sm">Click nodes to expand/collapse</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1 backdrop-blur-sm">
                        <button
                            onClick={handleZoomOut}
                            disabled={zoomLevel <= 0.5}
                            className="px-3 py-1.5 text-white hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Zoom Out"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        </button>
                        <span className="px-2 text-white text-sm font-medium min-w-[3rem] text-center">
                            {Math.round(zoomLevel * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            disabled={zoomLevel >= 2}
                            className="px-3 py-1.5 text-white hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Zoom In"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        <button
                            onClick={handleZoomReset}
                            className="px-3 py-1.5 text-white hover:bg-white/20 rounded transition-colors"
                            title="Reset Zoom"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExportPNG}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors backdrop-blur-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export PNG
                    </button>
                </div>
            </div>

            {/* Mind Map Container */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100">
                <div
                    ref={containerRef}
                    className="w-full h-[600px]"
                    style={{ position: 'relative' }}
                />

                {/* Instructions Overlay */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md border border-gray-200">
                    <p className="text-xs text-gray-600">
                        <span className="font-semibold">💡 Tip:</span> Click on nodes to expand/collapse branches
                    </p>
                </div>
            </div>
        </div>
    );
}
