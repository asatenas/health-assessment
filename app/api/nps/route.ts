import { type NextRequest, NextResponse } from 'next/server';
import { updateChatNpsById } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, score } = body;

    if (!chatId || typeof chatId !== 'string') {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      );
    }

    if (
      typeof score !== 'number' ||
      score < 0 ||
      score > 10 ||
      !Number.isInteger(score)
    ) {
      return NextResponse.json(
        { error: 'Score must be an integer between 0 and 10' },
        { status: 400 },
      );
    }

    await updateChatNpsById({ chatId, nps: score });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('NPS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
