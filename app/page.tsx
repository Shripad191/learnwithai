"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { ClassLevel, Board, SummaryStructure, JsMindData, GenerationStatus, GenerationError, Quiz, LessonPlan, SELSTEMActivity, ActivityType, LecturePresentation, Lecture } from '@/types';
import type { SavedMindMap } from '@/lib/storage';
import type { SavedContentListItem } from '@/types/storage-types';
import { validateChapterInput } from '@/lib/utils';
import { generateComplete } from '@/lib/gemini';
import { saveMindMap, saveQuiz, saveLessonPlan, saveSELSTEMActivity } from '@/lib/storage';
import { getContent } from '@/lib/supabase-storage';
import { generateQuiz, detectQuizLanguage, generateQuizFromChapter } from '@/lib/quiz-generator';
import { generateLessonPlan } from '@/lib/lesson-planner';
import { generateLecturePresentation } from '@/lib/ppt-generator';
import { generateSELSTEMActivity } from '@/lib/sel-stem-generator';
import { exportQuizAsWorksheet, exportQuizWithAnswers, exportQuizCombined, downloadTextFile } from '@/lib/export';
import ClassSelector from '@/components/ClassSelector';
import BoardSelector from '@/components/BoardSelector';
import SubjectSelector from '@/components/SubjectSelector';
import ActivityTypeSelector from '@/components/ActivityTypeSelector';
import ChapterInput from '@/components/ChapterInput';
import SummaryDisplay from '@/components/SummaryDisplay';
import LoadingState from '@/components/LoadingState';
import ErrorDisplay from '@/components/ErrorDisplay';
import ExportMenu from '@/components/ExportMenu';
import LandingPage from '@/components/LandingPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import MigrationPrompt from '@/components/MigrationPrompt';
import { getMigrationStatus } from '@/lib/migrate-to-supabase';

// Dynamic imports for heavy components - only load when needed
const MindMapRenderer = dynamic(() => import('@/components/MindMapRenderer'), {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-96 flex items-center justify-center"><p className="text-gray-500">Loading mind map...</p></div>,
    ssr: false
});

const QuizDisplay = dynamic(() => import('@/components/QuizDisplay'), {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-64 flex items-center justify-center"><p className="text-gray-500">Loading quiz...</p></div>
});

const LessonPlanDisplay = dynamic(() => import('@/components/LessonPlanDisplay'), {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-64 flex items-center justify-center"><p className="text-gray-500">Loading lesson plan...</p></div>
});

const SELSTEMActivityDisplay = dynamic(() => import('@/components/SELSTEMActivityDisplay'), {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-64 flex items-center justify-center"><p className="text-gray-500">Loading activity...</p></div>
});

const SaveLoadPanel = dynamic(() => import('@/components/SaveLoadPanel'), {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-64 flex items-center justify-center"><p className="text-gray-500">Loading saved items...</p></div>
});

const PresentationViewer = dynamic(() => import('@/components/PresentationViewer'), {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-64 flex items-center justify-center"><p className="text-gray-500">Loading presentation...</p></div>,
    ssr: false
});

const Editor = dynamic(() => import('@/components/Editor'), {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-64 flex items-center justify-center"><p className="text-gray-500">Loading editor...</p></div>,
    ssr: false
});

export default function Home() {
    // State management
    const [classLevel, setClassLevel] = useState<ClassLevel>(5);
    const [board, setBoard] = useState<Board | ''>('');
    const [subject, setSubject] = useState<string>('');
    const [teachingStyle, setTeachingStyle] = useState<'traditional' | 'activity' | 'nep'>('nep');
    const [lectures, setLectures] = useState<number>(1);
    const [minutesPerLecture, setMinutesPerLecture] = useState<'30' | '45' | 'custom'>('45');
    const [customMinutes, setCustomMinutes] = useState<number>(60);
    const [showChapterContent, setShowChapterContent] = useState(false);
    const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
    const [chapterName, setChapterName] = useState('');
    const [chapterText, setChapterText] = useState('');
    const [summary, setSummary] = useState<SummaryStructure | null>(null);
    const [mindMapData, setMindMapData] = useState<JsMindData | null>(null);
    const [status, setStatus] = useState<GenerationStatus>('idle');
    const [error, setError] = useState<GenerationError | null>(null);
    const [showSaveLoad, setShowSaveLoad] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
    const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
    const [selStemActivity, setSELSTEMActivity] = useState<SELSTEMActivity | null>(null);
    const [activityType, setActivityType] = useState<ActivityType>('solo');
    const [isGeneratingActivity, setIsGeneratingActivity] = useState(false);
    const [activeTool, setActiveTool] = useState<'landing' | 'summary' | 'mindmap' | 'quiz' | 'lesson' | 'sel-stem'>('landing');

    // PPT-related state
    const [presentations, setPresentations] = useState<Map<number, LecturePresentation>>(new Map());
    const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
    const [generatingPPTForLecture, setGeneratingPPTForLecture] = useState<number | null>(null);
    const [activePresentationLecture, setActivePresentationLecture] = useState<number | null>(null);

    // Migration state
    const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
    const [migrationItemCount, setMigrationItemCount] = useState(0);

    // Check for migration on mount
    useEffect(() => {
        const status = getMigrationStatus();
        if (status.hasLocalData && !status.isCompleted && status.itemCount > 0) {
            setMigrationItemCount(status.itemCount);
            setShowMigrationPrompt(true);
        }
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 's') {
                    e.preventDefault();
                    if (hasResults) handleSave();
                }
                if (e.key === 'l') {
                    e.preventDefault();
                    setShowSaveLoad(true);
                }
                if (e.key === 'n') {
                    e.preventDefault();
                    handleReset();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [summary, mindMapData, chapterText, chapterName, classLevel, subject]);

    const handleGenerate = async () => {
        // Validate input - now accepts chapterName for topic-based generation
        const validation = validateChapterInput(chapterText, chapterName);
        if (!validation.isValid) {
            setError({
                message: validation.error || 'Invalid input',
                suggestion: 'Please provide either chapter content (min 100 characters) or just a chapter name/topic.'
            });
            setStatus('error');
            return;
        }

        if (!chapterName.trim()) {
            setError({
                message: 'Chapter name is required',
                suggestion: 'Please enter a name for your chapter or topic.'
            });
            setStatus('error');
            return;
        }

        // Reset previous results
        setSummary(null);
        setMindMapData(null);
        setError(null);

        try {
            // Generate summary
            setStatus('generating-summary');
            const result = await generateComplete(chapterText, classLevel, chapterName);

            setSummary(result.summary);

            // Generate mind map
            setStatus('generating-mindmap');
            setMindMapData(result.mindMap);

            setStatus('complete');
        } catch (err) {
            console.error('Generation error:', err);
            setError({
                message: err instanceof Error ? err.message : 'An unexpected error occurred',
                code: 'GENERATION_ERROR',
                suggestion: err instanceof Error && err.message.includes('API key')
                    ? 'Please check your .env.local file and ensure NEXT_PUBLIC_GEMINI_API_KEY is set correctly.'
                    : 'Please try again. If the problem persists, try with a shorter chapter or check your internet connection.'
            });
            setStatus('error');
        }
    };

    const handleRetry = () => {
        setError(null);
        setStatus('idle');
    };

    const handleReset = () => {
        // Reset all form states
        setChapterName('');
        setChapterText('');
        setSubject('');

        // Reset all generated content
        setSummary(null);
        setMindMapData(null);
        setQuiz(null);
        setLessonPlan(null);
        setSELSTEMActivity(null);

        // Reset status and errors
        setStatus('idle');
        setError(null);
        setSaveSuccess(false);

        // Stay on current tool - do not redirect to landing page
    };

    const handleSave = async () => {
        try {
            // Determine which tool is active and save accordingly
            switch (activeTool) {
                case 'summary':
                case 'mindmap':
                    if (!summary || !mindMapData) {
                        alert('No summary or mind map to save. Please generate content first.');
                        return;
                    }
                    await saveMindMap(chapterName, classLevel, summary, mindMapData, chapterText, subject);
                    break;

                case 'quiz':
                    if (!quiz) {
                        alert('No quiz to save. Please generate a quiz first.');
                        return;
                    }
                    await saveQuiz(chapterName, classLevel, quiz, subject, board || undefined);
                    break;

                case 'lesson':
                    if (!lessonPlan) {
                        alert('No lesson plan to save. Please generate a lesson plan first.');
                        return;
                    }
                    await saveLessonPlan(lessonPlan);
                    break;

                case 'sel-stem':
                    if (!selStemActivity) {
                        alert('No activity to save. Please generate an activity first.');
                        return;
                    }
                    await saveSELSTEMActivity(selStemActivity, chapterName || selStemActivity.title, classLevel, subject);
                    break;

                default:
                    alert('Please select a tool and generate content before saving.');
                    return;
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Save error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to save';

            // Show user-friendly error message
            if (errorMessage.includes('saved_content')) {
                alert('Database not set up. Please run the database setup SQL in your Supabase dashboard. See DATABASE_SETUP.md for instructions.');
            } else if (errorMessage.includes('authenticated')) {
                alert('You must be logged in to save content. Please sign in and try again.');
            } else {
                alert(`Failed to save: ${errorMessage}`);
            }
        }
    };

    const handleLoad = async (item: SavedContentListItem) => {
        try {
            // Fetch the full content data
            const result = await getContent(item.key);

            if (!result.success || !result.data) {
                throw new Error(result.error?.message || 'Failed to load content');
            }

            // Extract the actual content from the row structure
            const row = result.data;
            const content = row.value;

            // Load based on content type
            switch (content.type) {
                case 'summary':
                    setChapterName(content.metadata.chapterName);
                    setChapterText(content.data.chapterText || '');
                    setClassLevel(content.metadata.classLevel);
                    setSubject(content.metadata.subject || '');
                    setSummary(content.data.summary);
                    setMindMapData(content.data.mindMapData);
                    setStatus('complete');
                    setActiveTool('summary');
                    break;

                case 'quiz':
                    setChapterName(content.metadata.chapterName);
                    setClassLevel(content.metadata.classLevel);
                    setSubject(content.metadata.subject || '');
                    setBoard(content.metadata.board || '');
                    setQuiz(content.data.quiz);
                    setActiveTool('quiz');
                    break;

                case 'lesson':
                    const lesson = content.data.lessonPlan;
                    setChapterName(lesson.topic);
                    setClassLevel(lesson.classLevel);
                    setSubject(lesson.subject);
                    setBoard(lesson.board);
                    setLessonPlan(lesson);
                    setActiveTool('lesson');
                    break;

                case 'activity':
                    const activity = content.data.activity;
                    setChapterName(content.metadata.chapterName);
                    setClassLevel(activity.classLevel);
                    setSubject(activity.subject);
                    setSELSTEMActivity(activity);
                    setActiveTool('sel-stem');
                    break;

                default:
                    throw new Error(`Unknown content type: ${(content as any).type}`);
            }

            setShowSaveLoad(false);
        } catch (error) {
            console.error('Load error:', error);
            alert(error instanceof Error ? error.message : 'Failed to load content');
        }
    };

    const handleGenerateQuiz = async () => {
        if (!chapterName.trim()) {
            setError({
                message: 'Chapter name is required',
                code: 'MISSING_CHAPTER_NAME',
                suggestion: 'Please enter a chapter name to generate quiz.'
            });
            return;
        }

        setIsGeneratingQuiz(true);
        setError(null);

        try {
            const generatedQuiz = await generateQuizFromChapter(
                chapterName,
                chapterText,
                classLevel,
                subject,
                board
            );
            setQuiz(generatedQuiz);
        } catch (err) {
            console.error('Quiz generation error:', err);
            setError({
                message: err instanceof Error ? err.message : 'Failed to generate quiz',
                code: 'QUIZ_GENERATION_ERROR',
                suggestion: 'Please try again. If the problem persists, check your API key.'
            });
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    const handleExportQuiz = (format: 'worksheet' | 'answers' | 'combined') => {
        if (!quiz) return;

        let content: string;
        let filename: string;

        switch (format) {
            case 'worksheet':
                content = exportQuizAsWorksheet(quiz);
                filename = `${quiz.chapterName} _Quiz_Worksheet.txt`;
                break;
            case 'answers':
                content = exportQuizWithAnswers(quiz);
                filename = `${quiz.chapterName} _Quiz_Answers.txt`;
                break;
            case 'combined':
                content = exportQuizCombined(quiz);
                filename = `${quiz.chapterName} _Quiz_Complete.txt`;
                break;
        }

        downloadTextFile(content, filename);
    };

    const handleGenerateLesson = async (totalMinutes: number, desiredLectures: number, teachingStyle: 'traditional' | 'activity' | 'nep', customization: string = '') => {
        console.log('🔍 handleGenerateLesson called:', { totalMinutes, desiredLectures, teachingStyle, customization, board, subject, topic: chapterName });

        if (!board) {
            setError({
                message: 'Please select a board',
                suggestion: 'Select your education board (CBSE, ICSE, etc.) to continue.'
            });
            return;
        }

        if (!subject) {
            setError({
                message: 'Please enter a subject',
                suggestion: 'Enter the subject name (e.g., Mathematics, Science, etc.).'
            });
            return;
        }

        if (!chapterName.trim()) {
            setError({
                message: 'Please enter a topic',
                suggestion: 'Enter the topic or chapter name you want to create a lesson plan for.'
            });
            return;
        }

        console.log('✅ All inputs valid, starting generation...');
        setIsGeneratingLesson(true);
        setError(null);

        try {
            console.log('📡 Calling generateLessonPlan API...');
            const generatedPlan = await generateLessonPlan(
                board,
                classLevel,
                subject,
                chapterName,
                totalMinutes,
                desiredLectures,
                teachingStyle,
                customization,
                'English'
            );
            console.log('✅ Lesson plan generated successfully:', generatedPlan);
            setLessonPlan(generatedPlan);
        } catch (err) {
            console.error('❌ Error generating lesson plan:', err);
            setError({
                message: 'Failed to generate lesson plan',
                suggestion: 'Please try again. If the problem persists, check your API key configuration.'
            });
        } finally {
            setIsGeneratingLesson(false);
        }
    };

    // SEL/STEM Activity Generation Handler
    const handleGenerateSELSTEMActivity = async () => {
        console.log('🎯 handleGenerateSELSTEMActivity called:', { classLevel, subject, activityType, topic: chapterName });

        if (!subject) {
            setError({
                message: 'Please select a subject',
                suggestion: 'Select a subject to generate a relevant SEL/STEM activity.'
            });
            return;
        }

        console.log('✅ All inputs valid, starting activity generation...');
        setIsGeneratingActivity(true);
        setError(null);

        try {
            console.log('📡 Calling generateSELSTEMActivity API...');
            const activity = await generateSELSTEMActivity(classLevel, subject, activityType, chapterName.trim() || undefined);
            console.log('✅ Activity generated successfully:', activity.title);
            setSELSTEMActivity(activity);
        } catch (err) {
            console.error('❌ Error generating SEL/STEM activity:', err);
            setError({
                message: 'Failed to generate SEL/STEM activity',
                suggestion: 'Please try again. If the problem persists, check your API key configuration.'
            });
        } finally {
            console.log('🏁 Generation complete, setting loading to false');
            setIsGeneratingActivity(false);
        }
    };

    // PPT Generation Handler
    const handleGeneratePPT = async (lectureNumber: number, lecture: Lecture) => {
        console.log('🎨 handleGeneratePPT called:', { lectureNumber, lectureTitle: lecture.title });

        setIsGeneratingPPT(true);
        setGeneratingPPTForLecture(lectureNumber);
        setError(null);

        try {
            console.log('📡 Calling generateLecturePresentation API...');
            const presentation = await generateLecturePresentation(
                lectureNumber,
                lecture.title,
                chapterName,
                classLevel,
                subject,
                lecture.teachPackCards.start,
                lecture.teachPackCards.explain
            );
            console.log('✅ Presentation generated successfully:', presentation.totalSlides, 'slides');

            // Store presentation in map
            setPresentations(prev => {
                const newMap = new Map(prev);
                newMap.set(lectureNumber, presentation);
                return newMap;
            });

            // Open the presentation viewer
            setActivePresentationLecture(lectureNumber);
        } catch (err) {
            console.error('❌ Error generating presentation:', err);
            setError({
                message: 'Failed to generate presentation',
                suggestion: 'Please try again. If the problem persists, check your API key configuration.'
            });
        } finally {
            setIsGeneratingPPT(false);
            setGeneratingPPTForLecture(null);
        }
    };

    // Update presentation with generated images
    const handleUpdatePresentation = (updatedPresentation: LecturePresentation) => {
        setPresentations(prev => {
            const newMap = new Map(prev);
            newMap.set(updatedPresentation.lectureNumber, updatedPresentation);
            return newMap;
        });
    };

    // Close presentation viewer
    const handleClosePresentationViewer = () => {
        setActivePresentationLecture(null);
    };



    const isGenerating = status === 'generating-summary' || status === 'generating-mindmap';
    const hasResults = (status === 'complete' && summary && mindMapData) || (activeTool === 'quiz' && quiz) || (activeTool === 'lesson' && lessonPlan) || (activeTool === 'sel-stem' && selStemActivity);

    // Show migration prompt if needed
    if (showMigrationPrompt) {
        return (
            <MigrationPrompt
                itemCount={migrationItemCount}
                onComplete={() => setShowMigrationPrompt(false)}
                onSkip={() => setShowMigrationPrompt(false)}
            />
        );
    }



    // Show landing page if no tool is selected
    if (activeTool === 'landing') {
        return (
            <ProtectedRoute>
                <LandingPage onSelectTool={setActiveTool} />
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white shadow-md border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex-shrink min-w-0">
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                    LearnWithAI
                                </h1>
                                <p className="text-xs text-gray-600 hidden sm:block">
                                    AI-powered Summaries,  Mind maps and Quizzes for Class 1-8 teachers
                                </p>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                                {/* Back to Home Button */}
                                <button
                                    onClick={() => setActiveTool('landing')}
                                    className="px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2"
                                    title="Home"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    <span className="hidden sm:inline">Home</span>
                                </button>
                                {!hasResults && (
                                    <>
                                        <button
                                            onClick={() => setShowSaveLoad(true)}
                                            className="px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2"
                                            title="Load Saved"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="hidden sm:inline">Load Saved</span>
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 new-btn-hover"
                                            title="Start New"
                                        >
                                            <svg className="w-5 h-5 new-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span className="hidden sm:inline">Start New</span>
                                        </button>
                                    </>
                                )}

                                {hasResults && (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            className={`px-2 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 save-btn-hover ${saveSuccess ? 'success-pulse' : ''}`}
                                            title="Save"
                                        >
                                            <svg className="w-5 h-5 save-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            <span className="hidden sm:inline">{saveSuccess ? '✓ Saved!' : 'Save'}</span>
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="px-2 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 new-btn-hover"
                                            title="Start New"
                                        >
                                            <svg className="w-5 h-5 new-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span className="hidden sm:inline">Start New</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    {(!hasResults && activeTool !== 'lesson' && activeTool !== 'sel-stem') || (activeTool === 'quiz' && !hasResults) ? (
                        <div className="space-y-4">
                            {/* Compact Form */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                {/* Header */}
                                <h2 className="text-xl font-bold mb-4 text-gray-900">
                                    {activeTool === 'summary' && '📝 Summary Generator'}
                                    {activeTool === 'mindmap' && '🧠 Mind Map Generator'}
                                    {activeTool === 'quiz' && '📝 Quiz Generator'}
                                </h2>

                                {/* Form Fields */}
                                <div className="space-y-2">
                                    {/* Select Class */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="text-base">🎓</span>
                                            Select Class
                                        </label>
                                        <ClassSelector
                                            selectedClass={classLevel}
                                            onClassChange={setClassLevel}
                                            disabled={isGenerating}
                                        />
                                    </div>

                                    {/* Select Subject */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="text-base">📚</span>
                                            Select Subject
                                        </label>
                                        <SubjectSelector
                                            selectedSubject={subject}
                                            onSubjectChange={setSubject}
                                            disabled={isGenerating}
                                        />
                                    </div>

                                    {/* Chapter/Topic Name */}
                                    <div>
                                        <label htmlFor="summary-chapter-name" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="text-base">📖</span>
                                            Chapter/Topic Name
                                        </label>
                                        <input
                                            type="text"
                                            id="summary-chapter-name"
                                            value={chapterName}
                                            onChange={(e) => setChapterName(e.target.value)}
                                            disabled={isGenerating}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-400 disabled:opacity-50"
                                            placeholder="e.g., Introduction to Trigonometry"
                                        />
                                    </div>

                                    {/* Chapter Content */}
                                    <div>
                                        <label htmlFor="summary-chapter-content" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                            <span className="text-base">📄</span>
                                            Chapter Content
                                        </label>
                                        <textarea
                                            id="summary-chapter-content"
                                            value={chapterText}
                                            onChange={(e) => setChapterText(e.target.value)}
                                            disabled={isGenerating}
                                            rows={6}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-400 resize-none disabled:opacity-50"
                                            placeholder="Paste your chapter content here..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Add the chapter text you want to {activeTool === 'summary' ? 'summarize' : activeTool === 'mindmap' ? 'visualize' : 'create quiz from'}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="flex items-center justify-center mt-4">
                                    <button
                                        onClick={activeTool === 'quiz' ? handleGenerateQuiz : handleGenerate}
                                        disabled={(activeTool === 'quiz' ? isGeneratingQuiz : isGenerating) || !chapterName.trim()}
                                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {(activeTool === 'quiz' ? isGeneratingQuiz : isGenerating) ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-base">
                                                    {activeTool === 'summary' && '📝'}
                                                    {activeTool === 'mindmap' && '🧠'}
                                                    {activeTool === 'quiz' && '📝'}
                                                </span>
                                                {activeTool === 'summary' && 'Generate Summary'}
                                                {activeTool === 'mindmap' && 'Generate Mind Map'}
                                                {activeTool === 'quiz' && 'Generate Quiz'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Loading State */}
                            {isGenerating && activeTool !== 'quiz' && (
                                <LoadingState stage={status === 'generating-summary' ? 'summary' : 'mindmap'} />
                            )}

                            {/* Quiz Loading State */}
                            {activeTool === 'quiz' && isGeneratingQuiz && (
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                                    <p className="text-gray-600 font-medium">Generating quiz questions...</p>
                                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                                </div>
                            )}

                            {/* Error Display */}
                            {status === 'error' && error && (
                                <ErrorDisplay error={error} onRetry={handleRetry} />
                            )}
                        </div>
                    ) : (
                        /* Results Section */
                        <div className="space-y-8">

                            {/* Summary - Show only if activeTool is 'summary' */}
                            {activeTool === 'summary' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-3xl">📝</span>
                                        Generated Summary
                                    </h2>
                                    <SummaryDisplay summary={summary!} />
                                </div>
                            )}

                            {/* Mind Map - Show only if activeTool is 'mindmap' */}
                            {activeTool === 'mindmap' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-3xl">🧠</span>
                                        Interactive Mind Map
                                    </h2>
                                    <MindMapRenderer data={mindMapData!} />
                                </div>
                            )}

                            {/* Quiz - Show only if activeTool is 'quiz' */}
                            {activeTool === 'quiz' && quiz && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-3xl">📝</span>
                                        Quiz Questions
                                    </h2>
                                    <QuizDisplay quiz={quiz} />

                                    {/* Export Quiz Buttons */}
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        <button
                                            onClick={() => handleExportQuiz('worksheet')}
                                            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Student Worksheet
                                        </button>
                                        <button
                                            onClick={() => handleExportQuiz('answers')}
                                            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Answer Key
                                        </button>
                                        <button
                                            onClick={() => handleExportQuiz('combined')}
                                            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Complete (Both)
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Lesson Planner Section - Show only if activeTool is 'lesson' */}
                            {activeTool === 'lesson' && (
                                <div>
                                    {!lessonPlan && !isGeneratingLesson && (
                                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                            {/* Header */}
                                            <h2 className="text-xl font-bold mb-4 text-gray-900">Create Your Teach Pack</h2>

                                            {/* Three Dropdowns in a Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                                {/* Select Board */}
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                                        <span className="text-base">📋</span>
                                                        Select Board
                                                    </label>
                                                    <BoardSelector
                                                        value={board}
                                                        onChange={setBoard}
                                                    />
                                                </div>

                                                {/* Select Class */}
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                                        <span className="text-base">🎓</span>
                                                        Select Class
                                                    </label>
                                                    <ClassSelector
                                                        selectedClass={classLevel}
                                                        onClassChange={setClassLevel}
                                                        disabled={false}
                                                    />
                                                </div>

                                                {/* Select Subject */}
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                                        <span className="text-base">📚</span>
                                                        Select Subject
                                                    </label>
                                                    <SubjectSelector
                                                        selectedSubject={subject}
                                                        onSubjectChange={setSubject}
                                                        disabled={false}
                                                    />
                                                </div>
                                            </div>

                                            {/* Chapter/Topic Name */}
                                            <div className="mb-2">
                                                <label htmlFor="lesson-chapter-name" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                                    <span className="text-base">📖</span>
                                                    Chapter/Topic Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="lesson-chapter-name"
                                                    value={chapterName}
                                                    onChange={(e) => setChapterName(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-400"
                                                    placeholder="e.g., Photosynthesis, The Solar System, etc."
                                                />
                                            </div>

                                            {/* Chapter Content (Optional) - Collapsible */}
                                            <div className="mb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowChapterContent(!showChapterContent)}
                                                    className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                                                >
                                                    <span className="text-base font-normal">{showChapterContent ? '−' : '+'}</span>
                                                    Chapter Content (Optional)
                                                </button>
                                                {showChapterContent && (
                                                    <textarea
                                                        id="optional-content"
                                                        value={chapterText}
                                                        onChange={(e) => setChapterText(e.target.value)}
                                                        rows={3}
                                                        className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
                                                        placeholder="Add key terms, specific examples, or learning objectives..."
                                                    />
                                                )}
                                            </div>

                                            {/* Teaching Time */}
                                            <div className="mb-2">
                                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                                    <span className="text-base">⏱️</span>
                                                    Teaching Time
                                                </label>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {/* Number of Lectures */}
                                                    <div>
                                                        <label htmlFor="lectures" className="block text-xs text-gray-600 mb-1">
                                                            Number of Lectures
                                                        </label>
                                                        <select
                                                            id="lectures"
                                                            value={lectures}
                                                            onChange={(e) => setLectures(parseInt(e.target.value))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900"
                                                        >
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                                <option key={num} value={num}>{num}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Minutes per Lecture */}
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">
                                                            Minutes per Lecture
                                                        </label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setMinutesPerLecture('30');
                                                                    setCustomMinutes(30);
                                                                }}
                                                                className={`px-3 py-2 rounded-lg border font-medium transition-colors ${minutesPerLecture === '30' || (minutesPerLecture === 'custom' && customMinutes === 30)
                                                                    ? 'bg-gray-200 text-gray-900 border-gray-400'
                                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                30
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setMinutesPerLecture('45');
                                                                    setCustomMinutes(45);
                                                                }}
                                                                className={`px-3 py-2 rounded-lg border font-medium transition-colors ${minutesPerLecture === '45' || (minutesPerLecture === 'custom' && customMinutes === 45)
                                                                    ? 'bg-gray-200 text-gray-900 border-gray-400'
                                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                45
                                                            </button>
                                                            <input
                                                                type="text"
                                                                id="minutes-input"
                                                                value={minutesPerLecture === 'custom' && customMinutes !== 30 && customMinutes !== 45 ? customMinutes : ''}
                                                                onChange={(e) => {
                                                                    const value = parseInt(e.target.value) || 0;
                                                                    setMinutesPerLecture('custom');
                                                                    setCustomMinutes(value);
                                                                }}
                                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-black-700 text-center"
                                                                placeholder="Custom"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Teaching Style */}
                                            <div className="mb-2">
                                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                                    <span className="text-base">🎨</span>
                                                    Teaching Style
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setTeachingStyle('traditional')}
                                                        className={`p-2.5 rounded-lg border text-center transition-all ${teachingStyle === 'traditional'
                                                            ? 'border-gray-300 bg-gray-200'
                                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span className="text-lg mb-0.5">📖</span>
                                                            <span className="font-semibold text-gray-900 text-sm">Traditional</span>
                                                            <p className="text-xs text-gray-600">Content-focused teaching</p>
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setTeachingStyle('activity')}
                                                        className={`p-2.5 rounded-lg border text-center transition-all ${teachingStyle === 'activity'
                                                            ? 'border-gray-300 bg-gray-200'
                                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span className="text-lg mb-0.5">🎯</span>
                                                            <span className="font-semibold text-gray-900 text-sm">Activity Based</span>
                                                            <p className="text-xs text-gray-600">Hands-on learning focus</p>
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setTeachingStyle('nep')}
                                                        className={`p-2.5 rounded-lg border text-center transition-all ${teachingStyle === 'nep'
                                                            ? 'border-gray-300 bg-gray-200'
                                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span className="text-lg mb-0.5">⚖️</span>
                                                            <span className="font-semibold text-gray-900 text-sm">NEP/NCF</span>
                                                            <p className="text-xs text-gray-600">Balanced approach (Default)</p>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Additional Instructions (Optional) - Collapsible */}
                                            <div className="mb-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                                                    className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700"
                                                >
                                                    <span className="text-base font-normal">{showAdditionalInfo ? '−' : '+'}</span>
                                                    Additional Instructions (Optional)
                                                </button>
                                                {showAdditionalInfo && (
                                                    <textarea
                                                        id="teacher-instructions"
                                                        rows={2}
                                                        className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-400 resize-none"
                                                        placeholder="E.g., Focus on practical examples, Include group activities..."
                                                    />
                                                )}
                                            </div>

                                            {/* Generate Button */}
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => {
                                                        // Calculate total minutes based on selection
                                                        let minutesValue = 45; // default
                                                        if (minutesPerLecture === '30') {
                                                            minutesValue = 30;
                                                        } else if (minutesPerLecture === '45') {
                                                            minutesValue = 45;
                                                        } else if (minutesPerLecture === 'custom') {
                                                            minutesValue = customMinutes || 60;
                                                        }

                                                        const totalMinutes = lectures * minutesValue;

                                                        // Validate totalMinutes
                                                        if (!totalMinutes || totalMinutes <= 0) {
                                                            setError({
                                                                message: 'Invalid time duration',
                                                                suggestion: 'Please select a valid number of lectures and minutes per lecture.'
                                                            });
                                                            return;
                                                        }

                                                        console.log('🚀 Generate button clicked:', { lectures, minutesPerLecture, minutesValue, totalMinutes, teachingStyle });

                                                        // Get teacher instructions
                                                        const teacherInstructions = (document.getElementById('teacher-instructions') as HTMLTextAreaElement)?.value || '';
                                                        handleGenerateLesson(totalMinutes, lectures, teachingStyle, teacherInstructions);
                                                    }}
                                                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                                >
                                                    <span className="text-base">📅</span>
                                                    Generate Lesson Plan
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {isGeneratingLesson && (
                                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                                            <p className="text-gray-600 font-medium">Creating your lesson plan...</p>
                                            <p className="text-sm text-gray-500 mt-2">Analyzing topics and allocating time</p>
                                        </div>
                                    )}

                                    {lessonPlan && !isGeneratingLesson && (
                                        <LessonPlanDisplay
                                            lessonPlan={lessonPlan}
                                            onGeneratePPT={handleGeneratePPT}
                                            isGeneratingPPT={isGeneratingPPT}
                                            generatingPPTForLecture={generatingPPTForLecture}
                                        />
                                    )}
                                </div>
                            )}

                            {/* SEL/STEM Activity Generator Section */}
                            {activeTool === 'sel-stem' && (
                                <div>
                                    {!selStemActivity && !isGeneratingActivity && (
                                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                                            {/* Header */}
                                            <h2 className="text-xl font-bold mb-4 text-gray-900">
                                                🎯 SEL/STEM Activity Generator
                                            </h2>

                                            {/* Form Fields */}
                                            <div className="space-y-2">
                                                {/* Select Class */}
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                                        <span className="text-base">🎓</span>
                                                        Select Class
                                                    </label>
                                                    <ClassSelector
                                                        selectedClass={classLevel}
                                                        onClassChange={setClassLevel}
                                                        disabled={false}
                                                    />
                                                </div>

                                                {/* Select Subject */}
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                                        <span className="text-base">📚</span>
                                                        Select Subject
                                                    </label>
                                                    <SubjectSelector
                                                        selectedSubject={subject}
                                                        onSubjectChange={setSubject}
                                                        disabled={false}
                                                    />
                                                </div>

                                                {/* Chapter/Topic Name */}
                                                <div>
                                                    <label htmlFor="sel-stem-chapter-name" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                                        <span className="text-base">📖</span>
                                                        Chapter/Topic Name (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="sel-stem-chapter-name"
                                                        value={chapterName}
                                                        onChange={(e) => setChapterName(e.target.value)}
                                                        placeholder="e.g., Photosynthesis, Fractions, Solar System"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-400"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Specify a topic to generate activities related to that chapter
                                                    </p>
                                                </div>

                                                {/* Activity Type Selector */}
                                                <div>
                                                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                                                        <span className="text-base">👥</span>
                                                        Activity Type
                                                    </label>
                                                    <ActivityTypeSelector
                                                        value={activityType}
                                                        onChange={setActivityType}
                                                    />
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex items-center justify-center mt-4">
                                                <button
                                                    onClick={handleGenerateSELSTEMActivity}
                                                    disabled={!subject}
                                                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="text-base">🎯</span>
                                                    Generate {activityType === 'solo' ? 'Solo' : 'Group'} Activity
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {isGeneratingActivity && (
                                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                                            <p className="text-gray-600 font-medium">Creating your SEL/STEM activity...</p>
                                            <p className="text-sm text-gray-500 mt-2">Designing engaging {activityType} learning experience</p>
                                        </div>
                                    )}

                                    {selStemActivity && !isGeneratingActivity && (
                                        <SELSTEMActivityDisplay
                                            activity={selStemActivity}
                                        />
                                    )}
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Save/Load Panel */}
                {showSaveLoad && (
                    <SaveLoadPanel
                        onLoad={handleLoad}
                        onClose={() => setShowSaveLoad(false)}
                    />
                )}

                {/* Presentation Viewer */}
                {activePresentationLecture !== null && presentations.get(activePresentationLecture) && (
                    <PresentationViewer
                        presentation={presentations.get(activePresentationLecture)!}
                        onClose={handleClosePresentationViewer}
                        onUpdatePresentation={handleUpdatePresentation}
                    />
                )}
            </main>
        </ProtectedRoute >
    );
}
