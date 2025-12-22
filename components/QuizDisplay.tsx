"use client";

import React, { useState } from 'react';
import type { Quiz, QuizQuestion } from '@/types';
import { cn } from '@/lib/utils';

interface QuizDisplayProps {
    quiz: Quiz;
}

export default function QuizDisplay({ quiz }: QuizDisplayProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'mcq' | 'tf' | 'sa'>('all');
    const [showAnswers, setShowAnswers] = useState(false);

    const mcqQuestions = quiz.questions.filter(q => q.type === 'multiple-choice');
    const tfQuestions = quiz.questions.filter(q => q.type === 'true-false');
    const saQuestions = quiz.questions.filter(q => q.type === 'short-answer');

    const getFilteredQuestions = () => {
        switch (activeTab) {
            case 'mcq': return mcqQuestions;
            case 'tf': return tfQuestions;
            case 'sa': return saQuestions;
            default: return quiz.questions;
        }
    };

    const renderQuestion = (question: QuizQuestion, index: number) => {
        const globalIndex = quiz.questions.indexOf(question) + 1;

        return (
            <div key={question.id} className="bg-white border-2 border-gray-200 rounded-lg p-5 stagger-item">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                        <span className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {globalIndex}
                        </span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                    "px-2 py-1 rounded text-xs font-medium",
                                    question.type === 'multiple-choice' && "bg-blue-100 text-blue-700",
                                    question.type === 'true-false' && "bg-green-100 text-green-700",
                                    question.type === 'short-answer' && "bg-purple-100 text-purple-700"
                                )}>
                                    {question.type === 'multiple-choice' && 'MCQ'}
                                    {question.type === 'true-false' && 'T/F'}
                                    {question.type === 'short-answer' && 'Short Answer'}
                                </span>
                                <span className={cn(
                                    "px-2 py-1 rounded text-xs font-medium",
                                    question.difficulty === 'easy' && "bg-green-50 text-green-600",
                                    question.difficulty === 'medium' && "bg-yellow-50 text-yellow-600",
                                    question.difficulty === 'hard' && "bg-red-50 text-red-600"
                                )}>
                                    {question.difficulty}
                                </span>
                            </div>
                            <p className="text-gray-800 font-medium text-base leading-relaxed">
                                {question.question}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Options for MCQ */}
                {question.type === 'multiple-choice' && question.options && (
                    <div className="ml-11 space-y-2 mt-3">
                        {question.options.map((option, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "p-3 rounded-lg border-2 transition-colors",
                                    showAnswers && idx === question.correctAnswer
                                        ? "bg-green-50 border-green-500"
                                        : "bg-gray-50 border-gray-200"
                                )}
                            >
                                <span className="font-medium text-gray-700 mr-2">
                                    {String.fromCharCode(65 + idx)}.
                                </span>
                                <span className="text-gray-800">{option}</span>
                                {showAnswers && idx === question.correctAnswer && (
                                    <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Answer for True/False */}
                {question.type === 'true-false' && showAnswers && (
                    <div className="ml-11 mt-3 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
                        <span className="font-semibold text-green-700">
                            Answer: {question.correctAnswer === 'true' ? 'True' : 'False'}
                        </span>
                    </div>
                )}

                {/* Answer for Short Answer */}
                {question.type === 'short-answer' && showAnswers && (
                    <div className="ml-11 mt-3 p-3 bg-blue-50 border-2 border-blue-500 rounded-lg">
                        <p className="text-sm font-semibold text-blue-700 mb-1">Expected Answer:</p>
                        <p className="text-gray-800">{question.correctAnswer}</p>
                    </div>
                )}

                {/* Explanation */}
                {showAnswers && question.explanation && (
                    <div className="ml-11 mt-3 p-3 bg-gray-50 border-l-4 border-secondary-500 rounded">
                        <p className="text-sm font-semibold text-gray-700 mb-1">💡 Explanation:</p>
                        <p className="text-sm text-gray-600">{question.explanation}</p>
                    </div>
                )}

                {/* Topic Tag */}
                <div className="ml-11 mt-3">
                    <span className="text-xs text-gray-500">
                        Topic: <span className="font-medium">{question.topic}</span>
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 px-6 py-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h3 className="text-xl font-bold text-white">📝 Quiz Questions</h3>
                        <p className="text-secondary-100 text-sm">
                            {quiz.questions.length} questions • Class {quiz.classLevel}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAnswers(!showAnswers)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
                    >
                        {showAnswers ? '🙈 Hide Answers' : '👁️ Show Answers'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50 px-6">
                <div className="flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={cn(
                            "px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap",
                            activeTab === 'all'
                                ? "border-secondary-500 text-secondary-700"
                                : "border-transparent text-gray-600 hover:text-gray-800"
                        )}
                    >
                        All ({quiz.questions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('mcq')}
                        className={cn(
                            "px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap",
                            activeTab === 'mcq'
                                ? "border-blue-500 text-blue-700"
                                : "border-transparent text-gray-600 hover:text-gray-800"
                        )}
                    >
                        MCQ ({mcqQuestions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('tf')}
                        className={cn(
                            "px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap",
                            activeTab === 'tf'
                                ? "border-green-500 text-green-700"
                                : "border-transparent text-gray-600 hover:text-gray-800"
                        )}
                    >
                        True/False ({tfQuestions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('sa')}
                        className={cn(
                            "px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap",
                            activeTab === 'sa'
                                ? "border-purple-500 text-purple-700"
                                : "border-transparent text-gray-600 hover:text-gray-800"
                        )}
                    >
                        Short Answer ({saQuestions.length})
                    </button>
                </div>
            </div>

            {/* Questions */}
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {getFilteredQuestions().map((question, index) => renderQuestion(question, index))}
            </div>
        </div>
    );
}
