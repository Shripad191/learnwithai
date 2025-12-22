"use client";

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg text-white",
                colors[type]
            )}>
                <span className="text-xl font-bold">{icons[type]}</span>
                <span className="font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 hover:bg-white/20 rounded p-1 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
