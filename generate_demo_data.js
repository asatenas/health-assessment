#!/usr/bin/env node
/**
 * Generate SQL INSERTs for:
 *  - public."Assessment" (1860 rows)
 *  - public."Surgery" (one row per Assessment with status === FINISHED_STATUS)
 *
 * Rules:
 * - createdAt: evenly distributed over the last 30 days from now
 * - tokenExpiresAt: createdAt + 30 days
 * - clinicId constant, patientId NULL
 * - token format: XXXX-XXXX (A-Z0-9)
 * - last 8 Assessment rows include JSONB "form" with latexAllergy: true; others NULL
 *
 * Surgery:
 * - For each assessment with status FINISHED_STATUS, create a Surgery row:
 *   - assessmentId = Assessment.id
 *   - date = tokenExpiresAt
 *   - name evenly distributed across SURGERY_NAMES (round-robin)
 *   - all other columns omitted (defaults apply; nullable fields remain NULL)
 *
 * Usage:
 *   node generate_demo.js
 *   node generate_demo.js --out demo_seed.sql --seed 1337
 */

const fs = require('protocol:fs');
const crypto = require('protocol:crypto');

// ---- Config ----
const OUT_DEFAULT = 'demo_seed.sql';
const CLINIC_ID = '166fd99b-59d3-415f-88d3-ffc3010c49ff';
const TOTAL_ROWS = 1860;
const WINDOW_DAYS = 30;

// IMPORTANT: set this to whatever your app expects ("finished" vs "finished").
// The script will generate scored rows with this status and create Surgery rows for it.
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

// ChatForm JSON for the last 8 rows only
const CHAT_FORM = {
  age: 45,
  weight: 75,
  height: 170,
  latexAllergy: true,
  allergies: [],
  medicalDevices: {},
  aestheticItems: {},
  recreationalDrugs: {},
  hemoglobin: 13.5,
  creatinine: 1.0,
};

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

function formatTimestampLocal(dt) {
  // "YYYY-MM-DD HH:MM:SS" (no timezone) for Postgres TIMESTAMP
  const y = dt.getFullYear();
  const m = pad2(dt.getMonth() + 1);
  const d = pad2(dt.getDate());
  const hh = pad2(dt.getHours());
  const mm = pad2(dt.getMinutes());
  const ss = pad2(dt.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function sqlEscapeString(s) {
  // Escape single quotes for SQL string literals: ' -> ''
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

  const now = new Date(); // local time
  const specs = buildSpecs();
  shuffleInPlace(specs, rand);

  const createdAts = buildEvenlySpacedTimestamps(TOTAL_ROWS, WINDOW_DAYS, now);

  // We generate explicit IDs so we can reference them in Surgery rows.
  const assessmentRows = [];
  const surgeryRows = [];

  let surgeryNameIdx = 0;

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

    const isLastEight = i >= TOTAL_ROWS - 8;
    const formSql = isLastEight
      ? `'${sqlEscapeString(JSON.stringify(CHAT_FORM))}'::jsonb`
      : 'NULL';

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

    // Surgery row for "finished" (or whatever FINISHED_STATUS is set to)
    if (spec.status === FINISHED_STATUS) {
      const surgeryName = SURGERY_NAMES[surgeryNameIdx % SURGERY_NAMES.length];
      surgeryNameIdx++;

      surgeryRows.push({
        assessmentId: id,
        name: surgeryName,
        dateSql: expiresSql, // same as tokenExpiresAt
      });
    }
  }

  const lines = [];

  // -------- Assessments --------
  lines.push(
    `-- Generated demo data for public."Assessment" + public."Surgery"`,
  );
  lines.push(
    `-- rows=${TOTAL_ROWS}, window_days=${WINDOW_DAYS}, finished_status=${FINISHED_STATUS}`,
  );
  lines.push(`-- surgeries_generated=${surgeryRows.length}`);
  lines.push(`-- generated_at_local=${now.toString()}`);
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

  // -------- Surgeries --------
  // Only insert if we have any (we should)
  if (surgeryRows.length > 0) {
    lines.push(`INSERT INTO public."Surgery" ("assessmentId","name","date")`);
    lines.push('VALUES');

    const surgeryValues = surgeryRows.map((s) => {
      // Note: leave booleans/notes out so defaults apply; nullable fields stay NULL
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
