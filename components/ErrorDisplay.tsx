"use client";

import React from 'react';
import type { GenerationError } from '@/types';

interface ErrorDisplayProps {
    error: GenerationError;
    onRetry: () => void;
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
    return (
        <div className="w-full bg-red-50 border-2 border-red-200 rounded-xl p-6 animate-slide-up">
            <div className="flex items-start gap-4">
                {/* Error Icon */}
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Error Content */}
                <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-bold text-red-900">
                        Oops! Something went wrong
                    </h3>
                    <p className="text-red-800 text-sm">
                        {error.message}
                    </p>
                    {error.suggestion && (
                        <div className="bg-white border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">💡 Suggestion:</span> {error.suggestion}
                            </p>
                        </div>
                    )}

                    {/* Common Issues */}
                    <details className="text-sm">
                        <summary className="cursor-pointer font-medium text-red-900 hover:text-red-700">
                            Common issues and solutions
                        </summary>
                        <ul className="mt-2 space-y-1 text-gray-700 list-disc list-inside">
                            <li>Make sure your Gemini API key is correctly set in .env.local</li>
                            <li>Check your internet connection</li>
                            <li>Ensure the chapter content is at least 100 characters</li>
                            <li>Try reducing the chapter length if it's very long</li>
                            <li>Verify your API key has not exceeded its quota</li>
                        </ul>
                    </details>

                    {/* Retry Button */}
                    <button
                        onClick={onRetry}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}
