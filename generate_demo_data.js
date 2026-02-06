#!/usr/bin/env node
/**
 * Generate SQL INSERTs for:
 *  - public."Assessment" (1860 rows)
 *  - public."Surgery" (one row per Assessment with status === "finished")
 *
 * Rules:
 * - createdAt: evenly distributed over the last 30 days from now
 * - tokenExpiresAt: createdAt + 30 days
 * - clinicId constant, patientId NULL
 * - token format: XXXX-XXXX (A-Z0-9)
 * - form:
 *    - for assessments WITH a surgery (status === "finished"):
 *        includes surgeryName/surgeryDate/surgeryTime
 *        latexAllergy is TRUE for only 8 forms total, otherwise FALSE
 *    - for all other assessments: form = NULL
 *
 * Surgery:
 * - For each assessment with status "finished", create a Surgery row:
 *   - assessmentId = Assessment.id
 *   - date = tokenExpiresAt
 *   - name evenly distributed across SURGERY_NAMES (round-robin)
 *   - the rest can be null (omitted columns)
 *
 * Timestamp format in SQL: YYYY-MM-DD HH:MM:SS.mmm (local time)
 */

const fs = require('node:fs');
const crypto = require('node:crypto');

// ---- Config ----
const OUT_DEFAULT = 'demo_seed.sql';
const CLINIC_ID = '166fd99b-59d3-415f-88d3-ffc3010c49ff';
const TOTAL_ROWS = 1860;
const WINDOW_DAYS = 40;

const FINISHED_STATUS = 'finished';

// Exact integer counts (sum to 1860)
const COUNT_ACTIVE = 155;
const COUNT_INITIALIZED = 155;
const COUNT_IN_PROGRESS = 155;
const COUNT_FINISHED_1 = 948; // scores (1,1)
const COUNT_FINISHED_3 = 279; // scores (3,3)
const COUNT_FINISHED_4 = 140; // scores (4,4)
const COUNT_INCOMPLETE = 28;

const SURGERY_NAMES = [
  'Rinoplastia',
  'Lipoaspiração',
  'Aumento mamário',
  'LASIK',
  'Artroscopia do joelho',
  'Cirurgia de hérnia',
  'Amigdalectomia',
  'Colecistectomia',
  'Blefaroplastia',
  'Vasectomia',
];

// Base ChatForm fields (same for all surgery-linked forms)
// latexAllergy should be FALSE by default; we'll set TRUE for only 8 forms.
const BASE_CHAT_FORM = {
  age: 45,
  weight: 75,
  height: 170,
  latexAllergy: false,
  allergies: [],
  medicalDevices: {},
  aestheticItems: {},
  recreationalDrugs: {},
  hemoglobin: 13.5,
  creatinine: 1.0,
};

const LATEX_TRUE_FORMS = 8;

function assertCounts() {
  const sum =
    COUNT_ACTIVE +
    COUNT_INITIALIZED +
    COUNT_IN_PROGRESS +
    COUNT_FINISHED_1 +
    COUNT_FINISHED_3 +
    COUNT_FINISHED_4 +
    COUNT_INCOMPLETE;

  if (sum !== TOTAL_ROWS)
    throw new Error(`Counts must sum to ${TOTAL_ROWS}, got ${sum}`);
}

// ---- Simple seeded RNG (mulberry32) ----
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeToken(rand) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const pick4 = () =>
    Array.from(
      { length: 4 },
      () => alphabet[Math.floor(rand() * alphabet.length)],
    ).join('');
  return `${pick4()}-${pick4()}`;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}
function pad3(n) {
  return String(n).padStart(3, '0');
}

function formatTimestampLocal(dt) {
  const y = dt.getFullYear();
  const m = pad2(dt.getMonth() + 1);
  const d = pad2(dt.getDate());
  const hh = pad2(dt.getHours());
  const mm = pad2(dt.getMinutes());
  const ss = pad2(dt.getSeconds());
  const ms = pad3(dt.getMilliseconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}.${ms}`;
}

function formatDateOnly(dt) {
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
}

function formatTimeOnly(dt) {
  return `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
}

function sqlEscapeString(s) {
  return String(s).replace(/'/g, "''");
}

function buildSpecs() {
  const specs = [];
  const pushMany = (status, score_rcri, score_aub_has2, count) => {
    for (let i = 0; i < count; i++)
      specs.push({ status, score_rcri, score_aub_has2 });
  };

  pushMany('active', null, null, COUNT_ACTIVE);
  pushMany('initialized', null, null, COUNT_INITIALIZED);
  pushMany('in_progress', null, null, COUNT_IN_PROGRESS);

  pushMany(FINISHED_STATUS, 1, 1, COUNT_FINISHED_1);
  pushMany(FINISHED_STATUS, 3, 3, COUNT_FINISHED_3);
  pushMany(FINISHED_STATUS, 4, 4, COUNT_FINISHED_4);

  pushMany('incomplete', null, null, COUNT_INCOMPLETE);

  if (specs.length !== TOTAL_ROWS) {
    throw new Error(
      `Spec count mismatch: got ${specs.length}, expected ${TOTAL_ROWS}`,
    );
  }
  return specs;
}

function buildEvenlySpacedTimestamps(n, windowDays, now) {
  const startMs = now.getTime() - windowDays * 24 * 60 * 60 * 1000;
  const totalMs = windowDays * 24 * 60 * 60 * 1000;
  const step = totalMs / n;

  const stamps = [];
  for (let i = 0; i < n; i++) stamps.push(new Date(startMs + step * i));
  return stamps;
}

function parseArgs(argv) {
  const out = { outPath: OUT_DEFAULT, seed: 1337 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out' && argv[i + 1]) out.outPath = argv[++i];
    else if (a === '--seed' && argv[i + 1]) {
      out.seed = Number(argv[++i]);
      if (!Number.isFinite(out.seed))
        throw new Error('--seed must be a number');
    }
  }
  return out;
}

function main() {
  assertCounts();

  const { outPath, seed } = parseArgs(process.argv);
  const rand = mulberry32(seed);

  const now = new Date();
  const specs = buildSpecs();
  shuffleInPlace(specs, rand);

  const createdAts = buildEvenlySpacedTimestamps(TOTAL_ROWS, WINDOW_DAYS, now);

  const assessmentRows = [];
  const surgeryRows = [];

  let surgeryNameIdx = 0;
  let latexTrueUsed = 0;

  for (let i = 0; i < TOTAL_ROWS; i++) {
    const spec = specs[i];

    const id = crypto.randomUUID();
    const createdAt = createdAts[i];
    const tokenExpiresAt = new Date(
      createdAt.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    const token = makeToken(rand);

    const createdSql = formatTimestampLocal(createdAt);
    const expiresSql = formatTimestampLocal(tokenExpiresAt);

    const rcriSql = spec.score_rcri == null ? 'NULL' : String(spec.score_rcri);
    const aubSql =
      spec.score_aub_has2 == null ? 'NULL' : String(spec.score_aub_has2);

    let formSql = 'NULL';

    if (spec.status === FINISHED_STATUS) {
      const surgeryName = SURGERY_NAMES[surgeryNameIdx % SURGERY_NAMES.length];
      surgeryNameIdx++;

      surgeryRows.push({
        assessmentId: id,
        name: surgeryName,
        dateSql: expiresSql,
      });

      const latexAllergy = i > 1000 && latexTrueUsed < LATEX_TRUE_FORMS;
      if (latexAllergy) latexTrueUsed++;

      const form = {
        ...BASE_CHAT_FORM,
        latexAllergy, // true for only 8 finished forms; otherwise false
        surgeryName,
        surgeryDate: formatDateOnly(tokenExpiresAt),
        surgeryTime: formatTimeOnly(tokenExpiresAt),
      };

      formSql = `'${sqlEscapeString(JSON.stringify(form))}'::jsonb`;
    }

    assessmentRows.push({
      id,
      createdSql,
      expiresSql,
      token,
      status: spec.status,
      rcriSql,
      aubSql,
      formSql,
    });
  }

  const lines = [];

  lines.push(
    `-- Generated demo data for public."Assessment" + public."Surgery"`,
  );
  lines.push(
    `-- rows=${TOTAL_ROWS}, window_days=${WINDOW_DAYS}, surgery_for_status=${FINISHED_STATUS}`,
  );
  lines.push(`-- surgeries_generated=${surgeryRows.length}`);
  lines.push(`-- latexAllergy_true_forms=${latexTrueUsed}`);
  lines.push(`-- generated_at_local=${now.toString()}`);

  lines.push(`
DELETE FROM "Stream"
WHERE "assessmentId" IN (
  SELECT "id"
  FROM "Assessment"
  WHERE "clinicId" = '${CLINIC_ID}'
);
`);

  lines.push(`
DELETE FROM "Message_v2"
WHERE "assessmentId" IN (
  SELECT "id"
  FROM "Assessment"
  WHERE "clinicId" = '${CLINIC_ID}'
);
`);

  lines.push(`DELETE FROM "Assessment" WHERE "clinicId" = '${CLINIC_ID}';`);

  lines.push('');

  lines.push(
    `INSERT INTO public."Assessment" ("id","createdAt","clinicId","patientId","token","status","tokenExpiresAt","score_rcri","score_aub_has2","form")`,
  );
  lines.push('VALUES');

  const assessmentValues = assessmentRows.map((r) => {
    return `  ('${r.id}'::uuid, TIMESTAMP '${r.createdSql}', '${CLINIC_ID}'::uuid, NULL::uuid, '${r.token}', '${r.status}', TIMESTAMP '${r.expiresSql}', ${r.rcriSql}, ${r.aubSql}, ${r.formSql})`;
  });

  lines.push(`${assessmentValues.join(',\n')};`);
  lines.push('');

  if (surgeryRows.length > 0) {
    lines.push(`INSERT INTO public."Surgery" ("assessmentId","name","date")`);
    lines.push('VALUES');

    const surgeryValues = surgeryRows.map((s) => {
      return `  ('${s.assessmentId}'::uuid, '${sqlEscapeString(s.name)}', TIMESTAMP '${s.dateSql}')`;
    });

    lines.push(`${surgeryValues.join(',\n')};`);
    lines.push('');
  }

  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(
    `Wrote ${TOTAL_ROWS} Assessment rows and ${surgeryRows.length} Surgery rows to ${outPath}`,
  );
}

main();
