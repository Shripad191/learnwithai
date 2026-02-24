"use client";

import React from 'react';
import type { ClassLevel } from '@/types';
import { cn, getComplexityDescription } from '@/lib/utils';

interface ClassSelectorProps {
    selectedClass: ClassLevel;
    onClassChange: (classLevel: ClassLevel) => void;
    disabled?: boolean;
}

export default function ClassSelector({
    selectedClass,
    onClassChange,
    disabled = false
}: ClassSelectorProps) {
    const classLevels: ClassLevel[] = [1, 2, 3, 4, 5, 6, 7, 8];

    return (
        <div className="flex-1">
            <div className="relative">
                <select
                    id="class-select"
                    value={selectedClass}
                    onChange={(e) => onClassChange(Number(e.target.value) as ClassLevel)}
                    disabled={disabled}
                    className={cn(
                        "w-full px-4 py-3 pr-10 rounded-lg font-medium text-base",
                        "border-2 border-gray-300 bg-white text-gray-900",
                        "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent",
                        "hover:border-gray-400 hover:shadow-md transition-all duration-200",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "cursor-pointer appearance-none"
                    )}
                >
                    {classLevels.map((level) => (
                        <option key={level} value={level}>
                            {['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'][level - 1]} Class {level}
                        </option>
                    ))}
                </select>

                {/* Custom Arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
