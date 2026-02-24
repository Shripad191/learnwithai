import type { ClassLevel, Board, LessonPlan, Lecture } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { callOpenRouter, isOpenRouterConfigured } from './openrouter';

/**
 * Get Gemini client with API key
 */
function getGeminiClient(feature?: 'lesson'): GoogleGenerativeAI {
  let apiKey: string | undefined;

  // Use feature-specific API key if available, otherwise fall back to default
  if (feature === 'lesson') {
    apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY_LESSON || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  } else {
    apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }

  if (!apiKey) {
    throw new Error("Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file");
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate a Teach Pack (Lesson Plan) - NEP 2020 & NCF Compliant - Multi-Lecture Format
 */
export async function generateLessonPlan(
  board: Board,
  classLevel: ClassLevel,
  subject: string,
  topic: string,
  totalMinutes: number,
  desiredLectures: number,
  teachingStyle: 'traditional' | 'activity' | 'nep',
  customization: string = '',
  language: string = 'English'
): Promise<LessonPlan> {
  try {
    console.log('📚 generateLessonPlan: Calling Gemini with:', { board, classLevel, subject, topic, totalMinutes, teachingStyle, customization });
    const genAI = getGeminiClient('lesson');
    console.log('✅ Gemini client initialized');

    const prompt = `Act as an expert Indian school teacher compliant with NEP and NCF.
Create a multi-lecture "Teach Pack" (Lesson Plan) for an entire chapter/topic:

**CHAPTER DETAILS:**
- Board: ${board}
- Class: ${classLevel}
- Subject: ${subject}
- Chapter/Topic: ${topic}
- Total Available Time: ${totalMinutes} minutes
- **REQUIRED Number of Lectures: ${desiredLectures}** (YOU MUST GENERATE EXACTLY ${desiredLectures} LECTURES, NO MORE, NO LESS)
- Teaching Style: ${teachingStyle === 'traditional' ? 'Traditional (Content-focused)' : teachingStyle === 'activity' ? 'Activity Based (Hands-on learning)' : 'NEP/NCF (Balanced approach)'}
- Language: ${language}

${customization ? `**TEACHER'S CUSTOM INSTRUCTIONS:**\n${customization}\n\nPlease incorporate these instructions into the lesson plan where applicable.\n` : ''}

**CRITICAL INSTRUCTIONS:**

1. **YOU MUST GENERATE EXACTLY ${desiredLectures} LECTURES** - This is a strict requirement!
   - Do NOT generate more or fewer lectures than ${desiredLectures}
   - Distribute the ${totalMinutes} minutes across these ${desiredLectures} lectures
   - Average time per lecture should be approximately ${Math.round(totalMinutes / desiredLectures)} minutes

2. **Analyze the chapter/topic** and determine:
   - What sub-topics should be covered in each of the ${desiredLectures} lectures
   - Time allocation for each lecture based on topic complexity
   - Ensure time allocations sum to approximately ${totalMinutes} minutes total

3. **Structure Requirements:**
   - **Lecture 1**: Start fresh with the chapter introduction
   - **Lectures 2 to ${desiredLectures - 1}**: Include a 5-minute recap of the previous lecture at the beginning
   - **Lecture ${desiredLectures} (LAST LECTURE)**: Should be a comprehensive activity and discussion session covering the ENTIRE chapter (not just new content)
   - **Homework**: Provided at the END of all lectures (not time-bounded, practice-oriented)
   - **Parent Message**: One message for the entire chapter

3. **For EACH lecture (except the last)**, generate 6 cards:
   - **Today's Plan**: Overview, learning objectives (NEP-aligned), expected outcomes
   - **Start (Hook)**: Engaging 2-3 min activity, curiosity-sparking question, connection to Indian context
   - **Explain (Concept)**: Core concepts, Indian context examples, visual aids, key vocabulary
   - **Do (Activity)**: Hands-on activity, materials (easily available), step-by-step instructions, duration
   - **Talk (Discussion)**: 3-5 discussion questions, think-pair-share, real-world applications, critical thinking
   - **Check (Assessment)**: 3-5 quick questions (MCQ/short answer/true-false) to check understanding

4. **For the LAST lecture (Activity & Discussion)**, generate:
   - **Today's Plan**: Overview of comprehensive review and activity
   - **Start (Hook)**: Engaging recap activity for the entire chapter
   - **Explain (Concept)**: Brief synthesis of all key concepts from the chapter
   - **Do (Activity)**: Major hands-on activity or project that integrates ALL chapter concepts
   - **Talk (Discussion)**: Deep discussion questions covering the entire chapter, real-world applications
   - **Check (Assessment)**: Comprehensive assessment covering all lectures

5. **Homework Section** (at the end):
   - 5-10 practice problems/questions covering the ENTIRE chapter
   - Mix of recall, application, and analysis questions
   - NOT time-bounded (students can complete at their own pace)
   - Parent guidance notes

6. **Parent WhatsApp Message**:
   - Brief, friendly message (2-3 sentences)
   - What was taught in this chapter
   - How parents can support at home
   - Keep it under 100 words

**OUTPUT FORMAT (STRICT JSON):**

CRITICAL: The "totalLectures" field MUST equal ${desiredLectures}, and you MUST generate exactly ${desiredLectures} lecture objects in the "lectures" array.

{
  "totalLectures": ${desiredLectures},
  "lectures": [
    {
      "lectureNumber": 1,
      "title": "Lecture title",
      "duration": <minutes>,
      "topics": ["topic1", "topic2"],
      "complexity": "easy" | "moderate" | "difficult",
      "hasRecap": false,
      "recapContent": "",
      "isActivityLecture": false,
      "teachPackCards": {
        "todaysPlan": "Markdown content",
        "start": "Markdown content",
        "explain": "Markdown content",
        "do": "Markdown content",
        "talk": "Markdown content",
        "check": "Markdown content"
      }
    },
    {
      "lectureNumber": 2,
      "title": "Lecture title",
      "duration": <minutes>,
      "topics": ["topic3", "topic4"],
      "complexity": "easy" | "moderate" | "difficult",
      "hasRecap": true,
      "recapContent": "5-minute recap of previous lecture in markdown",
      "isActivityLecture": false,
      "teachPackCards": {
        "todaysPlan": "Markdown content",
        "start": "Markdown content",
        "explain": "Markdown content",
        "do": "Markdown content",
        "talk": "Markdown content",
        "check": "Markdown content"
      }
    },
    ... (continue until you have exactly ${desiredLectures} lectures)
    {
      "lectureNumber": ${desiredLectures},
      "title": "Chapter Review & Activity",
      "duration": <minutes>,
      "topics": ["Comprehensive review of all topics"],
      "complexity": "moderate",
      "hasRecap": true,
      "recapContent": "5-minute recap of previous lecture in markdown",
      "isActivityLecture": true,
      "teachPackCards": {
        "todaysPlan": "Markdown content for comprehensive review",
        "start": "Markdown content for chapter recap activity",
        "explain": "Markdown content synthesizing all concepts",
        "do": "Markdown content for major integrative activity",
        "talk": "Markdown content for deep chapter-wide discussion",
        "check": "Markdown content for comprehensive assessment"
      }
    }
  ],
  "homework": "Markdown content for homework (not time-bounded)",
  "parentMessage": "Markdown content for parent WhatsApp message"
}

**IMPORTANT:**
- Keep language simple, direct, and actionable
- Use Markdown formatting
- ALL content MUST be in ${language.toUpperCase()}
- Ensure time allocations are realistic and add up to approximately ${totalMinutes} minutes
- Make the last lecture truly comprehensive, covering the ENTIRE chapter
- VERIFY: You have generated exactly ${desiredLectures} lectures before submitting

Generate the complete multi-lecture Teach Pack now!`;

    console.log('📡 Sending request to Gemini API...');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
      const result = await model.generateContent(prompt);
      console.log('✅ Received response from Gemini API');
      const response = result.response.text();
      console.log('📝 Response text length:', response.length);

      // Extract JSON from response
      let jsonText = response.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonText);

      const lessonPlan: LessonPlan = {
        id: `lesson_${Date.now()}`,
        board,
        classLevel,
        subject,
        topic,
        totalMinutes,
        totalLectures: parsed.totalLectures || parsed.lectures.length,
        lectures: parsed.lectures.map((lecture: any) => ({
          lectureNumber: lecture.lectureNumber,
          title: lecture.title,
          duration: lecture.duration,
          topics: lecture.topics || [],
          complexity: lecture.complexity || 'moderate',
          hasRecap: lecture.hasRecap || false,
          recapContent: lecture.recapContent || '',
          isActivityLecture: lecture.isActivityLecture || false,
          teachPackCards: {
            todaysPlan: lecture.teachPackCards.todaysPlan || '',
            start: lecture.teachPackCards.start || '',
            explain: lecture.teachPackCards.explain || '',
            do: lecture.teachPackCards.do || '',
            talk: lecture.teachPackCards.talk || '',
            check: lecture.teachPackCards.check || ''
          }
        })),
        homework: parsed.homework || '',
        parentMessage: parsed.parentMessage || '',
        teachingPace: teachingStyle,
        generatedAt: Date.now(),
        customized: false,
        language
      };

      console.log("✅ Lesson plan generated via Gemini");
      return lessonPlan;
    } catch (geminiError) {
      console.warn("Gemini lesson plan generation failed, trying OpenRouter fallback:", geminiError);

      if (!isOpenRouterConfigured()) {
        throw geminiError;
      }

      try {
        console.log('📡 Sending request to OpenRouter API...');
        const response = await callOpenRouter(prompt);
        console.log('✅ Received response from OpenRouter API');
        console.log('📝 Response text length:', response.length);

        // Extract JSON from response
        let jsonText = response.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\n?/g, '');
        }

        const parsed = JSON.parse(jsonText);

        const lessonPlan: LessonPlan = {
          id: `lesson_${Date.now()}`,
          board,
          classLevel,
          subject,
          topic,
          totalMinutes,
          totalLectures: parsed.totalLectures || parsed.lectures.length,
          lectures: parsed.lectures.map((lecture: any) => ({
            lectureNumber: lecture.lectureNumber,
            title: lecture.title,
            duration: lecture.duration,
            topics: lecture.topics || [],
            complexity: lecture.complexity || 'moderate',
            hasRecap: lecture.hasRecap || false,
            recapContent: lecture.recapContent || '',
            isActivityLecture: lecture.isActivityLecture || false,
            teachPackCards: {
              todaysPlan: lecture.teachPackCards.todaysPlan || '',
              start: lecture.teachPackCards.start || '',
              explain: lecture.teachPackCards.explain || '',
              do: lecture.teachPackCards.do || '',
              talk: lecture.teachPackCards.talk || '',
              check: lecture.teachPackCards.check || ''
            }
          })),
          homework: parsed.homework || '',
          parentMessage: parsed.parentMessage || '',
          teachingPace: teachingStyle,
          generatedAt: Date.now(),
          customized: false,
          language
        };

        console.log("✅ Lesson plan generated via OpenRouter");
        return lessonPlan;
      } catch (fallbackError) {
        console.error("Both Gemini and OpenRouter failed for lesson plan generation");
        throw new Error(
          `Failed to generate lesson plan with both APIs. Gemini error: ${geminiError instanceof Error ? geminiError.message : 'Unknown'}. OpenRouter error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown'}`
        );
      }
    }
  } catch (error) {
    console.error('Lesson plan generation error:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to generate lesson plan: ${error.message}`
        : 'Failed to generate lesson plan'
    );
  }
}
