import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { ChatSDKError } from '@/lib/shared/errors';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      throw new ChatSDKError('unauthorized:api', 'Not authenticated');
    }

    if (!session.impersonation) {
      return NextResponse.json(
        { error: 'Not currently impersonating' },
        { status: 400 },
      );
    }

    // Clear impersonation from session
    // The client will call update() with impersonation: null

    return NextResponse.json({
      success: true,
      message: 'Impersonation ended successfully',
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error ending impersonation:', error);
    return NextResponse.json(
      { error: 'Failed to end impersonation' },
      { status: 500 },
    );
  }
}
