/**
 * Row-Level Security (RLS) Helper
 *
 * This module provides utilities to work with RLS policies in Postgres.
 * RLS ensures that clinics can only access their own patients.
 *
 * Note: Assessment table does NOT use RLS because patients access assessments
 * via tokens without logging in. Access control for assessments is handled
 * via token + tokenExpiresAt columns.
 *
 * IMPORTANT: Always call setClinicContext() before any database queries
 * that involve the Patient table.
 */

import type postgres from 'postgres';

/**
 * Set the current clinic context for RLS policies
 *
 * This MUST be called before any queries that access the Patient table.
 *
 * @example
 * ```typescript
 * import { setClinicContext } from '@/lib/db/rls-helper';
 *
 * // In your API route or server action (for clinic staff):
 * const session = await auth();
 * const sql = await getDb();
 *
 * await setClinicContext(sql, session.user.clinicId);
 *
 * // Now Patient queries are automatically filtered by clinic
 * const patients = await db.select().from(patient);
 * // ^ Only returns this clinic's patients
 * ```
 */
export async function setClinicContext(
  sql: postgres.Sql,
  clinicId: string,
): Promise<void> {
  await sql`SET LOCAL app.current_clinic_id = ${clinicId}`;
}

/**
 * Clear the clinic context (optional, useful for cleanup)
 */
export async function clearClinicContext(sql: postgres.Sql): Promise<void> {
  await sql`RESET app.current_clinic_id`;
}

/**
 * Execute a query with clinic context
 *
 * This is a convenience wrapper that automatically sets and clears the context.
 *
 * @example
 * ```typescript
 * const patients = await withClinicContext(sql, clinicId, async () => {
 *   return await db.select().from(patient);
 * });
 * ```
 */
export async function withClinicContext<T>(
  sql: postgres.Sql,
  clinicId: string,
  callback: () => Promise<T>,
): Promise<T> {
  await setClinicContext(sql, clinicId);
  try {
    return await callback();
  } finally {
    await clearClinicContext(sql);
  }
}

/**
 * Usage Notes:
 *
 * 1. WHEN to set clinic context:
 *    ✅ Patient queries (RLS enabled)
 *    ❌ Assessment queries (use token-based access instead)
 *
 * 2. RLS is RESTRICTIVE:
 *    - Even superusers are affected
 *    - Patient queries without context will return ZERO rows
 *
 * 3. Assessment Access Control:
 *    - Patients use tokens to access assessments (no login required)
 *    - Validate access using token + tokenExpiresAt columns
 *    - Clinics filter assessments by userId (their clinicId)
 *
 * 4. Testing RLS:
 *    ```sql
 *    -- In psql, test the policy:
 *    SET app.current_clinic_id = 'your-clinic-uuid';
 *    SELECT * FROM "Patient";  -- Should only show that clinic's patients
 *    ```
 *
 * 5. Migrations and Admin Tasks:
 *    - If you need to bypass RLS for admin tasks:
 *      ALTER TABLE "Patient" DISABLE ROW LEVEL SECURITY;
 *      -- Do admin work
 *      ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
 *
 * 6. Performance:
 *    - RLS policies are enforced at the database level
 *    - Very efficient - no application-level filtering needed
 *    - Postgres can optimize queries with RLS predicates
 */
