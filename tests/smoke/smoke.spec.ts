import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Smoke test for a running deployment (or local dev server).
 *
 * Env (keep real values in .env.local, never commit them):
 *   SMOKE_BASE_URL              target URL; when unset, the local dev server is used
 *   SMOKE_CLINIC_EMAIL          clinic staff login (needs full read access to see risk)
 *   SMOKE_CLINIC_PASSWORD
 *   SMOKE_VERCEL_BYPASS_SECRET  optional, for Vercel-protected preview deployments
 *
 * Creates a real assessment named "SMOKE TEST <timestamp>" on each run.
 */

const REQUIRED_ENV = ['SMOKE_CLINIC_EMAIL', 'SMOKE_CLINIC_PASSWORD'] as const;

const PATIENT = { idade: '45', peso: '70', altura: '1,75' };
const PATIENT_MESSAGE = 'Olá, estou pronto para começar a avaliação.';
const ASSISTANT_REPLY_TIMEOUT = 60_000;

// The new assessment only has the pre-chat form and one message, so no score
// is computed yet (scores come from finalize-interview): the dashboard shows '-'.
const NEW_ASSESSMENT_RISK = '-';

/** Risk cell of an assessment row on the "Lista de Avaliações" view. */
async function riskCellFor(page: Page, row: Locator): Promise<Locator> {
  // textContent, not innerText: the headers are CSS-uppercased.
  const headers = await page.locator('thead th').allTextContents();
  const riskColumn = headers.findIndex(
    (h) => h.trim().toLowerCase() === 'risco',
  );
  expect(riskColumn, 'Risco column (needs full read access)').toBeGreaterThan(
    -1,
  );
  return row.locator('td').nth(riskColumn);
}

test.describe('smoke', () => {
  test('clinic creates an assessment and a patient chats', async ({
    browser,
  }) => {
    // Missing configuration must fail the run, not skip it (a skip reports green).
    const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
    if (missing.length > 0) {
      throw new Error(`Smoke test config missing: ${missing.join(', ')}`);
    }
    const email = process.env.SMOKE_CLINIC_EMAIL as string;
    const password = process.env.SMOKE_CLINIC_PASSWORD as string;

    // Separate contexts so the patient is not logged in as the clinic.
    const clinicContext = await browser.newContext();
    const patientContext = await browser.newContext();
    const clinic = await clinicContext.newPage();
    const patient = await patientContext.newPage();

    let assessmentId = '';
    let token = '';

    await test.step('1. clinic logs in and the dashboard loads', async () => {
      await clinic.goto('/login');
      await clinic.locator('#email').fill(email);
      await clinic.locator('#password').fill(password);
      await clinic.getByRole('button', { name: 'Entrar' }).click();
      await clinic.waitForURL('**/dashboard');
      await expect(
        clinic.getByRole('button', { name: 'Criar nova avaliação' }),
      ).toBeVisible();
    });

    await test.step('2. create an assessment and read its link', async () => {
      await clinic
        .getByRole('button', { name: 'Criar nova avaliação' })
        .click();
      const dialog = clinic.getByRole('dialog');
      await dialog
        .locator('#create-surgery-name')
        .fill(`SMOKE TEST ${new Date().toISOString()}`);
      await dialog.getByRole('button', { name: 'Criar Avaliação' }).click();

      await expect(clinic.getByText('Nova avaliação criada')).toBeVisible();
      const valueFor = (label: string) =>
        clinic.getByText(label, { exact: true }).locator('..').locator('code');

      assessmentId = (await valueFor('ID da avaliação').innerText()).trim();
      token = (await valueFor('Token').innerText()).trim();
      const patientUrl = (await valueFor('URL do paciente').innerText()).trim();

      expect(assessmentId).not.toBe('');
      expect(token).not.toBe('');
      expect(patientUrl).toContain(`/chat/${assessmentId}`);
    });

    await test.step('3. patient opens the link and submits the pre-chat form', async () => {
      // The displayed URL uses the server's APP_URL, which can point to a
      // different domain than the one under test, so open it on baseURL.
      await patient.goto(`/chat/${assessmentId}`);

      await patient.getByPlaceholder('Insira o token').fill(token);
      await patient.getByRole('button', { name: 'Acessar' }).click();

      await patient.locator('#terms-consent').click();
      await patient.getByRole('button', { name: 'Aceitar' }).click();

      await patient.getByRole('button', { name: 'Começar' }).click();
      await patient.locator('#idade').fill(PATIENT.idade);
      await patient.locator('#peso').fill(PATIENT.peso);
      await patient.locator('#altura').fill(PATIENT.altura);

      // Optional steps vary with the clinic's form config: continue until
      // the form closes.
      const continueButton = patient.getByRole('button', { name: 'Continuar' });
      for (let i = 0; i < 20 && (await continueButton.isVisible()); i++) {
        await continueButton.click();
      }
      await expect(continueButton).toBeHidden();
    });

    await test.step('4. send one message and get an assistant reply', async () => {
      const assistantMessages = patient.getByTestId('message-assistant');

      // Submitting the form sends the patient info as the first message.
      await expect(assistantMessages.first()).toHaveText(/\S/, {
        timeout: ASSISTANT_REPLY_TIMEOUT,
      });
      await expect(patient.getByTestId('stop-button')).toBeHidden({
        timeout: ASSISTANT_REPLY_TIMEOUT,
      });
      const repliesBefore = await assistantMessages.count();

      const input = patient.getByTestId('multimodal-input');
      await input.fill(PATIENT_MESSAGE);
      await input.press('Enter');

      await expect(assistantMessages).toHaveCount(repliesBefore + 1, {
        timeout: ASSISTANT_REPLY_TIMEOUT,
      });
      await expect(assistantMessages.last()).toHaveText(/\S/, {
        timeout: ASSISTANT_REPLY_TIMEOUT,
      });
    });

    await test.step('5. dashboard shows the new assessment without a score', async () => {
      await clinic.reload();
      await clinic.getByRole('button', { name: 'Lista de Avaliações' }).click();

      // Newest first, so the new assessment is on the first page.
      const row = clinic.locator('tbody tr', { hasText: assessmentId });
      await expect(row).toBeVisible();
      await expect(await riskCellFor(clinic, row)).toHaveText(
        NEW_ASSESSMENT_RISK,
      );
    });

    await clinicContext.close();
    await patientContext.close();
  });
});
