import type { ClassLevel, SELSTEMActivity, ActivityType } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { callOpenRouter, isOpenRouterConfigured } from './openrouter';

/**
 * Get Gemini client with API key
 */
function getGeminiClient(feature?: 'activity'): GoogleGenerativeAI {
    let apiKey: string | undefined;

    // Use feature-specific API key if available, otherwise fall back to default
    if (feature === 'activity') {
        apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY_ACTIVITY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    } else {
        apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    }

    if (!apiKey) {
        throw new Error("Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file");
    }

    return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate a SEL/STEM Activity
 */
export async function generateSELSTEMActivity(
    classLevel: ClassLevel,
    subject: string,
    activityType: ActivityType,
    topic?: string
): Promise<SELSTEMActivity> {
    try {
        console.log('🎯 generateSELSTEMActivity: Getting Gemini client...');
        const genAI = getGeminiClient('activity');
        console.log('✅ Gemini client initialized');

        const activityTypeText = activityType === 'solo' ? 'SOLO (Individual)' : 'GROUP (3-4 students)';
        const difficultyGuidance = getDifficultyGuidance(classLevel);
        const topicContext = topic ? `\n- Topic/Chapter: ${topic}` : '';

        const prompt = `Act as an expert educator specializing in SEL (Social-Emotional Learning) integrated STEM education for Indian schools.

Create a ${activityTypeText} activity for:
- Class: ${classLevel}
- Subject: ${subject}${topicContext}
- Activity Type: ${activityTypeText}

${difficultyGuidance}

Requirements:
1. **Grade-appropriate difficulty** for Class ${classLevel} students
2. **Real-world application** - Connect to everyday life, local community, or current issues${topic ? `\n3. **Topic-focused** - The activity MUST be directly related to "${topic}" and help students understand this concept through hands-on experience` : '\n3. **Subject-relevant** - Connect to the subject curriculum'}
${topic ? '4' : '3'}. **SEL Integration** - Include 2-3 SEL components:
   ${activityType === 'solo'
                ? '- Self-awareness, Self-management, Responsible decision-making, Reflection'
                : '- Collaboration, Communication, Empathy, Teamwork, Conflict resolution'}
${topic ? '5' : '4'}. **Hands-on and engaging** - Inquiry-based, experiential learning
${topic ? '6' : '5'}. **Achievable materials** - Use common classroom/household items
${topic ? '7' : '6'}. **Clear instructions** - Step-by-step, easy to follow
${topic ? '8' : '7'}. **Reflection component** - Help students process their learning

Generate a detailed activity in VALID JSON format (no markdown, just pure JSON):
{
    "title": "Engaging activity title",
    "selFocus": ["SEL skill 1", "SEL skill 2", "SEL skill 3"],
    "realWorldConnection": "Detailed explanation of how this relates to real life, local community, or current issues",
    "materials": ["material 1", "material 2", "material 3"],
    "duration": "30-45 minutes",
    "instructions": {
        "setup": "Clear preparation steps for the teacher",
        "steps": [
            "Step 1: Clear instruction",
            "Step 2: Clear instruction",
            "Step 3: Clear instruction",
            "Step 4: Clear instruction",
            "Step 5: Clear instruction"
        ],
        "reflection": "Reflection questions or discussion prompts for students"
    },
    "learningObjectives": [
        "Students will be able to...",
        "Students will understand...",
        "Students will develop..."
    ],
    "assessmentCriteria": [
        "Criterion 1 for evaluation",
        "Criterion 2 for evaluation",
        "Criterion 3 for evaluation"
    ],
    "extensions": [
        "Extension idea 1 for advanced students",
        "Extension idea 2 for deeper exploration"
    ]
}

IMPORTANT: Return ONLY the JSON object, no additional text, no markdown formatting, no code blocks.`;

        try {
            console.log('📡 Calling Gemini API...');
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            console.log('📝 Raw response received');

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
                throw new Error("Failed to parse activity response");
            }

            console.log('🔍 Parsing JSON...');
            const parsed = JSON.parse(jsonMatch[0]);

            const activity: SELSTEMActivity = {
                id: `activity-${Date.now()}`,
                classLevel,
                subject,
                activityType,
                title: parsed.title || 'Untitled Activity',
                selFocus: parsed.selFocus || [],
                realWorldConnection: parsed.realWorldConnection || '',
                materials: parsed.materials || [],
                duration: parsed.duration || '30-45 minutes',
                instructions: {
                    setup: parsed.instructions?.setup || '',
                    steps: parsed.instructions?.steps || [],
                    reflection: parsed.instructions?.reflection || ''
                },
                learningObjectives: parsed.learningObjectives || [],
                assessmentCriteria: parsed.assessmentCriteria || [],
                extensions: parsed.extensions || [],
                generatedAt: Date.now()
            };

            console.log('✅ Activity generated via Gemini:', activity.title);
            return activity;
        } catch (geminiError) {
            console.warn("Gemini activity generation failed, trying OpenRouter fallback:", geminiError);

            if (!isOpenRouterConfigured()) {
                throw geminiError;
            }

            try {
                console.log('📡 Calling OpenRouter API...');
                const text = await callOpenRouter(prompt);
                console.log('📝 Raw response received from OpenRouter');

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
                    throw new Error("Failed to parse activity response");
                }

                console.log('🔍 Parsing JSON...');
                const parsed = JSON.parse(jsonMatch[0]);

                const activity: SELSTEMActivity = {
                    id: `activity-${Date.now()}`,
                    classLevel,
                    subject,
                    activityType,
                    title: parsed.title || 'Untitled Activity',
                    selFocus: parsed.selFocus || [],
                    realWorldConnection: parsed.realWorldConnection || '',
                    materials: parsed.materials || [],
                    duration: parsed.duration || '30-45 minutes',
                    instructions: {
                        setup: parsed.instructions?.setup || '',
                        steps: parsed.instructions?.steps || [],
                        reflection: parsed.instructions?.reflection || ''
                    },
                    learningObjectives: parsed.learningObjectives || [],
                    assessmentCriteria: parsed.assessmentCriteria || [],
                    extensions: parsed.extensions || [],
                    generatedAt: Date.now()
                };

                console.log('✅ Activity generated via OpenRouter:', activity.title);
                return activity;
            } catch (fallbackError) {
                console.error("Both Gemini and OpenRouter failed for activity generation");
                throw new Error(
                    `Failed to generate activity with both APIs. Gemini error: ${geminiError instanceof Error ? geminiError.message : 'Unknown'}. OpenRouter error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown'}`
                );
            }
        }

    } catch (error) {
        console.error('❌ Error generating SEL/STEM activity:', error);
        throw error;
    }
}

/**
 * Get difficulty guidance based on class level
 */
function getDifficultyGuidance(classLevel: ClassLevel): string {
    if (classLevel <= 2) {
        return `**Difficulty Level**: Very Simple
- Use concrete, hands-on materials
- Simple 1-2 step processes
- Visual and tactile learning
- Short attention span activities (15-20 min)
- Basic vocabulary`;
    } else if (classLevel <= 5) {
        return `**Difficulty Level**: Elementary
- Hands-on with some abstract thinking
- 3-5 step processes
- Can follow multi-step instructions
- Moderate complexity (25-35 min)
- Age-appropriate vocabulary`;
    } else if (classLevel <= 8) {
        return `**Difficulty Level**: Intermediate
- Mix of concrete and abstract concepts
- Multi-step problem solving
- Can work independently or in groups
- Higher complexity (35-45 min)
- Subject-specific terminology`;
    } else {
        return `**Difficulty Level**: Advanced
- Abstract thinking and analysis
- Complex problem solving
- Independent research and exploration
- Extended activities (45+ min)
- Advanced terminology and concepts`;
    }
}
