import type { ClassLevel, LecturePresentation, PPTSlide } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { callOpenRouter, isOpenRouterConfigured } from './openrouter';

/**
 * Get Gemini client with API key
 */
function getGeminiClient(): GoogleGenerativeAI {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file");
    }

    return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate a presentation for a lecture based on START HOOK and EXPLAIN sections
 */
export async function generateLecturePresentation(
    lectureNumber: number,
    lectureTitle: string,
    topic: string,
    classLevel: ClassLevel,
    subject: string,
    startContent: string,
    explainContent: string
): Promise<LecturePresentation> {
    try {
        console.log('🎨 generateLecturePresentation: Starting PPT generation...');
        const genAI = getGeminiClient();

        const prompt = `Act as an expert Indian school teacher creating a presentation for students.

Create a presentation (PPT) for a lecture with 8-10 slides based on the following content:

**LECTURE DETAILS:**
- Lecture Number: ${lectureNumber}
- Lecture Title: ${lectureTitle}
- Chapter/Topic: ${topic}
- Class: ${classLevel}
- Subject: ${subject}

**CONTENT TO BASE SLIDES ON:**

**START HOOK (Engaging Introduction):**
${startContent}

**EXPLAIN (Main Concepts):**
${explainContent}

**REQUIREMENTS:**

1. **Create EXACTLY 8-10 slides** (no more, no less)
2. **Simple Language**: Use very simple, clear language suitable for Class ${classLevel} Indian students
3. **Indian Context**: Include Indian examples, scenarios, and cultural references where appropriate
4. **Slide Structure**:
   - Slide 1: Title slide with lecture title and topic
   - Slides 2-3: Based on START HOOK content (engaging introduction, hook question, real-life connection)
   - Slides 4-8: Based on EXPLAIN content (key concepts, examples, diagrams description)
   - Slide 9-10: Summary, key takeaways, or practice questions
5. **Content per slide**: Keep it concise - 3-5 bullet points or 2-3 short paragraphs maximum
6. **Image Prompts**: For each slide, provide a descriptive image prompt that would create a relevant, educational image for Indian students
7. **Markdown Formatting**: Use markdown for content (bold, italic, lists, etc.)

**OUTPUT FORMAT (STRICT JSON):**

{
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide title",
      "content": "Markdown formatted content for the slide",
      "imagePrompt": "Detailed description for an educational image suitable for this slide, with Indian context"
    },
    {
      "slideNumber": 2,
      "title": "Slide title",
      "content": "Markdown formatted content",
      "imagePrompt": "Image description"
    },
    ... (continue for 8-10 slides)
  ]
}

**IMPORTANT:**
- Return ONLY valid JSON, no markdown code blocks, no additional text
- Ensure all content is in simple English suitable for Class ${classLevel}
- Make image prompts descriptive and educational
- Keep slides focused and not overcrowded with text
- Use Indian examples and context throughout

Generate the presentation now!`;

        try {
            console.log('📡 Calling Gemini API for PPT generation...');
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            console.log('📝 Raw PPT response received');

            // Clean the response - remove markdown code blocks if present
            let cleanedText = text.trim();
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            // Parse JSON response
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('❌ Failed to find JSON in response:', cleanedText);
                throw new Error("Failed to parse PPT response");
            }

            console.log('🔍 Parsing JSON...');
            const parsed = JSON.parse(jsonMatch[0]);

            // Validate we have slides
            if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length < 8 || parsed.slides.length > 10) {
                throw new Error(`Invalid number of slides generated: ${parsed.slides?.length || 0}. Expected 8-10 slides.`);
            }

            // Map to PPTSlide format
            const slides: PPTSlide[] = parsed.slides.map((slide: any) => ({
                slideNumber: slide.slideNumber,
                title: slide.title || 'Untitled Slide',
                content: slide.content || '',
                imagePrompt: slide.imagePrompt || '',
                imageUrl: undefined,
                hasImage: false
            }));

            const presentation: LecturePresentation = {
                id: `ppt-${lectureNumber}-${Date.now()}`,
                lectureNumber,
                lectureTitle,
                topic,
                classLevel,
                subject,
                slides,
                totalSlides: slides.length,
                generatedAt: Date.now(),
                imagesGenerated: false
            };

            console.log(`✅ Presentation generated via Gemini with ${slides.length} slides`);
            return presentation;
        } catch (geminiError) {
            console.warn("Gemini presentation generation failed, trying OpenRouter fallback:", geminiError);

            if (!isOpenRouterConfigured()) {
                throw geminiError;
            }

            try {
                console.log('📡 Calling OpenRouter API for PPT generation...');
                const text = await callOpenRouter(prompt);
                console.log('📝 Raw PPT response received from OpenRouter');

                // Clean the response - remove markdown code blocks if present
                let cleanedText = text.trim();
                if (cleanedText.startsWith('```json')) {
                    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (cleanedText.startsWith('```')) {
                    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }

                // Parse JSON response
                const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    console.error('❌ Failed to find JSON in response:', cleanedText);
                    throw new Error("Failed to parse PPT response");
                }

                console.log('🔍 Parsing JSON...');
                const parsed = JSON.parse(jsonMatch[0]);

                // Validate we have slides
                if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length < 8 || parsed.slides.length > 10) {
                    throw new Error(`Invalid number of slides generated: ${parsed.slides?.length || 0}. Expected 8-10 slides.`);
                }

                // Map to PPTSlide format
                const slides: PPTSlide[] = parsed.slides.map((slide: any) => ({
                    slideNumber: slide.slideNumber,
                    title: slide.title || 'Untitled Slide',
                    content: slide.content || '',
                    imagePrompt: slide.imagePrompt || '',
                    imageUrl: undefined,
                    hasImage: false
                }));

                const presentation: LecturePresentation = {
                    id: `ppt-${lectureNumber}-${Date.now()}`,
                    lectureNumber,
                    lectureTitle,
                    topic,
                    classLevel,
                    subject,
                    slides,
                    totalSlides: slides.length,
                    generatedAt: Date.now(),
                    imagesGenerated: false
                };

                console.log(`✅ Presentation generated via OpenRouter with ${slides.length} slides`);
                return presentation;
            } catch (fallbackError) {
                console.error("Both Gemini and OpenRouter failed for presentation generation");
                throw new Error(
                    `Failed to generate presentation with both APIs. Gemini error: ${geminiError instanceof Error ? geminiError.message : 'Unknown'}. OpenRouter error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown'}`
                );
            }
        }

    } catch (error) {
        console.error('❌ Error generating presentation:', error);
        throw error;
    }
}

/**
 * Generate image prompts for all slides in a presentation
 */
export function generateImagePromptsForSlides(slides: PPTSlide[]): string[] {
    return slides
        .filter(slide => slide.imagePrompt && slide.imagePrompt.trim().length > 0)
        .map(slide => slide.imagePrompt!);
}
