import { type NextRequest, NextResponse } from 'next/server';
import { validateChatAccess } from '@/lib/api/chat-guard';

export async function POST(request: NextRequest) {
  try {
    const { text, chatId } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 },
      );
    }

    await validateChatAccess(chatId);

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: text,
        voice: 'onyx',
        instructions: `Accent/Affect: Warm, refined, and gently instructive, reminiscent of a friendly art instructor.
Tone: Calm, encouraging, and articulate, clearly describing each step with patience.
Pacing: Slow and deliberate, pausing often to allow the listener to follow instructions comfortably.
Emotion: Cheerful, supportive, and pleasantly enthusiastic; convey genuine enjoyment and appreciation of art.
Pronunciation: Clearly articulate artistic terminology (e.g., "brushstrokes," "landscape," "palette") with gentle emphasis.
Personality Affect: Friendly and approachable with a hint of sophistication; speak confidently and reassuringly, guiding users through each painting step patiently and warmly.
Language: Brazilian Portuguese`,
        response_format: 'mp3',
        speed: 1.15,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI TTS API error:', await response.text());
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: 500 },
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
