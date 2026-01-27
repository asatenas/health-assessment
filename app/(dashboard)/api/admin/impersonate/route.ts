import { getUserForImpersonation } from '@/lib/db/queries';
import { type NextRequest, NextResponse } from 'next/server';
import { validatePlatformAdmin } from '@/lib/api/admin-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: NextRequest) {
  try {
    const adminUser = await validatePlatformAdmin();
    const session = await auth();

    if (!session) {
      throw new ChatSDKError('unauthorized:api', 'Not authenticated');
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'targetUserId is required' },
        { status: 400 },
      );
    }

    // Validate target user is active
    const targetUser = await getUserForImpersonation({ userId: targetUserId });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found or not active' },
        { status: 404 },
      );
    }

    // Trigger session update
    // Note: The actual session update will be handled by the client calling update()
    // We return the impersonation data so the client can update the session
    // The JWT callback will construct the full impersonation object with original user data
    return NextResponse.json({
      success: true,
      impersonation: {
        user: {
          id: targetUser.id,
          email: targetUser.email,
          role: targetUser.role,
        },
        clinic: {
          id: targetUser.clinicId,
          name: targetUser.clinicName || '',
        },
        startedAt: new Date().toISOString(),
      },
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        clinicId: targetUser.clinicId,
        clinicName: targetUser.clinicName,
        role: targetUser.role,
      },
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error starting impersonation:', error);
    return NextResponse.json(
      { error: 'Failed to start impersonation' },
      { status: 500 },
    );
  }
}
