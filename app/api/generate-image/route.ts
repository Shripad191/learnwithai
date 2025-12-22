import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { prompt, slideNumber, presentationId } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Image prompt is required' },
                { status: 400 }
            );
        }

        console.log(`🎨 Generating image for slide ${slideNumber}:`, prompt);

        // For now, use a free image generation service
        // You can replace this with your preferred AI image generation API:
        // - Stability AI (Stable Diffusion)
        // - OpenAI DALL-E
        // - Replicate
        // - etc.

        // Using Pollinations.ai - a free AI image generation service
        // Each slide gets a unique image based on its specific prompt
        const imagePrompt = encodeURIComponent(prompt);

        // Add timestamp and slide number to ensure uniqueness
        const uniqueId = `${Date.now()}-${slideNumber}-${Math.random().toString(36).substring(7)}`;
        const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=800&height=600&nologo=true&enhance=true&model=flux&seed=${uniqueId}`;

        console.log(`✅ Generated unique image URL for slide ${slideNumber}`);

        return NextResponse.json({
            success: true,
            imageUrl: imageUrl,
            slideNumber: slideNumber
        });

    } catch (error) {
        console.error('Error generating image:', error);
        return NextResponse.json(
            { error: 'Failed to generate image' },
            { status: 500 }
        );
    }
}
