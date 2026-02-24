"use client";

import React from 'react';
import type { Board } from '@/types';

interface BoardSelectorProps {
    value: Board | '';
    onChange: (board: Board) => void;
    disabled?: boolean;
}

export default function BoardSelector({ value, onChange, disabled = false }: BoardSelectorProps) {
    const boards: { value: Board; label: string; icon: string; description: string }[] = [
        { value: 'CBSE', label: 'CBSE', icon: '📚', description: 'Central Board of Secondary Education' },
        { value: 'ICSE', label: 'ICSE', icon: '📖', description: 'Indian Certificate of Secondary Education' },
        { value: 'State Board', label: 'State Board', icon: '🏫', description: 'State Education Board' },
        { value: 'IB', label: 'IB', icon: '🌍', description: 'International Baccalaureate' },
        { value: 'IGCSE', label: 'IGCSE', icon: '🎓', description: 'Cambridge IGCSE' }
    ];

    return (
        <select
            id="board-select"
            value={value}
            onChange={(e) => onChange(e.target.value as Board)}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm
                     focus:border-gray-400 focus:ring-2 focus:ring-gray-400 
                     disabled:bg-gray-100 disabled:cursor-not-allowed
                     transition-all duration-200 cursor-pointer
                     text-gray-900 font-medium
                     hover:border-gray-400"
        >
            <option value="">Select Board</option>
            {boards.map((board) => (
                <option key={board.value} value={board.value}>
                    {board.icon} {board.label} - {board.description}
                </option>
            ))}
        </select>
    );
}
