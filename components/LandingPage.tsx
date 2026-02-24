"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import FeatureCard from './FeatureCard';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

interface LandingPageProps {
    onSelectTool: (tool: 'summary' | 'mindmap' | 'quiz' | 'lesson' | 'sel-stem') => void;
}

export default function LandingPage({ onSelectTool }: LandingPageProps) {
    const { user, signOut } = useAuth();

    const features = [
        {
            icon: '📝',
            title: 'Summary Generator',
            description: 'Transform lengthy chapters into concise, well-structured summaries perfect for quick revision.',
            tool: 'summary' as const,
            delay: 0.1
        },
        {
            icon: '🧠',
            title: 'Mind Map Generator',
            description: 'Visualize concepts with interactive mind maps that make complex topics easy to learn and understand.',
            tool: 'mindmap' as const,
            delay: 0.2
        },
        {
            icon: '📋',
            title: 'Quiz Generator',
            description: 'Create comprehensive quizzes automatically with MCQs, True/False, and short answer questions.',
            tool: 'quiz' as const,
            delay: 0.3
        },
        {
            icon: '📅',
            title: 'Lesson Plan',
            description: 'Create time-based teaching plans with smart topic prioritization and customizable schedules.',
            tool: 'lesson' as const,
            delay: 0.4
        },
        {
            icon: '🎯',
            title: 'SEL/STEM Activities',
            description: 'Generate engaging activities that blend social-emotional learning with real world concepts.',
            tool: 'sel-stem' as const,
            delay: 0.5
        },
    ];

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header with Logo and User Profile */}
                <div className="flex justify-between items-start mb-12 animate-fade-in">
                    {/* Left: SeekhoWithAI Header */}
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-900">
                            🎓 LearnWithAI
                        </h1>
                        <p className="text-md text-gray-600">
                            AI-Powered Educational Assistants for Class 1-8 Teachers
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Choose a tool to get started
                        </p>
                    </div>

                    {/* Right: User Profile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-gray-900 text-white font-bold text-lg">
                                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                                    <p className="text-xs leading-none text-muted-foreground">Logged in</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign Out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>


                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {features.map((feature) => (
                        <FeatureCard
                            key={feature.tool}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            onClick={() => onSelectTool(feature.tool)}
                            delay={feature.delay}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
