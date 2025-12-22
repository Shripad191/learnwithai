import type { SummaryStructure, ClassLevel, Quiz, QuizQuestion } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Get Gemini client with API key
 */
function getGeminiClient(feature?: 'quiz'): GoogleGenerativeAI {
    let apiKey: string | undefined;

    // Use feature-specific API key if available, otherwise fall back to default
    if (feature === 'quiz') {
        apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY_QUIZ || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    } else {
        apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    }

    if (!apiKey) {
        throw new Error("Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file");
    }

    return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate quiz questions from a summary using Gemini AI
 */
export async function generateQuiz(
    summary: SummaryStructure,
    subject: string = '',
    language: string = 'English'
): Promise<Quiz> {
    try {
        const genAI = getGeminiClient('quiz');

        const classLevel = summary.classLevel;
        const isMathematics = subject.toLowerCase().includes('math') || subject.toLowerCase().includes('गणित');

        // Determine question distribution based on class level
        const getQuestionCounts = (level: ClassLevel) => {
            if (level <= 3) {
                return { mcq: 3, trueFalse: 2, shortAnswer: 1 };
            } else if (level <= 6) {
                return { mcq: 5, trueFalse: 3, shortAnswer: 2 };
            } else {
                return { mcq: 7, trueFalse: 4, shortAnswer: 3 };
            }
        };

        const counts = getQuestionCounts(classLevel);
        const summaryJson = JSON.stringify(summary, null, 2);

        const mathInstructions = isMathematics ? `
🔢 MATHEMATICS-SPECIFIC REQUIREMENTS:
- ALL questions MUST be NUMERICAL/CALCULATION-based
- Include word problems that require calculations
- MCQs should have numerical answers with calculation steps
- Short answer questions should require solving mathematical problems
- True/False can be about mathematical properties or equation validity
- Each question should test mathematical reasoning and problem-solving
- Include step-by-step solutions in explanations
- Use real-world scenarios that require mathematical calculations

EXAMPLE MATHEMATICS QUESTIONS:
MCQ: "If a rectangle has length 12 cm and width 8 cm, what is its area?"
Options: ["96 cm²", "40 cm²", "20 cm²", "48 cm²"]

Short Answer: "A shopkeeper bought 15 pencils at ₹5 each and sold them at ₹7 each. Calculate the total profit."

True/False: "The sum of angles in any triangle is always 180 degrees."

❌ AVOID: Theoretical/definition questions like "What is area?" or "Define perimeter"
✅ FOCUS ON: Calculation problems, word problems, numerical reasoning
` : `
GENERAL SUBJECT REQUIREMENTS:
- Questions should test understanding and application
- Include conceptual and analytical questions
- Mix of recall, comprehension, and application levels
`;

        const prompt = `You are an educational quiz generator. Create quiz questions from the following summary for Class ${classLevel} students.
${subject ? `SUBJECT: ${subject}` : ''}

🚨 CRITICAL LANGUAGE REQUIREMENT 🚨
THE SUMMARY IS IN: ${language.toUpperCase()}
ALL QUESTIONS MUST BE IN: ${language.toUpperCase()}

QUESTION DISTRIBUTION:
- ${counts.mcq} Multiple Choice Questions (4 options each)
- ${counts.trueFalse} True/False Questions
- ${counts.shortAnswer} Short Answer Questions

${mathInstructions}

REQUIREMENTS:
1. Questions should test UNDERSTANDING, not just recall
2. Difficulty appropriate for Class ${classLevel}
3. Cover DIFFERENT topics from the summary
4. MCQ distractors should be plausible but clearly wrong
5. Short answers should require 1-2 sentences${isMathematics ? ' with calculations' : ''}
6. Include brief explanations for correct answers${isMathematics ? ' with step-by-step solutions' : ''}
7. ALL text (questions, options, answers, explanations) in ${language}

DIFFICULTY GUIDELINES for Class ${classLevel}:
- Easy: ${isMathematics ? 'Simple calculations with 1-2 steps' : 'Direct facts from summary'}
- Medium: ${isMathematics ? 'Multi-step problems requiring 2-3 operations' : 'Requires understanding concepts'}
- Hard: ${isMathematics ? 'Complex word problems requiring multiple concepts' : 'Requires application or analysis'}

OUTPUT FORMAT (STRICT JSON):
{
  "questions": [
    {
      "id": "mcq_1",
      "type": "multiple-choice",
      "question": "Question text in ${language}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct in ${language}${isMathematics ? ' with calculation steps' : ''}",
      "difficulty": "medium",
      "topic": "Main topic name from summary"
    },
    {
      "id": "tf_1",
      "type": "true-false",
      "question": "Statement in ${language}",
      "correctAnswer": "true",
      "explanation": "Explanation in ${language}",
      "difficulty": "easy",
      "topic": "Main topic name"
    },
    {
      "id": "sa_1",
      "type": "short-answer",
      "question": "Question in ${language}",
      "correctAnswer": "Expected answer in ${language}",
      "explanation": "What makes a good answer in ${language}",
      "difficulty": "hard",
      "topic": "Main topic name"
    }
  ]
}

SUMMARY DATA:
${summaryJson}

Generate exactly ${counts.mcq + counts.trueFalse + counts.shortAnswer} questions following the format above.
🚨 CRITICAL: ALL questions, options, and explanations MUST be in ${language.toUpperCase()}!`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Extract JSON from response
        let jsonText = response.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const parsed = JSON.parse(jsonText);

        const quiz: Quiz = {
            id: `quiz_${Date.now()}`,
            chapterName: summary.chapterName,
            classLevel: summary.classLevel,
            questions: parsed.questions,
            generatedAt: Date.now()
        };

        return quiz;
    } catch (error) {
        console.error('Quiz generation error:', error);
        throw new Error(
            error instanceof Error
                ? `Failed to generate quiz: ${error.message}`
                : 'Failed to generate quiz'
        );
    }
}

/**
 * Detect language from summary content
 */
export function detectQuizLanguage(summary: SummaryStructure): string {
    // Simple detection based on first topic name
    const firstTopic = summary.mainTopics[0]?.name || summary.chapterName;

    // Check for Devanagari script (Hindi/Marathi/Sanskrit)
    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(firstTopic)) {
        // Could be Hindi, Marathi, or Sanskrit - default to Hindi
        return 'Hindi';
    }

    return 'English';
}

/**
 * Detect language from text content
 */
export function detectLanguageFromText(text: string): string {
    // Check for Devanagari script (Hindi/Marathi/Sanskrit)
    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(text)) {
        return 'Hindi';
    }
    return 'English';
}

/**
 * Generate quiz questions directly from chapter content (independent of summary)
 */
export async function generateQuizFromChapter(
    chapterName: string,
    chapterContent: string,
    classLevel: ClassLevel,
    subject: string = '',
    board: string = 'CBSE'
): Promise<Quiz> {
    try {
        const genAI = getGeminiClient('quiz');

        const language = detectLanguageFromText(chapterName + ' ' + chapterContent);
        const isMathematics = subject.toLowerCase().includes('math') || subject.toLowerCase().includes('गणित');

        // Determine question distribution based on class level
        const getQuestionCounts = (level: ClassLevel) => {
            if (level <= 3) {
                return { mcq: 3, trueFalse: 2, shortAnswer: 1 };
            } else if (level <= 6) {
                return { mcq: 5, trueFalse: 3, shortAnswer: 2 };
            } else {
                return { mcq: 7, trueFalse: 4, shortAnswer: 3 };
            }
        };

        const counts = getQuestionCounts(classLevel);

        const mathInstructions = isMathematics ? `
🔢 MATHEMATICS-SPECIFIC REQUIREMENTS:
- ALL questions MUST be NUMERICAL/CALCULATION-based
- Include word problems that require calculations
- MCQs should have numerical answers with calculation steps
- Short answer questions should require solving mathematical problems
- True/False can be about mathematical properties or equation validity
- Each question should test mathematical reasoning and problem-solving
- Include step-by-step solutions in explanations
- Use real-world scenarios that require mathematical calculations

EXAMPLE MATHEMATICS QUESTIONS:
MCQ: "If a rectangle has length 12 cm and width 8 cm, what is its area?"
Options: ["96 cm²", "40 cm²", "20 cm²", "48 cm²"]

Short Answer: "A shopkeeper bought 15 pencils at ₹5 each and sold them at ₹7 each. Calculate the total profit."

True/False: "The sum of angles in any triangle is always 180 degrees."

❌ AVOID: Theoretical/definition questions like "What is area?" or "Define perimeter"
✅ FOCUS ON: Calculation problems, word problems, numerical reasoning
` : `
GENERAL SUBJECT REQUIREMENTS:
- Questions should test understanding and application
- Include conceptual and analytical questions
- Mix of recall, comprehension, and application levels
`;

        const prompt = `You are an educational quiz generator for ${board} board. Create quiz questions directly from the chapter content for Class ${classLevel} students.

**CHAPTER DETAILS:**
- Chapter Name: ${chapterName}
- Subject: ${subject || 'General'}
- Class Level: ${classLevel}
- Board: ${board}

**CHAPTER CONTENT:**
${chapterContent || 'Generate questions based on the chapter name and typical curriculum for this topic.'}

🚨 CRITICAL LANGUAGE REQUIREMENT 🚨
DETECTED LANGUAGE: ${language.toUpperCase()}
ALL QUESTIONS MUST BE IN: ${language.toUpperCase()}

QUESTION DISTRIBUTION:
- ${counts.mcq} Multiple Choice Questions (4 options each)
- ${counts.trueFalse} True/False Questions
- ${counts.shortAnswer} Short Answer Questions

${mathInstructions}

REQUIREMENTS:
1. Questions should test UNDERSTANDING, not just recall
2. Difficulty appropriate for Class ${classLevel}
3. Cover DIFFERENT topics from the chapter
4. MCQ distractors should be plausible but clearly wrong
5. Short answers should require 1-2 sentences${isMathematics ? ' with calculations' : ''}
6. Include brief explanations for correct answers${isMathematics ? ' with step-by-step solutions' : ''}
7. ALL text (questions, options, answers, explanations) in ${language}
8. Questions should be based on ${board} curriculum standards

DIFFICULTY GUIDELINES for Class ${classLevel}:
- Easy: ${isMathematics ? 'Simple calculations with 1-2 steps' : 'Direct facts from chapter'}
- Medium: ${isMathematics ? 'Multi-step problems requiring 2-3 operations' : 'Requires understanding concepts'}
- Hard: ${isMathematics ? 'Complex word problems requiring multiple concepts' : 'Requires application or analysis'}

OUTPUT FORMAT (STRICT JSON):
{
  "questions": [
    {
      "id": "mcq_1",
      "type": "multiple-choice",
      "question": "Question text in ${language}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct in ${language}${isMathematics ? ' with calculation steps' : ''}",
      "difficulty": "medium",
      "topic": "Main topic from chapter"
    },
    {
      "id": "tf_1",
      "type": "true-false",
      "question": "Statement in ${language}",
      "correctAnswer": "true",
      "explanation": "Explanation in ${language}",
      "difficulty": "easy",
      "topic": "Main topic"
    },
    {
      "id": "sa_1",
      "type": "short-answer",
      "question": "Question in ${language}",
      "correctAnswer": "Expected answer in ${language}",
      "explanation": "What makes a good answer in ${language}",
      "difficulty": "hard",
      "topic": "Main topic"
    }
  ]
}

Generate exactly ${counts.mcq + counts.trueFalse + counts.shortAnswer} questions following the format above.
🚨 CRITICAL: ALL questions, options, and explanations MUST be in ${language.toUpperCase()}!`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Extract JSON from response
        let jsonText = response.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/```\n?/g, '');
        }

        const parsed = JSON.parse(jsonText);

        const quiz: Quiz = {
            id: `quiz_${Date.now()}`,
            chapterName: chapterName,
            classLevel: classLevel,
            questions: parsed.questions,
            generatedAt: Date.now()
        };

        return quiz;
    } catch (error) {
        console.error('Quiz generation error:', error);
        throw new Error(
            error instanceof Error
                ? `Failed to generate quiz: ${error.message}`
                : 'Failed to generate quiz'
        );
    }
}
