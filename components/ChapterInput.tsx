"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ChapterInputProps {
    value: string;
    onChange: (value: string) => void;
    chapterName: string;
    onChapterNameChange: (name: string) => void;
    disabled?: boolean;
}

export default function ChapterInput({
    value,
    onChange,
    chapterName,
    onChapterNameChange,
    disabled = false
}: ChapterInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const charCount = value.length;
    const maxChars = 50000;

    const handleClear = () => {
        onChange('');
        onChapterNameChange('');
    };

    return (
        <div className="w-full space-y-4">
            {/* Chapter Name Input */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chapter Name
                </label>
                <input
                    type="text"
                    value={chapterName}
                    onChange={(e) => onChapterNameChange(e.target.value)}
                    disabled={disabled}
                    placeholder="e.g., Photosynthesis, The Solar System, etc."
                    className={cn(
                        "w-full px-4 py-3 rounded-lg border-2 transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                        "disabled:bg-gray-100 disabled:cursor-not-allowed",
                        "placeholder:text-gray-400"
                    )}
                />
            </div>

            {/* Chapter Content Input */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Chapter Content
                    </label>
                    {value && (
                        <button
                            onClick={handleClear}
                            disabled={disabled}
                            className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
                        >
                            Clear All
                        </button>
                    )}
                </div>
                <div className="relative">
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        disabled={disabled}
                        placeholder="Paste your chapter content here... Include all the text from the chapter that you want to summarize and convert into a mind map."
                        className={cn(
                            "w-full h-48 px-4 py-3 rounded-lg border-2 transition-all duration-200 resize-none",
                            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                            "disabled:bg-gray-100 disabled:cursor-not-allowed",
                            "placeholder:text-gray-400 font-mono text-sm",
                            isFocused && "shadow-lg"
                        )}
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded-md",
                            charCount > maxChars
                                ? "bg-red-100 text-red-700"
                                : charCount > maxChars * 0.9
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                        )}>
                            {charCount.toLocaleString()} / {maxChars.toLocaleString()}
                        </span>
                    </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    <strong>💡 Tip:</strong> You can either paste full chapter content (min 100 characters) OR just enter a topic name above to generate educational content about that topic!
                </p>
            </div>
        </div>
    );
}
