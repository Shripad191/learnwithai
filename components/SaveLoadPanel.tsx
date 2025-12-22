"use client";

import React, { useState, useEffect } from 'react';
import type { SavedMindMap } from '@/lib/storage';
import {
    getSavedMindMaps,
    deleteSavedMindMap,
    exportAsJSON,
    importFromJSON,
    formatTimestamp,
    getStorageInfo
} from '@/lib/storage';
import { cn } from '@/lib/utils';

interface SaveLoadPanelProps {
    onLoad: (item: SavedMindMap) => void;
    onClose: () => void;
}

export default function SaveLoadPanel({ onLoad, onClose }: SaveLoadPanelProps) {
    const [savedItems, setSavedItems] = useState<SavedMindMap[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState<number | 'all'>('all');
    const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0, percentage: 0 });

    useEffect(() => {
        loadSavedItems();
    }, []);

    const loadSavedItems = () => {
        const items = getSavedMindMaps();
        setSavedItems(items);
        setStorageInfo(getStorageInfo());
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this saved mind map?')) {
            deleteSavedMindMap(id);
            loadSavedItems();
        }
    };

    const handleExport = (item: SavedMindMap) => {
        exportAsJSON(item);
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const imported = await importFromJSON(file);
            onLoad(imported);
            onClose();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to import file');
        }
    };

    const filteredItems = savedItems.filter(item => {
        const matchesSearch = item.chapterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.subject?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass === 'all' || item.classLevel === filterClass;
        return matchesSearch && matchesClass;
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Saved Mind Maps</h2>
                        <p className="text-white/80 text-sm">
                            {savedItems.length} saved • {storageInfo.percentage.toFixed(1)}% storage used
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

                {/* Filters & Import */}
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

                        {/* Import Button */}
                        <label className="px-4 py-2 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Import JSON
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Saved Items List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg">
                                {searchTerm || filterClass !== 'all' ? 'No matching saved mind maps' : 'No saved mind maps yet'}
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                Generate a mind map and click "Save" to store it here
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
                                            <h3 className="font-bold text-lg text-gray-800 truncate">
                                                {item.chapterName}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded font-medium">
                                                    Class {item.classLevel}
                                                </span>
                                                {item.subject && (
                                                    <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded font-medium">
                                                        {item.subject}
                                                    </span>
                                                )}
                                                <span className="text-gray-500">
                                                    {formatTimestamp(item.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                {item.summary.mainTopics.length} main topics • {
                                                    item.summary.mainTopics.reduce((acc, t) => acc + t.subTopics.length, 0)
                                                } sub topics
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => onLoad(item)}
                                                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                                                title="Load this mind map"
                                            >
                                                Load
                                            </button>
                                            <button
                                                onClick={() => handleExport(item)}
                                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                                title="Export as JSON"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
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
