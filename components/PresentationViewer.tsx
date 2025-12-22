"use client";

import React, { useState, useEffect } from 'react';
import type { LecturePresentation, PPTSlide } from '@/types';
import ReactMarkdown from 'react-markdown';

interface PresentationViewerProps {
    presentation: LecturePresentation;
    onClose: () => void;
    onUpdatePresentation: (updatedPresentation: LecturePresentation) => void;
}

export default function PresentationViewer({ presentation, onClose, onUpdatePresentation }: PresentationViewerProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    const [imageGenerationProgress, setImageGenerationProgress] = useState(0);
    const [isSlideshow, setIsSlideshow] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const slide = presentation.slides[currentSlide];

    // Slideshow auto-advance
    useEffect(() => {
        if (!isSlideshow) return;

        const timer = setTimeout(() => {
            if (currentSlide < presentation.slides.length - 1) {
                setCurrentSlide(currentSlide + 1);
            } else {
                setIsSlideshow(false); // Stop at the end
                if (isFullscreen) {
                    exitFullscreen();
                }
            }
        }, 5000); // 5 seconds per slide

        return () => clearTimeout(timer);
    }, [isSlideshow, currentSlide, presentation.slides.length, isFullscreen]);

    // Fullscreen and ESC key handler
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                exitFullscreen();
            }
            if (isFullscreen) {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                    handleNextSlide();
                } else if (e.key === 'ArrowLeft') {
                    handlePrevSlide();
                }
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false);
                setIsSlideshow(false);
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [isFullscreen, currentSlide, presentation.slides.length]);

    const handlePrevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const handleNextSlide = () => {
        if (currentSlide < presentation.slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const enterFullscreen = async () => {
        if (containerRef.current) {
            try {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
                setIsSlideshow(true);
            } catch (err) {
                console.error('Error entering fullscreen:', err);
            }
        }
    };

    const exitFullscreen = async () => {
        if (document.fullscreenElement) {
            try {
                await document.exitFullscreen();
                setIsFullscreen(false);
                setIsSlideshow(false);
            } catch (err) {
                console.error('Error exiting fullscreen:', err);
            }
        }
    };

    const handleVisualizeAll = async () => {
        setIsGeneratingImages(true);
        setImageGenerationProgress(0);

        const updatedSlides = [...presentation.slides];

        try {
            // Generate images for all slides sequentially
            for (let i = 0; i < updatedSlides.length; i++) {
                const slide = updatedSlides[i];

                if (slide.imagePrompt && !slide.hasImage) {
                    console.log(`🎨 Generating image for slide ${i + 1}/${updatedSlides.length}`);

                    try {
                        // Create educational image prompt
                        const imagePrompt = `Educational illustration for Class ${presentation.classLevel} ${presentation.subject}: ${slide.imagePrompt}. Style: Simple, colorful, child-friendly, suitable for Indian students.`;

                        // Call the image generation API
                        const response = await fetch('/api/generate-image', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                prompt: imagePrompt,
                                slideNumber: i + 1,
                                presentationId: presentation.id
                            })
                        });

                        if (!response.ok) {
                            throw new Error('Failed to generate image');
                        }

                        const data = await response.json();

                        updatedSlides[i] = {
                            ...slide,
                            hasImage: true,
                            imageUrl: data.imageUrl
                        };

                        setImageGenerationProgress(((i + 1) / updatedSlides.length) * 100);

                        // Small delay to show progress and allow image to load
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error) {
                        console.error(`Failed to generate image for slide ${i + 1}:`, error);
                    }
                }
            }

            // Update the presentation with generated images
            const updatedPresentation: LecturePresentation = {
                ...presentation,
                slides: updatedSlides,
                imagesGenerated: true
            };

            onUpdatePresentation(updatedPresentation);
            console.log('✅ All images generated successfully');
        } catch (error) {
            console.error('❌ Error generating images:', error);
            alert('Failed to generate some images. Please try again.');
        } finally {
            setIsGeneratingImages(false);
            setImageGenerationProgress(0);
        }
    };

    return (
        <div ref={containerRef} className={`fixed inset-0 flex items-center justify-center z-50 ${isFullscreen ? 'bg-black' : 'bg-black bg-opacity-50 p-4'}`}>
            <div className={`bg-white shadow-2xl w-full flex flex-col ${isFullscreen ? 'h-full' : 'rounded-2xl max-w-5xl max-h-[90vh]'}`}>
                {/* Header - Hidden in fullscreen */}
                {!isFullscreen && (
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-t-2xl flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">{presentation.lectureTitle}</h2>
                            <p className="text-xs opacity-90 mt-0.5">
                                Class {presentation.classLevel} | {presentation.subject} | {presentation.topic}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                            aria-label="Close presentation"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Slide Content */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Background Image (if generated) */}
                    {slide.hasImage && slide.imageUrl ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${slide.imageUrl})` }}
                        >
                            {/* Dark overlay for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                        </div>
                    ) : (
                        /* Fallback gradient background if no image */
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500"></div>
                    )}

                    {/* Content Overlay */}
                    <div className="relative z-10 h-full flex flex-col p-8">
                        {/* Slide Title */}
                        <div className="mb-6">
                            <h3 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl leading-tight">
                                {slide.title}
                            </h3>
                            <div className="h-1.5 w-32 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 rounded-full mt-4 shadow-lg"></div>
                        </div>

                        {/* Slide Content */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white drop-shadow-lg mt-2 mb-3" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white drop-shadow-lg mt-2 mb-2" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-white drop-shadow-md mt-2 mb-2" {...props} />,
                                            p: ({ node, ...props }) => <p className="text-white drop-shadow-md mb-3 leading-relaxed text-base font-medium" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="space-y-2 mb-4" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="space-y-2 mb-4" {...props} />,
                                            li: ({ node, ...props }) => (
                                                <li className="flex items-start gap-3 text-white drop-shadow-md font-medium" {...props}>
                                                    <span className="text-2xl flex-shrink-0 leading-none">✨</span>
                                                    <span className="flex-1 pt-1">{props.children}</span>
                                                </li>
                                            ),
                                            strong: ({ node, ...props }) => <strong className="font-bold text-yellow-300 bg-purple-900/40 px-1.5 py-0.5 rounded drop-shadow-lg" {...props} />,
                                            em: ({ node, ...props }) => <em className="italic text-pink-300 font-semibold drop-shadow-md" {...props} />,
                                            code: ({ node, ...props }) => <code className="bg-purple-900/60 text-yellow-200 px-2 py-1 rounded text-sm font-mono drop-shadow-md" {...props} />,
                                        }}
                                    >
                                        {slide.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>

                        {/* Slide Number - Bottom Right */}
                        <div className="mt-4 flex justify-end">
                            <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-purple-700 rounded-full text-sm font-bold shadow-lg">
                                {slide.slideNumber} / {presentation.totalSlides}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer - Navigation and Controls - Hidden in fullscreen */}
                {!isFullscreen && (
                    <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-2xl">
                        {/* Slide Thumbnails/Dots */}
                        <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                            {presentation.slides.map((s, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-8 h-8 rounded-lg font-medium text-sm transition-all ${index === currentSlide
                                        ? 'bg-purple-600 text-white scale-110 shadow-md'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={handlePrevSlide}
                                disabled={currentSlide === 0}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-lg transition-all flex items-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>

                            {/* Slideshow Button */}
                            <button
                                onClick={enterFullscreen}
                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Fullscreen Slideshow
                            </button>

                            {/* VISUALIZE Button */}
                            {!presentation.imagesGenerated && (
                                <button
                                    onClick={handleVisualizeAll}
                                    disabled={isGeneratingImages}
                                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm"
                                >
                                    {isGeneratingImages ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {Math.round(imageGenerationProgress)}%
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            VISUALIZE
                                        </>
                                    )}
                                </button>
                            )}

                            {presentation.imagesGenerated && (
                                <div className="px-6 py-2 bg-green-100 text-green-700 font-semibold rounded-lg flex items-center gap-2 text-sm">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Images Generated
                                </div>
                            )}

                            <button
                                onClick={handleNextSlide}
                                disabled={currentSlide === presentation.slides.length - 1}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center gap-2 text-sm"
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
