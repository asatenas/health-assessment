import {
  getClinicConfigByClinicId,
  updateClinicConfig,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';
import type {
  FormConfiguration,
  DashboardConfiguration,
} from '@/lib/types/clinic-config';
import { DEFAULT_DASHBOARD_CONFIG } from '@/lib/config/default-dashboard-config';
import { type NextRequest, NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { getPermissionsForRole } from '@/lib/permissions';

export async function GET() {
  try {
    const user = await validateClinicAccess();

    const config = await getClinicConfigByClinicId({
      clinicId: user.clinicId,
    });

    if (!config) {
      return new ChatSDKError(
        'not_found:api',
        'Configuration not found',
      ).toResponse();
    }

    const permissions = getPermissionsForRole(user.role);
    const canManageOrg = permissions.includes('org.manage');
    const clinicName = config.clinicName || 'Painel da Clínica';

    // Users without org.manage permission only get clinic name
    if (!canManageOrg) {
      return NextResponse.json({
        clinicName,
      });
    }

    return NextResponse.json({
      clinicName,
      formConfig: config.formConfig,
      dashboardConfig: config.dashboardConfig || DEFAULT_DASHBOARD_CONFIG,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching clinic config:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to fetch clinic configuration',
    ).toResponse();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await validateClinicAccess(undefined, {
      permissions: ['org.manage'],
    });

    const body = await request.json();
    const { clinicName, formConfig, dashboardConfig } = body;

    // Validate formConfig structure if provided
    if (formConfig && !isValidFormConfig(formConfig)) {
      return new ChatSDKError(
        'bad_request:api',
        'Invalid form configuration structure',
      ).toResponse();
    }

    // Validate dashboardConfig structure if provided
    if (dashboardConfig && !isValidDashboardConfig(dashboardConfig)) {
      return new ChatSDKError(
        'bad_request:api',
        'Invalid dashboard configuration structure',
      ).toResponse();
    }

    const updated = await updateClinicConfig({
      clinicId: user.clinicId,
      clinicName,
      formConfig,
      dashboardConfig,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
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

// Dashboard config validation helper
function isValidDashboardConfig(config: any): config is DashboardConfiguration {
  if (!config.widgets || typeof config.widgets !== 'object') return false;

  const requiredWidgets = [
    'metricsOverview',
    'riskDistribution',
    'timeline',
    'cancellations',
    'todaysSurgeries',
    'weeklySurgeries',
    'monthlySurgeries',
    'notifications',
  ];

  // Check that all required widgets exist and have proper structure
  return requiredWidgets.every(
    (widget) =>
      config.widgets[widget] &&
      typeof config.widgets[widget].enabled === 'boolean',
  );
}
