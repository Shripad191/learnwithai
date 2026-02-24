"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
    delay?: number;
}

export default function FeatureCard({
    icon,
    title,
    description,
    onClick,
    delay = 0
}: FeatureCardProps) {
    return (
        <div
            className="animate-fade-in stagger-item"
            style={{ animationDelay: `${delay}s` }}
        >
            <Card
                onClick={onClick}
                className={cn(
                    "relative group cursor-pointer bg-white",
                    "border-2 border-gray-200 transition-all duration-300",
                    "hover:shadow-lg hover:border-gray-300 hover:-translate-y-1"
                )}
            >
                {/* Content */}
                <CardHeader>
                    {/* Icon and Title on same line */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                            {icon}
                        </div>
                        <CardTitle className="text-xl text-gray-900">
                            {title}
                        </CardTitle>
                    </div>

                    {/* Description */}
                    <CardDescription className="text-sm leading-relaxed mb-6 text-gray-600">
                        {description}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Launch Button */}
                    <Button
                        className={cn(
                            "w-full font-semibold",
                            "bg-blue-500 text-white",
                            "hover:bg-blue-600",
                            "transition-all duration-300"
                        )}
                    >
                        Launch Tool →
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
