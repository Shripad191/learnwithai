/**
 * OpenRouter API client for fallback when Gemini API fails
 */

/**
 * Call OpenRouter API with a prompt
 * @param prompt - The prompt to send to the model
 * @param model - The model to use (default: google/gemini-2.0-flash-exp:free)
 * @returns The generated text response
 */
export async function callOpenRouter(
    prompt: string,
    model: string = 'google/gemini-2.0-flash-exp:free'
): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OpenRouter API key not found. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to your .env.local file');
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
                'X-Title': 'SeekhoWithAI',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response format from OpenRouter API');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenRouter API call failed:', error);
        throw error;
    }
}

/**
 * Check if OpenRouter API key is configured
 */
export function isOpenRouterConfigured(): boolean {
    return !!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
}
