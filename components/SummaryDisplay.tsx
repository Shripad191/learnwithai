"use client";

import React, { useState } from 'react';
import type { SummaryStructure } from '@/types';
import { cn } from '@/lib/utils';

interface SummaryDisplayProps {
    summary: SummaryStructure;
}

export default function SummaryDisplay({ summary }: SummaryDisplayProps) {
    const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set([0]));
    const [expandedSubTopics, setExpandedSubTopics] = useState<Set<string>>(new Set());
    const [copied, setCopied] = useState(false);

    const toggleTopic = (index: number) => {
        const newExpanded = new Set(expandedTopics);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedTopics(newExpanded);
    };

    const toggleSubTopic = (topicIndex: number, subTopicIndex: number) => {
        const key = `${topicIndex}-${subTopicIndex}`;
        const newExpanded = new Set(expandedSubTopics);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedSubTopics(newExpanded);
    };

    const handleCopy = async () => {
        const text = formatSummaryAsText(summary);
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">{summary.chapterName}</h2>
                    <p className="text-primary-100 text-sm">Class {summary.classLevel} Summary</p>
                </div>
                <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {summary.mainTopics.map((topic, topicIndex) => (
                    <div key={topicIndex} className="border border-gray-200 rounded-lg overflow-hidden stagger-item">
                        {/* Main Topic */}
                        <button
                            onClick={() => toggleTopic(topicIndex)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 bg-primary-500 text-white rounded-full text-sm font-bold">
                                    {topicIndex + 1}
                                </span>
                                <span className="font-semibold text-gray-800 text-left">
                                    {topic.name}
                                </span>
                            </div>
                            <svg
                                className={cn(
                                    "w-5 h-5 text-primary-600 transition-transform duration-200",
                                    expandedTopics.has(topicIndex) && "rotate-180"
                                )}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Sub Topics */}
                        {expandedTopics.has(topicIndex) && (
                            <div className="p-4 space-y-3 bg-white">
                                {topic.subTopics.map((subTopic, subTopicIndex) => (
                                    <div key={subTopicIndex} className="border-l-4 border-secondary-300 pl-4">
                                        <button
                                            onClick={() => toggleSubTopic(topicIndex, subTopicIndex)}
                                            className="w-full text-left flex items-center justify-between group hover:bg-gray-50 p-2 rounded transition-colors"
                                        >
                                            <span className="font-medium text-gray-700">
                                                {subTopic.name}
                                            </span>
                                            <svg
                                                className={cn(
                                                    "w-4 h-4 text-secondary-500 transition-transform duration-200",
                                                    expandedSubTopics.has(`${topicIndex}-${subTopicIndex}`) && "rotate-180"
                                                )}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Key Points */}
                                        {expandedSubTopics.has(`${topicIndex}-${subTopicIndex}`) && (
                                            <div className="mt-2 space-y-2 pl-2">
                                                {subTopic.keyPoints.map((keyPoint, keyPointIndex) => (
                                                    <div key={keyPointIndex} className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-start gap-2">
                                                            <span className="flex-shrink-0 w-6 h-6 bg-secondary-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                                                {keyPointIndex + 1}
                                                            </span>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-800 text-sm mb-1">
                                                                    {keyPoint.point}
                                                                </p>
                                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                                    {keyPoint.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatSummaryAsText(summary: SummaryStructure): string {
    let text = `${summary.chapterName} - Class ${summary.classLevel} Summary\n\n`;

    summary.mainTopics.forEach((topic, topicIndex) => {
        text += `${topicIndex + 1}. ${topic.name}\n`;
        topic.subTopics.forEach((subTopic, subTopicIndex) => {
            text += `   ${topicIndex + 1}.${subTopicIndex + 1} ${subTopic.name}\n`;
            subTopic.keyPoints.forEach((keyPoint, keyPointIndex) => {
                text += `      • ${keyPoint.point}\n`;
                text += `        ${keyPoint.description}\n`;
            });
        });
        text += '\n';
    });

    return text;
}
