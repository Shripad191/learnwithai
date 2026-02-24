"use client";

import React, { useState, useEffect } from 'react';
import type { ContentType } from '@/types/storage-types';
import { getAllContent, deleteContent } from '@/lib/supabase-storage';
import type { SavedContentListItem } from '@/types/storage-types';
import { formatTimestamp } from '@/lib/storage';

interface SaveLoadPanelProps {
    onLoad: (item: SavedContentListItem) => void;
    onClose: () => void;
}

export default function SaveLoadPanel({ onLoad, onClose }: SaveLoadPanelProps) {
    const [savedItems, setSavedItems] = useState<SavedContentListItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState<number | 'all'>('all');
    const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSavedItems();
    }, []);

    const loadSavedItems = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await getAllContent();

            if (!result.success || !result.data) {
                throw new Error(result.error?.message || 'Failed to load saved content');
            }

            setSavedItems(result.data.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load saved items');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (key: string) => {
        if (!confirm('Are you sure you want to delete this saved content?')) {
            return;
        }

        try {
            const result = await deleteContent(key);

            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to delete content');
            }

            await loadSavedItems();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete item');
        }
    };

    const filteredItems = savedItems.filter(item => {
        const matchesSearch = item.metadata.chapterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.metadata.subject?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass === 'all' || item.metadata.classLevel === filterClass;
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesClass && matchesType;
    });

    const getTypeIcon = (type: ContentType) => {
        switch (type) {
            case 'summary':
                return '📝';
            case 'quiz':
                return '📋';
            case 'lesson':
                return '📅';
            case 'activity':
                return '🎯';
            default:
                return '📄';
        }
    };

    const getTypeLabel = (type: ContentType) => {
        switch (type) {
            case 'summary':
                return 'Summary';
            case 'quiz':
                return 'Quiz';
            case 'lesson':
                return 'Lesson Plan';
            case 'activity':
                return 'SEL/STEM Activity';
            default:
                return 'Content';
        }
    };

    const getTypeBadgeColor = (type: ContentType) => {
        switch (type) {
            case 'summary':
                return 'bg-blue-100 text-blue-700';
            case 'quiz':
                return 'bg-green-100 text-green-700';
            case 'lesson':
                return 'bg-orange-100 text-orange-700';
            case 'activity':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Saved Content</h2>
                        <p className="text-white/80 text-sm">
                            {savedItems.length} saved item{savedItems.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-gray-200 space-y-3">
                    <div className="flex gap-3 flex-wrap">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search by chapter or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 min-w-[200px] px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        />

                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as ContentType | 'all')}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        >
                            <option value="all">All Types</option>
                            <option value="summary">📝 Summary</option>
                            <option value="quiz">📋 Quiz</option>
                            <option value="lesson">📅 Lesson Plan</option>
                            <option value="activity">🎯 SEL/STEM Activity</option>
                        </select>

                        {/* Class Filter */}
                        <select
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        >
                            <option value="all">All Classes</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(c => (
                                <option key={c} value={c}>Class {c}</option>
                            ))}
                        </select>

                        {/* Refresh Button */}
                        <button
                            onClick={loadSavedItems}
                            disabled={isLoading}
                            className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Saved Items List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading saved content...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600 text-lg mb-2">Failed to load saved content</p>
                            <p className="text-gray-500 text-sm mb-4">{error}</p>
                            <button
                                onClick={loadSavedItems}
                                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg">
                                {searchTerm || filterClass !== 'all' || filterType !== 'all' ? 'No matching saved content' : 'No saved content yet'}
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                Generate content and click "Save" to store it here
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-2xl">{getTypeIcon(item.type)}</span>
                                                <h3 className="font-bold text-lg text-gray-800 truncate">
                                                    {item.metadata.chapterName}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap text-sm">
                                                <span className={`px-2 py-1 rounded font-medium ${getTypeBadgeColor(item.type)}`}>
                                                    {getTypeLabel(item.type)}
                                                </span>
                                                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded font-medium">
                                                    Class {item.metadata.classLevel}
                                                </span>
                                                {item.metadata.subject && (
                                                    <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded font-medium">
                                                        {item.metadata.subject}
                                                    </span>
                                                )}
                                                {item.metadata.board && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                                                        {item.metadata.board}
                                                    </span>
                                                )}
                                                <span className="text-gray-500">
                                                    {formatTimestamp(item.metadata.timestamp)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onLoad(item)}
                                                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                                                title="Load this content"
                                            >
                                                Load
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.key)}
                                                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
