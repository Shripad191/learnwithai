"use client";

import React, { useState } from 'react';
import type { SELSTEMActivity } from '@/types';

interface SELSTEMActivityDisplayProps {
    activity: SELSTEMActivity;
}

export default function SELSTEMActivityDisplay({ activity }: SELSTEMActivityDisplayProps) {
    const [activeSection, setActiveSection] = useState<'instructions' | 'objectives' | 'assessment'>('instructions');

    const handleExport = () => {
        const content = `
${activity.title}
${'='.repeat(activity.title.length)}

Class: ${activity.classLevel} | Subject: ${activity.subject} | Type: ${activity.activityType === 'solo' ? 'Solo Activity' : 'Group Activity'}
Duration: ${activity.duration}

SEL FOCUS
---------
${activity.selFocus.map(skill => `• ${skill}`).join('\n')}

REAL-WORLD CONNECTION
---------------------
${activity.realWorldConnection}

MATERIALS NEEDED
----------------
${activity.materials.map(item => `• ${item}`).join('\n')}

SETUP
-----
${activity.instructions.setup}

ACTIVITY STEPS
--------------
${activity.instructions.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

REFLECTION
----------
${activity.instructions.reflection}

LEARNING OBJECTIVES
-------------------
${activity.learningObjectives.map(obj => `• ${obj}`).join('\n')}

ASSESSMENT CRITERIA
-------------------
${activity.assessmentCriteria.map(criteria => `• ${criteria}`).join('\n')}

EXTENSIONS
----------
${activity.extensions.map(ext => `• ${ext}`).join('\n')}
        `.trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SEL_STEM_Activity_${activity.title.replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-3xl">{activity.activityType === 'solo' ? '🧑' : '👥'}</span>
                            {activity.title}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                📚 Class {activity.classLevel}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                📖 {activity.subject}
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                ⏱️ {activity.duration}
                            </span>
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                {activity.activityType === 'solo' ? '🧑 Solo' : '👥 Group'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleExport}
                        className="ml-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export
                    </button>
                </div>
            </div>

            {/* SEL Focus & Real-World Connection */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-5">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        SEL Focus
                    </h3>
                    <ul className="space-y-2">
                        {activity.selFocus.map((skill, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-yellow-600 font-bold">•</span>
                                <span>{skill}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">🌍</span>
                        Real-World Connection
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{activity.realWorldConnection}</p>
                </div>
            </div>

            {/* Materials */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">🎨</span>
                    Materials Needed
                </h3>
                <div className="grid md:grid-cols-2 gap-2">
                    {activity.materials.map((material, i) => (
                        <div key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>{material}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabbed Content */}
            <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b-2 border-gray-200">
                    <button
                        onClick={() => setActiveSection('instructions')}
                        className={`flex-1 px-6 py-4 font-semibold transition-all ${activeSection === 'instructions'
                            ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-500'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        📋 Instructions
                    </button>
                    <button
                        onClick={() => setActiveSection('objectives')}
                        className={`flex-1 px-6 py-4 font-semibold transition-all ${activeSection === 'objectives'
                            ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-500'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        🎯 Objectives
                    </button>
                    <button
                        onClick={() => setActiveSection('assessment')}
                        className={`flex-1 px-6 py-4 font-semibold transition-all ${activeSection === 'assessment'
                            ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-500'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        ✅ Assessment
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeSection === 'instructions' && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3">Setup</h4>
                                <p className="text-gray-700 leading-relaxed">{activity.instructions.setup}</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 mb-3">Activity Steps</h4>
                                <ol className="space-y-3">
                                    {activity.instructions.steps.map((step, i) => (
                                        <li key={i} className="flex gap-3">
                                            <span className="flex-shrink-0 w-7 h-7 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                                {i + 1}
                                            </span>
                                            <span className="text-gray-700 leading-relaxed pt-0.5">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <span>🤔</span>
                                    Reflection
                                </h4>
                                <p className="text-gray-700 leading-relaxed">{activity.instructions.reflection}</p>
                            </div>
                        </div>
                    )}

                    {activeSection === 'objectives' && (
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-800">Learning Objectives</h4>
                            <ul className="space-y-3">
                                {activity.learningObjectives.map((objective, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-green-600 font-bold text-lg">✓</span>
                                        <span className="text-gray-700 leading-relaxed">{objective}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                <h4 className="font-bold text-gray-800 mb-3">Extensions & Variations</h4>
                                <ul className="space-y-2">
                                    {activity.extensions.map((extension, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-blue-600 font-bold">•</span>
                                            <span className="text-gray-700 text-sm">{extension}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeSection === 'assessment' && (
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-800">Assessment Criteria</h4>
                            <div className="space-y-3">
                                {activity.assessmentCriteria.map((criteria, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                            {i + 1}
                                        </span>
                                        <span className="text-gray-700 leading-relaxed">{criteria}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
