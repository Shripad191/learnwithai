"use client";

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { LessonPlan, Lecture } from '@/types';
import type { OutputData } from '@editorjs/editorjs';
import ReactMarkdown from 'react-markdown';
import { lessonPlanToEditorJS } from '@/lib/editorjs-converters';

const Editor = dynamic(() => import('@/components/Editor'), {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-64 flex items-center justify-center"><p className="text-gray-500">Loading editor...</p></div>,
    ssr: false
});

interface LessonPlanDisplayProps {
    lessonPlan: LessonPlan;
    onGeneratePPT?: (lectureNumber: number, lecture: Lecture) => void;
    isGeneratingPPT?: boolean;
    generatingPPTForLecture?: number | null;
    onEditorDataChange?: (data: OutputData) => void;
}

export default function LessonPlanDisplay({ lessonPlan, onGeneratePPT, isGeneratingPPT = false, generatingPPTForLecture = null, onEditorDataChange }: LessonPlanDisplayProps) {
    const [activeLecture, setActiveLecture] = useState<number>(0);
    const [activeCard, setActiveCard] = useState<number>(0);
    const [showHomework, setShowHomework] = useState<boolean>(false);
    const [showParentMessage, setShowParentMessage] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editorData, setEditorData] = useState<OutputData | null>(null);

    // Convert lesson plan to Editor.js format (memoized)
    const initialEditorData = useMemo(() => {
        return lessonPlanToEditorJS(lessonPlan);
    }, [lessonPlan]);

    const handleEditorChange = (data: OutputData) => {
        setEditorData(data);
        if (onEditorDataChange) {
            onEditorDataChange(data);
        }
    };

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const currentLecture = lessonPlan.lectures[activeLecture];

    const cards = [
        {
            id: 0,
            title: "📋 Today's Plan",
            content: currentLecture.teachPackCards.todaysPlan,
            color: 'from-gray-500 to-gray-700',
            icon: '📋'
        },
        {
            id: 1,
            title: "🎯 Start (Hook)",
            content: currentLecture.teachPackCards.start,
            color: 'from-gray-500 to-gray-700',
            icon: '🎯'
        },
        {
            id: 2,
            title: "💡 Explain",
            content: currentLecture.teachPackCards.explain,
            color: 'from-gray-500 to-gray-700',
            icon: '💡'
        },
        {
            id: 3,
            title: "✋ Do (Activity)",
            content: currentLecture.teachPackCards.do,
            color: 'from-gray-500 to-gray-700',
            icon: '✋'
        },
        {
            id: 4,
            title: "💬 Talk (Discussion)",
            content: currentLecture.teachPackCards.talk,
            color: 'from-gray-500 to-gray-700',
            icon: '💬'
        },
        {
            id: 5,
            title: "✅ Check (Assessment)",
            content: currentLecture.teachPackCards.check,
            color: 'from-gray-500 to-gray-700',
            icon: '✅'
        }
    ];

    const handleLectureChange = (lectureIndex: number) => {
        setActiveLecture(lectureIndex);
        setActiveCard(0);
        setShowHomework(false);
        setShowParentMessage(false);
    };

    const handleShowHomework = () => {
        setShowHomework(true);
        setShowParentMessage(false);
    };

    const handleShowParentMessage = () => {
        setShowParentMessage(true);
        setShowHomework(false);
    };

    return (
        <div className="space-y-6">
            {/* Edit Button - Always visible */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">📚 Lesson Plan</h3>
                <button
                    onClick={toggleEditMode}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    {isEditMode ? '👁️ View' : '✏️ Edit'}
                </button>
            </div>

            {/* Content: Either Editor or Lesson Plan View */}
            {isEditMode ? (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <Editor
                        initialData={editorData || initialEditorData}
                        onChange={handleEditorChange}
                        placeholder="Edit your lesson plan..."
                        minHeight={500}
                    />
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="bg-gradient-to-r gray-50  border-2 border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="text-3xl">📚</span>
                                    Teach Pack: {lessonPlan.topic}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {lessonPlan.board} | Class {lessonPlan.classLevel} | {lessonPlan.subject}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-orange-600">
                                    {Math.floor(lessonPlan.totalMinutes / 60)}h {lessonPlan.totalMinutes % 60}m
                                </div>
                                <div className="text-sm text-gray-600">Total Duration</div>
                                <div className="text-lg font-semibold text-orange-700 mt-1">
                                    {lessonPlan.totalLectures} Lectures
                                </div>
                            </div>
                        </div>

                        {/* Pace Badge */}
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                                {lessonPlan.teachingPace === 'traditional' && 'Traditional (Content-focused)'}
                                {lessonPlan.teachingPace === 'activity' && 'Activity Based (Hands-on)'}
                                {lessonPlan.teachingPace === 'nep' && 'NEP/NCF (Balanced)'}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {lessonPlan.language}
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                NEP 2020 Compliant
                            </span>
                        </div>
                    </div>

                    {/* Lecture Navigation */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Select Lecture:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {lessonPlan.lectures.map((lecture, index) => (
                                <div key={index} className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleLectureChange(index)}
                                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${activeLecture === index && !showHomework && !showParentMessage
                                            ? 'border-gray-500 bg-gray-150 shadow-md scale-105'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">
                                            {lecture.isActivityLecture ? '🎨' : '📖'}
                                        </div>
                                        <div className="text-sm font-bold text-gray-800">
                                            Lecture {lecture.lectureNumber}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {lecture.duration} min
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {lecture.complexity === 'easy' && '⭐'}
                                            {lecture.complexity === 'moderate' && '⭐⭐'}
                                            {lecture.complexity === 'difficult' && '⭐⭐⭐'}
                                        </div>
                                    </button>
                                    {/* Generate PPT Button */}
                                    {onGeneratePPT && (
                                        <button
                                            onClick={() => onGeneratePPT(lecture.lectureNumber, lecture)}
                                            disabled={isGeneratingPPT && generatingPPTForLecture === lecture.lectureNumber}
                                            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1"
                                        >
                                            {isGeneratingPPT && generatingPPTForLecture === lecture.lectureNumber ? (
                                                <>
                                                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                    </svg>
                                                    Generate PPT
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Homework Button */}
                            <button
                                onClick={handleShowHomework}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 ${showHomework
                                    ? 'border-teal-500 bg-teal-50 shadow-md scale-105'
                                    : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="text-2xl mb-1">📝</div>
                                <div className="text-sm font-bold text-gray-800">Homework</div>
                                <div className="text-xs text-gray-600 mt-1">Practice</div>
                            </button>

                            {/* Parent Message Button */}
                            <button
                                onClick={handleShowParentMessage}
                                className={`p-4 rounded-lg border-2 transition-all duration-200 ${showParentMessage
                                    ? 'border-green-500 bg-green-50 shadow-md scale-105'
                                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="text-2xl mb-1">📱</div>
                                <div className="text-sm font-bold text-gray-800">Parent Msg</div>
                                <div className="text-xs text-gray-600 mt-1">WhatsApp</div>
                            </button>
                        </div>
                    </div>

                    {/* Homework Display */}
                    {showHomework && (
                        <div className="bg-gradient-to-br from-teal-500 to-green-500 p-1 rounded-xl shadow-xl">
                            <div className="bg-white rounded-lg p-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="text-3xl">📝</span>
                                    Homework (Not Time-Bounded)
                                </h3>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-2" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-700 mt-3 mb-2" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-700 mt-2 mb-1" {...props} />,
                                            p: ({ node, ...props }) => <p className="text-gray-700 mb-2 leading-relaxed" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-3" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-3" {...props} />,
                                            li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-semibold text-gray-800" {...props} />,
                                            em: ({ node, ...props }) => <em className="italic text-gray-600" {...props} />,
                                            code: ({ node, ...props }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props} />,
                                        }}
                                    >
                                        {lessonPlan.homework}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Parent Message Display */}
                    {showParentMessage && (
                        <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-1 rounded-xl shadow-xl">
                            <div className="bg-white rounded-lg p-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="text-3xl">📱</span>
                                    Parent WhatsApp Message
                                </h3>
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-2" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-700 mt-3 mb-2" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-700 mt-2 mb-1" {...props} />,
                                            p: ({ node, ...props }) => <p className="text-gray-700 mb-2 leading-relaxed" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-3" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-3" {...props} />,
                                            li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-semibold text-gray-800" {...props} />,
                                            em: ({ node, ...props }) => <em className="italic text-gray-600" {...props} />,
                                            code: ({ node, ...props }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props} />,
                                        }}
                                    >
                                        {lessonPlan.parentMessage}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lecture Content Display */}
                    {!showHomework && !showParentMessage && (
                        <>
                            {/* Lecture Info */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                            {currentLecture.isActivityLecture ? '🎨' : '📖'}
                                            {currentLecture.title}
                                        </h3>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                                {currentLecture.duration} minutes
                                            </span>
                                            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                                                {currentLecture.complexity.charAt(0).toUpperCase() + currentLecture.complexity.slice(1)}
                                            </span>
                                            {currentLecture.isActivityLecture && (
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                                    🎨 Activity Lecture
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-sm font-semibold text-gray-700 mb-1">Topics Covered:</p>
                                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                                {currentLecture.topics.map((topic, idx) => (
                                                    <li key={idx}>{topic}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recap Section */}
                            {currentLecture.hasRecap && currentLecture.recapContent && (
                                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-5">
                                    <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="text-2xl">🔄</span>
                                        5-Minute Recap (Previous Lecture)
                                    </h4>
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-2" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-700 mt-3 mb-2" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-700 mt-2 mb-1" {...props} />,
                                                p: ({ node, ...props }) => <p className="text-gray-700 mb-2 leading-relaxed" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-3" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-3" {...props} />,
                                                li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold text-gray-800" {...props} />,
                                                em: ({ node, ...props }) => <em className="italic text-gray-600" {...props} />,
                                                code: ({ node, ...props }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props} />,
                                            }}
                                        >
                                            {currentLecture.recapContent}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                            {/* Card Navigation */}
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                {cards.map((card) => (
                                    <button
                                        key={card.id}
                                        onClick={() => setActiveCard(card.id)}
                                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${activeCard === card.id
                                            ? 'border-gray-500 bg-gray-150 shadow-md scale-105'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">{card.icon}</div>
                                        <div className="text-xs font-medium text-gray-700 text-center">
                                            {card.title.replace(/[📋🎯💡✋💬✅]/g, '').trim()}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Active Card Display */}
                            <div className={`bg-gradient-to-br ${cards[activeCard].color} p-1 rounded-xl shadow-xl`}>
                                <div className="bg-white rounded-lg p-6">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-3xl">{cards[activeCard].icon}</span>
                                        {cards[activeCard].title}
                                    </h3>

                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-2" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-700 mt-3 mb-2" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-700 mt-2 mb-1" {...props} />,
                                                p: ({ node, ...props }) => <p className="text-gray-700 mb-2 leading-relaxed" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-3" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-3" {...props} />,
                                                li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold text-gray-800" {...props} />,
                                                em: ({ node, ...props }) => <em className="italic text-gray-600" {...props} />,
                                                code: ({ node, ...props }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props} />,
                                            }}
                                        >
                                            {cards[activeCard].content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => setActiveCard(Math.max(0, activeCard - 1))}
                                    disabled={activeCard === 0}
                                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-lg transition-all"
                                >
                                    ← Previous Card
                                </button>

                                <div className="text-sm text-gray-600">
                                    Card {activeCard + 1} of {cards.length}
                                </div>

                                <button
                                    onClick={() => setActiveCard(Math.min(cards.length - 1, activeCard + 1))}
                                    disabled={activeCard === cards.length - 1}
                                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                                >
                                    Next Card →
                                </button>
                            </div>
                        </>
                    )}

                    {/* Export Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={() => {
                                let text = `TEACH PACK: ${lessonPlan.topic}\n`;
                                text += `${'='.repeat(80)}\n\n`;
                                text += `Board: ${lessonPlan.board} | Class: ${lessonPlan.classLevel} | Subject: ${lessonPlan.subject}\n`;
                                text += `Total Duration: ${lessonPlan.totalMinutes} minutes | Lectures: ${lessonPlan.totalLectures}\n\n`;

                                lessonPlan.lectures.forEach((lecture, idx) => {
                                    text += `\n${'='.repeat(80)}\n`;
                                    text += `LECTURE ${lecture.lectureNumber}: ${lecture.title}\n`;
                                    text += `Duration: ${lecture.duration} min | Complexity: ${lecture.complexity}\n`;
                                    text += `Topics: ${lecture.topics.join(', ')}\n`;
                                    text += `${'='.repeat(80)}\n\n`;

                                    if (lecture.hasRecap && lecture.recapContent) {
                                        text += `🔄 RECAP (5 minutes)\n${'-'.repeat(50)}\n${lecture.recapContent}\n\n`;
                                    }

                                    text += `📋 TODAY'S PLAN\n${'-'.repeat(50)}\n${lecture.teachPackCards.todaysPlan}\n\n`;
                                    text += `🎯 START (HOOK)\n${'-'.repeat(50)}\n${lecture.teachPackCards.start}\n\n`;
                                    text += `💡 EXPLAIN\n${'-'.repeat(50)}\n${lecture.teachPackCards.explain}\n\n`;
                                    text += `✋ DO (ACTIVITY)\n${'-'.repeat(50)}\n${lecture.teachPackCards.do}\n\n`;
                                    text += `💬 TALK (DISCUSSION)\n${'-'.repeat(50)}\n${lecture.teachPackCards.talk}\n\n`;
                                    text += `✅ CHECK (ASSESSMENT)\n${'-'.repeat(50)}\n${lecture.teachPackCards.check}\n\n`;
                                });

                                text += `\n${'='.repeat(80)}\n`;
                                text += `📝 HOMEWORK (NOT TIME-BOUNDED)\n`;
                                text += `${'='.repeat(80)}\n${lessonPlan.homework}\n\n`;

                                text += `${'='.repeat(80)}\n`;
                                text += `📱 PARENT WHATSAPP MESSAGE\n`;
                                text += `${'='.repeat(80)}\n${lessonPlan.parentMessage}\n`;

                                const blob = new Blob([text], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `TeachPack_${lessonPlan.topic.replace(/\s+/g, '_')}.txt`;
                                a.click();
                            }}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export Complete Teach Pack
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
