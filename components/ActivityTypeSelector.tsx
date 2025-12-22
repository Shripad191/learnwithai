"use client";

import React from 'react';
import type { ActivityType } from '@/types';

interface ActivityTypeSelectorProps {
    value: ActivityType;
    onChange: (type: ActivityType) => void;
}

export default function ActivityTypeSelector({ value, onChange }: ActivityTypeSelectorProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Activity Type
            </label>
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => onChange('solo')}
                    className={`px-4 py-4 rounded-lg border-2 transition-all duration-200 ${value === 'solo'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-md'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                >
                    <div className="text-3xl mb-2">🧑</div>
                    <div className="font-semibold">Solo Activity</div>
                    <p className="text-xs mt-1 opacity-75">Individual work</p>
                </button>
                <button
                    type="button"
                    onClick={() => onChange('group')}
                    className={`px-4 py-4 rounded-lg border-2 transition-all duration-200 ${value === 'group'
                        ? 'border-green-500 bg-green-50 text-green-700 font-semibold shadow-md'
                        : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                        }`}
                >
                    <div className="text-3xl mb-2">👥</div>
                    <div className="font-semibold">Group Activity</div>
                    <p className="text-xs mt-1 opacity-75">3-4 students</p>
                </button>
            </div>
        </div>
    );
}
