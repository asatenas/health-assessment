import { auth } from '@/app/(auth)/auth';
import {
  getClinicConfigByClinicId,
  getUserById,
  updateClinicConfig,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';
import type { FormConfiguration } from '@/lib/types/clinic-config';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new ChatSDKError('unauthorized:api').toResponse();
  }

  const user = await getUserById({ id: session.user.id });

  if (!user?.emailVerified) {
    return new ChatSDKError('unauthorized:api').toResponse();
  }

  try {
    const config = await getClinicConfigByClinicId({
      clinicId: session.user.id,
    });

    if (!config) {
      return new ChatSDKError(
        'not_found:api',
        'Configuration not found',
      ).toResponse();
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching clinic config:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to fetch clinic configuration',
    ).toResponse();
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new ChatSDKError('unauthorized:api').toResponse();
  }

  const user = await getUserById({ id: session.user.id });

  if (!user?.emailVerified) {
    return new ChatSDKError('unauthorized:api').toResponse();
  }

  try {
    const body = await request.json();
    const { clinicName, formConfig } = body;

    // Validate formConfig structure if provided
    if (formConfig && !isValidFormConfig(formConfig)) {
      return new ChatSDKError(
        'bad_request:api',
        'Invalid form configuration structure',
      ).toResponse();
    }

    const updated = await updateClinicConfig({
      clinicId: session.user.id,
      clinicName,
      formConfig,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating clinic config:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to update clinic configuration',
    ).toResponse();
  }
}

// Required sections that must be enabled
const REQUIRED_SECTIONS = new Set(['basicInfo']);

// Required fields within sections that must be enabled
const REQUIRED_FIELDS: Record<string, Set<string>> = {
  basicInfo: new Set(['idade', 'peso', 'altura']),
};

// Validation helper
function isValidFormConfig(config: any): config is FormConfiguration {
  if (!config.version || !config.sections) return false;

  const requiredSections = [
    'basicInfo',
    'healthProblems',
    'allergies',
    'medicalDevices',
    'aestheticItems',
    'habitsAndVices',
    'exams',
  ];

  // Check that all required sections exist and have proper structure
  const hasValidStructure = requiredSections.every(
    (section) =>
      config.sections[section] &&
      typeof config.sections[section].enabled === 'boolean' &&
      config.sections[section].fields &&
      typeof config.sections[section].fields === 'object',
  );

  if (!hasValidStructure) return false;

  // Ensure required sections are enabled
  for (const sectionKey of REQUIRED_SECTIONS) {
    if (!config.sections[sectionKey]?.enabled) {
      return false;
    }
  }

  // Ensure required fields within sections are enabled
  for (const [sectionKey, requiredFieldSet] of Object.entries(
    REQUIRED_FIELDS,
  )) {
    const section = config.sections[sectionKey];
    if (!section) continue;

    for (const fieldKey of requiredFieldSet) {
      if (!section.fields[fieldKey]?.enabled) {
        return false;
      }
    }
  }

  return true;
}
