"use client";

import React from 'react';
import { cn } from '@/lib/utils';

const SUBJECTS = [
    { value: '', label: 'Select Subject', color: 'text-gray-700', gradient: 'from-gray-50 to-slate-50' },
    { value: 'science', label: '🔬 Science', color: 'text-green-700', gradient: 'from-green-50 to-emerald-50' },
    { value: 'mathematics', label: '🔢 Mathematics', color: 'text-blue-700', gradient: 'from-blue-50 to-cyan-50' },
    { value: 'english', label: '📚 English', color: 'text-purple-700', gradient: 'from-purple-50 to-pink-50' },
    { value: 'social_studies', label: '🌍 Social Studies', color: 'text-orange-700', gradient: 'from-orange-50 to-amber-50' },
    { value: 'hindi', label: '🇮🇳 Hindi', color: 'text-red-700', gradient: 'from-red-50 to-orange-50' },
    { value: 'computer', label: '💻 Computer', color: 'text-cyan-700', gradient: 'from-cyan-50 to-blue-50' },
    { value: 'evs', label: '🌱 EVS', color: 'text-lime-700', gradient: 'from-lime-50 to-green-50' },
    { value: 'other', label: '📖 Other', color: 'text-gray-700', gradient: 'from-gray-50 to-slate-50' },
];

interface SubjectSelectorProps {
    selectedSubject?: string;
    onSubjectChange: (subject: string) => void;
    disabled?: boolean;
}

export default function SubjectSelector({
    selectedSubject,
    onSubjectChange,
    disabled = false
}: SubjectSelectorProps) {
    const currentSubject = SUBJECTS.find(s => s.value === selectedSubject);

    return (
        <div className="relative">
            <select
                id="subject-select"
                value={selectedSubject || ''}
                onChange={(e) => onSubjectChange(e.target.value)}
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
                {SUBJECTS.map((subject) => (
                    <option
                        key={subject.value}
                        value={subject.value}
                    >
                        {subject.label}
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
    );
}
