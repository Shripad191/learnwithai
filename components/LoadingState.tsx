"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
    stage: 'summary' | 'mindmap' | 'quiz';
}

export default function LoadingState({ stage }: LoadingStateProps) {
    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 p-8 animate-fade-in">
            <div className="flex flex-col items-center justify-center space-y-6">
                {/* Animated Spinner */}
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary-200 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">
                        {stage === 'summary' ? 'Generating Summary...' :
                            stage === 'mindmap' ? 'Creating Mind Map...' :
                                'Generating Quiz...'}
                    </h3>
                    <p className="text-gray-600 text-sm max-w-md">
                        {stage === 'summary'
                            ? 'Analyzing chapter content and extracting key concepts tailored for the selected class level...'
                            : stage === 'mindmap'
                                ? 'Building an interactive mind map structure from the generated summary...'
                                : 'Creating engaging quiz questions to assess student understanding...'
                        }
                    </p>
                </div>

                {/* Progress Dots */}
                <div className="flex gap-2">
                    <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>

                {/* Estimated Time */}
                <p className="text-xs text-gray-500">
                    This may take 10-15 seconds...
                </p>
            </div>
        </div>
    );
}
