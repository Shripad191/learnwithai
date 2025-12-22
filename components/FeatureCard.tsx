"use client";

import React from 'react';

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    gradientFrom: string;
    gradientTo: string;
    onClick: () => void;
    delay?: number;
}

export default function FeatureCard({
    icon,
    title,
    description,
    gradientFrom,
    gradientTo,
    onClick,
    delay = 0
}: FeatureCardProps) {
    return (
        <div
            className="animate-fade-in stagger-item"
            style={{ animationDelay: `${delay}s` }}
        >
            <div
                onClick={onClick}
                className={`
                    relative group cursor-pointer
                    bg-white rounded-2xl shadow-lg border-2 border-gray-200
                    p-8 transition-all duration-300
                    hover:shadow-2xl hover:-translate-y-2
                    overflow-hidden
                `}
            >
                {/* Gradient Background on Hover */}
                <div className={`
                    absolute inset-0 opacity-0 group-hover:opacity-10
                    bg-gradient-to-br ${gradientFrom} ${gradientTo}
                    transition-opacity duration-300
                `} />

                {/* Content */}
                <div className="relative z-10">
                    {/* Icon */}
                    <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                        {icon}
                    </div>

                    {/* Title */}
                    <h3 className={`
                        text-2xl font-bold mb-3
                        bg-gradient-to-r ${gradientFrom} ${gradientTo}
                        bg-clip-text text-transparent
                    `}>
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {description}
                    </p>

                    {/* Launch Button */}
                    <button className={`
                        w-full px-6 py-3 rounded-lg font-semibold
                        bg-gradient-to-r ${gradientFrom} ${gradientTo}
                        text-white shadow-md
                        transform group-hover:scale-105
                        transition-all duration-300
                        hover:shadow-lg
                    `}>
                        Launch Tool →
                    </button>
                </div>

                {/* Decorative Corner */}
                <div className={`
                    absolute -top-10 -right-10 w-32 h-32 rounded-full
                    bg-gradient-to-br ${gradientFrom} ${gradientTo}
                    opacity-10 group-hover:opacity-20
                    transition-opacity duration-300
                `} />
            </div>
        </div>
    );
}
