"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { ClassLevel, Board, SummaryStructure, JsMindData, GenerationStatus, GenerationError, Quiz, LessonPlan, SELSTEMActivity, ActivityType, LecturePresentation, Lecture } from '@/types';
import type { SavedMindMap } from '@/lib/storage';
import { validateChapterInput } from '@/lib/utils';
import { generateComplete } from '@/lib/gemini';
import { saveMindMap } from '@/lib/storage';
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

        // Navigate back to landing page
        setActiveTool('landing');
    };

    const handleSave = () => {
        if (!summary || !mindMapData) return;

        try {
            saveMindMap(chapterName, classLevel, summary, mindMapData, chapterText, subject);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to save');
        }
    };

    const handleLoad = (item: SavedMindMap) => {
        setChapterName(item.chapterName);
        setChapterText(item.chapterText);
        setClassLevel(item.classLevel);
        setSubject(item.subject || '');
        setSummary(item.summary);
        setMindMapData(item.mindMapData);
        setStatus('complete');
        setShowSaveLoad(false);
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



    // Show landing page if no tool is selected
    if (activeTool === 'landing') {
        return <LandingPage onSelectTool={setActiveTool} />;
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Header */}
            <header className="bg-white shadow-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                SeekhoWithAI
                            </h1>
                            <p className="text-xs text-gray-600">
                                AI-powered Summaries,  Mind maps and Quizzes for Class 1-8 teachers
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Back to Home Button */}
                            <button
                                onClick={() => setActiveTool('landing')}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                Home
                            </button>
                            {!hasResults && (
                                <>
                                    <button
                                        onClick={() => setShowSaveLoad(true)}
                                        className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                        </svg>
                                        Load Saved
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2 new-btn-hover"
                                    >
                                        <svg className="w-5 h-5 new-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Start New
                                    </button>
                                </>
                            )}

                            {hasResults && (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className={`px - 4 py - 2 bg - green - 500 hover: bg - green - 600 text - white rounded - lg font - medium transition - colors flex items - center gap - 2 save - btn - hover ${saveSuccess ? 'success-pulse' : ''} `}
                                    >
                                        <svg className="w-5 h-5 save-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        {saveSuccess ? '✓ Saved!' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2 new-btn-hover"
                                    >
                                        <svg className="w-5 h-5 new-btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Start New
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
                    <div className="space-y-6">
                        {/* Tool Gradient Header */}
                        <div className={`relative mb-6 p-6 rounded-2xl shadow-xl text-white overflow-hidden ${activeTool === 'summary' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                            activeTool === 'mindmap' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                activeTool === 'quiz' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''
                            }`}>
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                                {activeTool === 'summary' && (
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 35px, white 35px, white 36px)',
                                    }}></div>
                                )}
                                {activeTool === 'mindmap' && (
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                        backgroundSize: '30px 30px'
                                    }}></div>
                                )}
                                {activeTool === 'quiz' && (
                                    <div className="absolute inset-0" style={{
                                        backgroundImage: 'linear-gradient(90deg, transparent 24px, white 24px, white 26px, transparent 26px), linear-gradient(transparent 24px, white 24px, white 26px, transparent 26px)',
                                        backgroundSize: '30px 30px'
                                    }}></div>
                                )}
                            </div>

                            <div className="relative flex items-center gap-4">
                                <span className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
                                    {activeTool === 'summary' && '📝'}
                                    {activeTool === 'mindmap' && '🧠'}
                                    {activeTool === 'quiz' && '📋'}
                                </span>
                                <div>
                                    <h2 className="text-3xl font-bold mb-1">
                                        {activeTool === 'summary' && 'Summary Generator'}
                                        {activeTool === 'mindmap' && 'Mind Map Generator'}
                                        {activeTool === 'quiz' && 'Quiz Generator'}
                                    </h2>
                                    <p className="text-sm opacity-90">
                                        {activeTool === 'summary' && 'Transform your chapter content into clear, concise summaries'}
                                        {activeTool === 'mindmap' && 'Visualize concepts and connections with interactive mind maps'}
                                        {activeTool === 'quiz' && 'Create engaging quizzes to assess student understanding'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Class & Subject Selection - Side by Side */}
                        <div className={`bg-white rounded-xl shadow-lg p-6 border-2 animate-fade-in transition-all hover:shadow-xl ${activeTool === 'summary' ? 'border-blue-200 hover:border-blue-300' :
                            activeTool === 'mindmap' ? 'border-purple-200 hover:border-purple-300' :
                                activeTool === 'quiz' ? 'border-green-200 hover:border-green-300' : 'border-gray-200'
                            }`}>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        🎓 Select Class
                                    </label>
                                    <ClassSelector
                                        selectedClass={classLevel}
                                        onClassChange={setClassLevel}
                                        disabled={isGenerating}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        📚 Select Subject
                                    </label>
                                    <SubjectSelector
                                        selectedSubject={subject}
                                        onSubjectChange={setSubject}
                                        disabled={isGenerating}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Chapter Input */}
                        <div className={`bg-white rounded-xl shadow-lg p-6 border-2 animate-fade-in transition-all hover:shadow-xl ${activeTool === 'summary' ? 'border-blue-200 hover:border-blue-300' :
                            activeTool === 'mindmap' ? 'border-purple-200 hover:border-purple-300' :
                                activeTool === 'quiz' ? 'border-green-200 hover:border-green-300' : 'border-gray-200'
                            }`} style={{ animationDelay: '0.1s' }}>
                            <ChapterInput
                                value={chapterText}
                                onChange={setChapterText}
                                chapterName={chapterName}
                                onChapterNameChange={setChapterName}
                                disabled={isGenerating}
                            />
                        </div>

                        {/* Generate Button */}
                        <div className="flex justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <button
                                onClick={activeTool === 'quiz' ? handleGenerateQuiz : handleGenerate}
                                disabled={(activeTool === 'quiz' ? isGeneratingQuiz : isGenerating) || !chapterName.trim()}
                                className={`px-8 py-4 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 ${activeTool === 'summary' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' :
                                    activeTool === 'mindmap' ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
                                        activeTool === 'quiz' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' :
                                            'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600'
                                    }`}
                            >
                                {(activeTool === 'quiz' ? isGeneratingQuiz : isGenerating) ? (
                                    <span className="flex items-center gap-3">
                                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {activeTool === 'summary' && '📝'}
                                            {activeTool === 'mindmap' && '🧠'}
                                            {activeTool === 'quiz' && '📋'}
                                        </span>
                                        {activeTool === 'summary' && 'Generate Summary'}
                                        {activeTool === 'mindmap' && 'Generate Mind Map'}
                                        {activeTool === 'quiz' && 'Generate Quiz'}

                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Loading State */}
                        {isGenerating && activeTool !== 'quiz' && (
                            <LoadingState stage={status === 'generating-summary' ? 'summary' : 'mindmap'} />
                        )}

                        {/* Quiz Loading State */}
                        {activeTool === 'quiz' && isGeneratingQuiz && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500 mx-auto mb-4"></div>
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
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Student Worksheet
                                    </button>
                                    <button
                                        onClick={() => handleExportQuiz('answers')}
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Answer Key
                                    </button>
                                    <button
                                        onClick={() => handleExportQuiz('combined')}
                                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
                                {/* Gradient Header */}
                                <div className="relative mb-6 p-6 rounded-2xl shadow-xl text-white overflow-hidden bg-gradient-to-r from-orange-500 to-red-500">
                                    {/* Background Pattern - Calendar Grid */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                                            backgroundSize: '40px 40px'
                                        }}></div>
                                    </div>

                                    <div className="relative flex items-center gap-4">
                                        <span className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>📅</span>
                                        <div>
                                            <h2 className="text-3xl font-bold mb-1">Lesson Planner</h2>
                                            <p className="text-sm opacity-90">Create structured, time-optimized lesson plans for your classes</p>
                                        </div>
                                    </div>
                                </div>

                                {!lessonPlan && !isGeneratingLesson && (
                                    <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 hover:border-orange-300 p-6 transition-all hover:shadow-xl">
                                        <h3 className="font-semibold text-gray-800 mb-4">Create Your Teach Pack</h3>
                                        <div className="space-y-4">
                                            {/* Board, Class, Subject - Side by Side */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Board Selector */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        📋 Select Board
                                                    </label>
                                                    <BoardSelector
                                                        value={board}
                                                        onChange={setBoard}
                                                    />
                                                </div>

                                                {/* Class Selector */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        🎓 Select Class
                                                    </label>
                                                    <ClassSelector
                                                        selectedClass={classLevel}
                                                        onClassChange={setClassLevel}
                                                        disabled={false}
                                                    />
                                                </div>

                                                {/* Subject Selector */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        📚 Select Subject
                                                    </label>
                                                    <SubjectSelector
                                                        selectedSubject={subject}
                                                        onSubjectChange={setSubject}
                                                        disabled={false}
                                                    />
                                                </div>
                                            </div>

                                            {/* Chapter/Topic Name */}
                                            <div>
                                                <label htmlFor="lesson-chapter-name" className="block text-sm font-medium text-gray-700 mb-2">
                                                    📚 Chapter/Topic Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="lesson-chapter-name"
                                                    value={chapterName}
                                                    onChange={(e) => setChapterName(e.target.value)}
                                                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                                    placeholder="e.g., Photosynthesis, The Solar System, etc."
                                                />
                                            </div>

                                            {/* Chapter Content (Collapsible) */}
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowChapterContent(!showChapterContent)}
                                                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                                                >
                                                    <span className={`transform transition - transform ${showChapterContent ? 'rotate-45' : ''} `}>
                                                        ➕
                                                    </span>
                                                    Chapter Content (Optional)
                                                </button>
                                                {showChapterContent && (
                                                    <div className="mt-2 animate-fade-in">
                                                        <textarea
                                                            id="lesson-chapter-content"
                                                            value={chapterText}
                                                            onChange={(e) => setChapterText(e.target.value)}
                                                            rows={4}
                                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none"
                                                            placeholder="Paste your chapter content here... (Optional - AI will generate based on topic name if left empty)"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            💡 Tip: You can paste chapter text for more detailed plans, or leave empty
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Teaching Time - Lectures & Minutes per Lecture */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ⏱️ Teaching Time
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Number of Lectures */}
                                                    <div>
                                                        <label htmlFor="lectures" className="block text-xs text-gray-600 mb-1">
                                                            Number of Lectures
                                                        </label>
                                                        <select
                                                            id="lectures"
                                                            value={lectures}
                                                            onChange={(e) => setLectures(parseInt(e.target.value))}
                                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                                        >
                                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                                <option key={num} value={num}>{num}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Minutes per Lecture */}
                                                    <div>
                                                        <label htmlFor="minutes-per-lecture" className="block text-xs text-gray-600 mb-1">
                                                            Minutes per Lecture
                                                        </label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setMinutesPerLecture('30');
                                                                    setCustomMinutes(30);
                                                                }}
                                                                className={`px - 3 py - 2 rounded - lg border - 2 transition - all ${minutesPerLecture === '30'
                                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                                                                    : 'border-gray-300 hover:border-orange-300'
                                                                    } `}
                                                            >
                                                                30
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setMinutesPerLecture('45');
                                                                    setCustomMinutes(45);
                                                                }}
                                                                className={`px - 3 py - 2 rounded - lg border - 2 transition - all ${minutesPerLecture === '45'
                                                                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                                                                    : 'border-gray-300 hover:border-orange-300'
                                                                    } `}
                                                            >
                                                                45
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="180"
                                                                value={minutesPerLecture === 'custom' ? customMinutes : ''}
                                                                onChange={(e) => {
                                                                    setMinutesPerLecture('custom');
                                                                    setCustomMinutes(parseInt(e.target.value) || 0);
                                                                }}
                                                                onFocus={() => setMinutesPerLecture('custom')}
                                                                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                                                                placeholder="Custom"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Teaching Style */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    🎯 Teaching Style
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setTeachingStyle('traditional')}
                                                        className={`p - 4 rounded - lg border - 2 transition - all text - left ${teachingStyle === 'traditional'
                                                            ? 'border-orange-500 bg-orange-50'
                                                            : 'border-gray-300 hover:border-orange-300'
                                                            } `}
                                                    >
                                                        <div className="font-semibold text-gray-800">📖 Traditional</div>
                                                        <div className="text-xs text-gray-600 mt-1">Content-focused teaching</div>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setTeachingStyle('activity')}
                                                        className={`p - 4 rounded - lg border - 2 transition - all text - left ${teachingStyle === 'activity'
                                                            ? 'border-orange-500 bg-orange-50'
                                                            : 'border-gray-300 hover:border-orange-300'
                                                            } `}
                                                    >
                                                        <div className="font-semibold text-gray-800">🎨 Activity Based</div>
                                                        <div className="text-xs text-gray-600 mt-1">Hands-on learning focus</div>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setTeachingStyle('nep')}
                                                        className={`p - 4 rounded - lg border - 2 transition - all text - left ${teachingStyle === 'nep'
                                                            ? 'border-orange-500 bg-orange-50'
                                                            : 'border-gray-300 hover:border-orange-300'
                                                            } `}
                                                    >
                                                        <div className="font-semibold text-gray-800">🌟 NEP/NCF</div>
                                                        <div className="text-xs text-gray-600 mt-1">Balanced approach (Default)</div>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Additional Information (Collapsible) */}
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                                                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                                                >
                                                    <span className={`transform transition - transform ${showAdditionalInfo ? 'rotate-45' : ''} `}>
                                                        ➕
                                                    </span>
                                                    Additional Information (Optional)
                                                </button>
                                                {showAdditionalInfo && (
                                                    <div className="mt-2 animate-fade-in">
                                                        <textarea
                                                            id="lesson-customization"
                                                            rows={3}
                                                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-none"
                                                            placeholder="E.g., Focus on practical examples, Include group activities, Emphasize visual learning, etc."
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Add any special instructions or preferences for the lesson plan
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Generate Button */}
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

                                                    const customization = (document.getElementById('lesson-customization') as HTMLTextAreaElement)?.value || '';
                                                    console.log('🚀 Generate button clicked:', { lectures, minutesPerLecture, minutesValue, totalMinutes, teachingStyle });
                                                    handleGenerateLesson(totalMinutes, lectures, teachingStyle, customization);
                                                }}
                                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                                            >
                                                <span className="text-xl">📅</span>
                                                Generate Lesson Plan
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isGeneratingLesson && (
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
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
                                {/* Gradient Header */}
                                <div className="relative mb-6 p-6 rounded-2xl shadow-xl text-white overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-500">
                                    {/* Background Pattern - Atom/Molecule */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0" style={{
                                            backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 50%, white 2px, transparent 2px), radial-gradient(circle at 50% 20%, white 2px, transparent 2px), radial-gradient(circle at 50% 80%, white 2px, transparent 2px)',
                                            backgroundSize: '100px 100px'
                                        }}></div>
                                    </div>

                                    <div className="relative flex items-center gap-4">
                                        <span className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>🎯</span>
                                        <div>
                                            <h2 className="text-3xl font-bold mb-1">SEL/STEM Activity Generator</h2>
                                            <p className="text-sm opacity-90">Design engaging activities that blend social-emotional learning with STEM concepts</p>
                                        </div>
                                    </div>
                                </div>

                                {!selStemActivity && !isGeneratingActivity && (
                                    <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-200 hover:border-indigo-300 p-6 transition-all hover:shadow-xl">
                                        <h3 className="font-semibold text-gray-800 mb-4">Create an Engaging Activity</h3>

                                        <div className="space-y-6">
                                            {/* Class and Subject Selection */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Class Selector */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        🎓 Select Class
                                                    </label>
                                                    <ClassSelector
                                                        selectedClass={classLevel}
                                                        onClassChange={setClassLevel}
                                                        disabled={false}
                                                    />
                                                </div>

                                                {/* Subject Selector */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        📚 Select Subject
                                                    </label>
                                                    <SubjectSelector
                                                        selectedSubject={subject}
                                                        onSubjectChange={setSubject}
                                                        disabled={false}
                                                    />
                                                </div>
                                            </div>

                                            {/* Chapter/Topic Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    📖 Chapter/Topic Name (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={chapterName}
                                                    onChange={(e) => setChapterName(e.target.value)}
                                                    placeholder="e.g., Photosynthesis, Fractions, Solar System, etc."
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Specify a topic to generate activities related to that chapter
                                                </p>
                                            </div>

                                            {/* Activity Type Selector */}
                                            <ActivityTypeSelector
                                                value={activityType}
                                                onChange={setActivityType}
                                            />

                                            {/* Generate Button */}
                                            <button
                                                onClick={handleGenerateSELSTEMActivity}
                                                disabled={!subject}
                                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="text-xl">🎯</span>
                                                Generate {activityType === 'solo' ? 'Solo' : 'Group'} Activity
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isGeneratingActivity && (
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
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
    );
}
