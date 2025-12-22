"use client";

import React from 'react';
import FeatureCard from './FeatureCard';

interface LandingPageProps {
    onSelectTool: (tool: 'summary' | 'mindmap' | 'quiz' | 'lesson' | 'sel-stem') => void;
}

export default function LandingPage({ onSelectTool }: LandingPageProps) {
    const features = [
        {
            icon: '📝',
            title: 'Summary Generator',
            description: 'Transform lengthy chapters into concise, well-structured summaries perfect for quick revision.',
            gradientFrom: 'from-blue-500',
            gradientTo: 'to-cyan-500',
            tool: 'summary' as const,
            delay: 0.1
        },
        {
            icon: '🧠',
            title: 'Mind Map Generator',
            description: 'Visualize concepts with interactive mind maps that make complex topics easy to understand.',
            gradientFrom: 'from-purple-500',
            gradientTo: 'to-pink-500',
            tool: 'mindmap' as const,
            delay: 0.2
        },
        {
            icon: '📋',
            title: 'Quiz Generator',
            description: 'Create comprehensive quizzes automatically with MCQs, True/False, and short answer questions.',
            gradientFrom: 'from-green-500',
            gradientTo: 'to-emerald-500',
            tool: 'quiz' as const,
            delay: 0.3
        },
        {
            icon: '📅',
            title: 'Lesson Plan',
            description: 'Create time-based teaching plans with smart topic prioritization and customizable schedules.',
            gradientFrom: 'from-orange-500',
            gradientTo: 'to-red-500',
            tool: 'lesson' as const,
            delay: 0.4
        },
        {
            icon: '🎯',
            title: 'SEL/STEM Activities',
            description: 'Generate engaging activities that blend social-emotional learning with STEM concepts.',
            gradientFrom: 'from-indigo-500',
            gradientTo: 'to-purple-500',
            tool: 'sel-stem' as const,
            delay: 0.5
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent">
                        🎓 SeekhoWithAI
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        AI-Powered Educational Assistants for Class 1-8 Teachers
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Choose a tool to get started
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {features.map((feature) => (
                        <FeatureCard
                            key={feature.tool}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            gradientFrom={feature.gradientFrom}
                            gradientTo={feature.gradientTo}
                            onClick={() => onSelectTool(feature.tool)}
                            delay={feature.delay}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
