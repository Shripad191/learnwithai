import type {
  ClassLevel,
  SummaryStructure,
  JsMindData,
  MainTopic,
  SubTopic,
  KeyPoint
} from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { callOpenRouter, isOpenRouterConfigured } from "./openrouter";

/**
 * Get Gemini client with API key
 */
function getGeminiClient(feature?: 'summary' | 'mindmap' | 'quiz'): GoogleGenerativeAI {
  let apiKey: string | undefined;

  // Use feature-specific API key if available, otherwise fall back to default
  switch (feature) {
    case 'summary':
      apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY_SUMMARY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      break;
    case 'mindmap':
      apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY_MINDMAP || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      break;
    case 'quiz':
      apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY_QUIZ || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      break;
    default:
      apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }

  if (!apiKey) {
    throw new Error("Gemini API key not found. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file");
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Detect the language of the input text
 */
async function detectLanguage(text: string): Promise<string> {
  const prompt = `Detect the primary language of this text. Respond with ONLY the language name.
Examples: English, Hindi, Marathi, Sanskrit, Tamil, Telugu, Gujarati, Bengali

Text:
${text.substring(0, 500)}

Language:`;

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const language = result.response.text().trim();
    console.log("🌐 Detected language (via Gemini):", language);
    return language;
  } catch (error) {
    console.warn("Gemini language detection failed, trying OpenRouter fallback:", error);

    if (isOpenRouterConfigured()) {
      try {
        const response = await callOpenRouter(prompt);
        const language = response.trim();
        console.log("🌐 Detected language (via OpenRouter):", language);
        return language;
      } catch (fallbackError) {
        console.error("OpenRouter language detection also failed:", fallbackError);
      }
    }

    console.log("🌐 Defaulting to English");
    return "English";
  }
}

/**
 * Generates a structured summary from chapter content OR topic name
 */
export async function generateSummary(
  chapterText: string,
  classLevel: ClassLevel,
  chapterName: string
): Promise<SummaryStructure> {
  try {
    // Determine if this is topic-based or content-based generation
    const isTopicBased = !chapterText || chapterText.trim().length === 0;

    // STEP 1: Detect language
    const textForLanguageDetection = isTopicBased ? chapterName : chapterText;
    const detectedLanguage = await detectLanguage(textForLanguageDetection);

    const genAI = getGeminiClient('summary');

    // Determine depth and complexity based on class level
    const getDepthConfig = (classLevel: ClassLevel) => {
      if (classLevel <= 3) {
        return {
          mainTopics: '2-3',
          subTopics: '1-2',
          keyPoints: '1-2',
          languageLevel: 'very simple words and basic concepts. Use everyday language that young children understand. Avoid complex terminology.',
          terminology: 'Use simple, familiar words. Example: "eat" instead of "consume", "mix" instead of "combine"'
        };
      } else if (classLevel <= 6) {
        return {
          mainTopics: '3-4',
          subTopics: '2-3',
          keyPoints: '2-3',
          languageLevel: 'simple explanations with some educational terminology. Introduce subject-specific terms but explain them clearly.',
          terminology: 'Start using textual terminologies but keep them simple. Example: "digestion", "habitat", "fraction", "multiplication"'
        };
      } else {
        return {
          mainTopics: '4-5',
          subTopics: '3-4',
          keyPoints: '3-4',
          languageLevel: 'advanced terminology and complex concepts. Use proper academic vocabulary and detailed explanations.',
          terminology: 'Use proper textual and academic terminologies. Example: "photosynthesis", "ecosystem", "denominator", "evaporation"'
        };
      }
    };

    const config = getDepthConfig(classLevel);

    // Create different prompts based on mode
    const prompt = isTopicBased
      ? `You are an expert educational content creator for students of Class ${classLevel}.

TASK: Create comprehensive educational content about the topic "${chapterName}" suitable for Class ${classLevel} students.

🚨🚨🚨 CRITICAL LANGUAGE REQUIREMENT 🚨🚨🚨
DETECTED TOPIC LANGUAGE: ${detectedLanguage.toUpperCase()}
OUTPUT LANGUAGE MUST BE: ${detectedLanguage.toUpperCase()}

ABSOLUTE RULES - NO EXCEPTIONS:
✓ If topic is in ${detectedLanguage}, output MUST be 100% in ${detectedLanguage}
✓ DO NOT translate to English or any other language
✓ DO NOT mix languages
✓ Every word, every sentence must be in ${detectedLanguage}
✓ Preserve the exact script of ${detectedLanguage}

IMPORTANT INSTRUCTIONS:
1. Generate educational content about "${chapterName}" from scratch
2. Include all important concepts, facts, and explanations
3. Make it comprehensive yet age-appropriate for Class ${classLevel}
4. DEPTH for Class ${classLevel}:
   - ${config.mainTopics} main topics
   - ${config.subTopics} sub topics each
   - ${config.keyPoints} key points each
5. LANGUAGE LEVEL: ${config.languageLevel}
6. TERMINOLOGY: ${config.terminology}

OUTPUT FORMAT (STRICT JSON):
{
  "chapterName": "${chapterName}",
  "classLevel": ${classLevel},
  "mainTopics": [
    {
      "name": "[IN ${detectedLanguage.toUpperCase()}]",
      "subTopics": [
        {
          "name": "[IN ${detectedLanguage.toUpperCase()}]",
          "keyPoints": [
            {
              "point": "[IN ${detectedLanguage.toUpperCase()}]",
              "description": "[IN ${detectedLanguage.toUpperCase()}]"
            }
          ]
        }
      ]
    }
  ]
}

🚨 FINAL REMINDER: Generate content in ${detectedLanguage.toUpperCase()} ONLY!`
      : `You are an expert educational content summarizer for students of Class ${classLevel}.

TASK: Create a structured summary suitable for Class ${classLevel} students.

🚨🚨🚨 CRITICAL LANGUAGE REQUIREMENT 🚨🚨🚨
DETECTED INPUT LANGUAGE: ${detectedLanguage.toUpperCase()}
OUTPUT LANGUAGE MUST BE: ${detectedLanguage.toUpperCase()}

ABSOLUTE RULES - NO EXCEPTIONS:
✓ If input is in ${detectedLanguage}, output MUST be 100% in ${detectedLanguage}
✓ DO NOT translate to English or any other language
✓ DO NOT mix languages
✓ Every word, every sentence must be in ${detectedLanguage}
✓ Preserve the exact script of ${detectedLanguage}

IMPORTANT INSTRUCTIONS:
1. Skip page numbers, references, footnotes
2. DEPTH for Class ${classLevel}:
   - ${config.mainTopics} main topics
   - ${config.subTopics} sub topics each
   - ${config.keyPoints} key points each
3. LANGUAGE LEVEL: ${config.languageLevel}
4. TERMINOLOGY: ${config.terminology}

OUTPUT FORMAT (STRICT JSON):
{
  "chapterName": "${chapterName}",
  "classLevel": ${classLevel},
  "mainTopics": [
    {
      "name": "[IN ${detectedLanguage.toUpperCase()}]",
      "subTopics": [
        {
          "name": "[IN ${detectedLanguage.toUpperCase()}]",
          "keyPoints": [
            {
              "point": "[IN ${detectedLanguage.toUpperCase()}]",
              "description": "[IN ${detectedLanguage.toUpperCase()}]"
            }
          ]
        }
      ]
    }
  ]
}

CHAPTER CONTENT:
${chapterText}

🚨 FINAL REMINDER: Generate summary in ${detectedLanguage.toUpperCase()} ONLY!`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = response.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const summary: SummaryStructure = JSON.parse(jsonText);
      console.log("✅ Summary generated via Gemini");
      return summary;
    } catch (geminiError) {
      console.warn("Gemini summary generation failed, trying OpenRouter fallback:", geminiError);

      if (!isOpenRouterConfigured()) {
        throw geminiError;
      }

      try {
        const response = await callOpenRouter(prompt);

        // Extract JSON from response (handle markdown code blocks)
        let jsonText = response.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\n?/g, '');
        }

        const summary: SummaryStructure = JSON.parse(jsonText);
        console.log("✅ Summary generated via OpenRouter");
        return summary;
      } catch (fallbackError) {
        console.error("Both Gemini and OpenRouter failed for summary generation");
        throw new Error(
          `Failed to generate summary with both APIs. Gemini error: ${geminiError instanceof Error ? geminiError.message : 'Unknown'}. OpenRouter error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown'}`
        );
      }
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to generate summary: ${error.message}`
        : "Failed to generate summary. Please try again."
    );
  }
}

/**
 * Generates jsMind-compatible mind map data from summary
 */
export async function generateMindMapData(
  summary: SummaryStructure
): Promise<JsMindData> {
  try {
    // Detect language from summary content
    const firstTopic = summary.mainTopics[0]?.name || summary.chapterName;
    const summaryLanguage = await detectLanguage(firstTopic);

    const genAI = getGeminiClient();

    const summaryJson = JSON.stringify(summary, null, 2);

    const classLevel = summary.classLevel;

    // Determine depth instructions based on class level
    const getDepthInstructions = (classLevel: number) => {
      if (classLevel <= 3) {
        return {
          layers: '3-4 layers (excluding root)',
          structure: 'Root → Main Topics → Sub Topics → Key Points (max 3-4 total layers)',
          note: 'Keep it simple with fewer branches for young learners'
        };
      } else if (classLevel <= 6) {
        return {
          layers: '4-5 layers (excluding root)',
          structure: 'Root → Main Topics → Sub Topics → Key Points → Details (max 4-5 total layers)',
          note: 'Moderate depth with balanced information'
        };
      } else {
        return {
          layers: '6-8 layers (excluding root)',
          structure: 'Root → Main Topics → Sub Topics → Key Points → Details → Examples → Additional Info (max 6-8 total layers)',
          note: 'Comprehensive depth with detailed information hierarchy'
        };
      }
    };

    const depthConfig = getDepthInstructions(classLevel);

    const prompt = `You are a mind map structure generator. Convert the following summary into a jsMind-compatible JSON structure.

🚨🚨🚨 CRITICAL LANGUAGE REQUIREMENT 🚨🚨🚨
DETECTED SUMMARY LANGUAGE: ${summaryLanguage.toUpperCase()}
ALL NODE TOPICS MUST BE IN: ${summaryLanguage.toUpperCase()}

ABSOLUTE RULES - NO EXCEPTIONS:
✓ Every "topic" field MUST be in ${summaryLanguage}
✓ DO NOT translate to English or any other language
✓ DO NOT mix languages
✓ Preserve the exact script of ${summaryLanguage}

STRUCTURE REQUIREMENTS FOR CLASS ${classLevel}:
- DEPTH: Create ${depthConfig.layers}
- STRUCTURE: ${depthConfig.structure}
- NOTE: ${depthConfig.note}

IMPORTANT:
1. Use concise text for each node (max 50 characters)
2. Generate unique IDs for each node (use format: topic1, subtopic1_1, point1_1_1, etc.)
3. Distribute nodes evenly (alternate between 'left' and 'right' directions for main topics)
4. Set expanded: true for all nodes
5. STRICTLY follow the depth limit of ${depthConfig.layers} for Class ${classLevel}

OUTPUT FORMAT (STRICT JSON):
{
  "meta": {
    "name": "Chapter Mind Map",
    "author": "MindMap Generator",
    "version": "1.0"
  },
  "format": "node_tree",
  "data": {
    "id": "root",
    "topic": "[IN ${summaryLanguage.toUpperCase()}]",
    "expanded": true,
    "children": [
      {
        "id": "topic1",
        "topic": "[IN ${summaryLanguage.toUpperCase()}]",
        "direction": "right",
        "expanded": true,
        "children": [
          {
            "id": "subtopic1_1",
            "topic": "[IN ${summaryLanguage.toUpperCase()}]",
            "expanded": true,
            "children": [
              {
                "id": "point1_1_1",
                "topic": "[IN ${summaryLanguage.toUpperCase()}]",
                "expanded": true
              }
            ]
          }
        ]
      }
    ]
  }
}

SUMMARY DATA:
${summaryJson}

🚨 FINAL REMINDER: All "topic" fields MUST be in ${summaryLanguage.toUpperCase()} ONLY!`;

    try {
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

      const mindMapData: JsMindData = JSON.parse(jsonText);
      console.log("✅ Mind map generated via Gemini");
      return mindMapData;
    } catch (geminiError) {
      console.warn("Gemini mind map generation failed, trying OpenRouter fallback:", geminiError);

      if (!isOpenRouterConfigured()) {
        throw geminiError;
      }

      try {
        const response = await callOpenRouter(prompt);

        // Extract JSON from response
        let jsonText = response.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\n?/g, '');
        }

        const mindMapData: JsMindData = JSON.parse(jsonText);
        console.log("✅ Mind map generated via OpenRouter");
        return mindMapData;
      } catch (fallbackError) {
        console.error("Both Gemini and OpenRouter failed for mind map generation");
        throw new Error(
          `Failed to generate mind map with both APIs. Gemini error: ${geminiError instanceof Error ? geminiError.message : 'Unknown'}. OpenRouter error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown'}`
        );
      }
    }
  } catch (error) {
    console.error("Error generating mind map:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to generate mind map: ${error.message}`
        : "Failed to generate mind map. Please try again."
    );
  }
}

/**
 * Generates both summary and mind map in one call
 */
export async function generateComplete(
  chapterText: string,
  classLevel: ClassLevel,
  chapterName: string
): Promise<{ summary: SummaryStructure; mindMap: JsMindData }> {
  const summary = await generateSummary(chapterText, classLevel, chapterName);
  const mindMap = await generateMindMapData(summary);
  return { summary, mindMap };
}
