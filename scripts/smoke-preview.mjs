#!/usr/bin/env node
/**
 * Run the smoke test against the Vercel preview deployment of a branch.
 *
 *   pnpm test:smoke:preview [playwright args, e.g. --headed]
 *
 * Branch: SMOKE_BRANCH, or the current git branch.
 * Uses the newest READY deployment whose git ref matches that branch
 * (needs the Vercel CLI, logged in, and this repo linked with `vercel link`).
 * If SMOKE_BASE_URL is already set, it is used as-is.
 */
import { execFileSync, spawnSync } from 'node:child_process';

const run = (cmd, args) =>
  execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

function resolvePreviewUrl() {
  const branch =
    process.env.SMOKE_BRANCH ||
    run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const head = run('git', ['rev-parse', 'HEAD']);

  let listing;
  try {
    listing = JSON.parse(
      run('vercel', [
        'ls',
        '--format',
        'json',
        '-m',
        `githubCommitRef=${branch}`,
      ]),
    );
  } catch (error) {
    console.error(
      'Could not list Vercel deployments. Is the Vercel CLI installed, logged in and linked (`vercel link`)?',
    );
    console.error(error.stderr?.toString() || error.message);
    process.exit(1);
  }

  const ready = (listing.deployments ?? [])
    .filter((d) => d.state === 'READY')
    .sort((a, b) => b.createdAt - a.createdAt);

  if (ready.length === 0) {
    console.error(
      `No READY Vercel deployment found for branch "${branch}". Push the branch or run \`vercel deploy\` first.`,
    );
    process.exit(1);
  }

  const latest = ready[0];
  const sha = latest.meta?.githubCommitSha;
  if (sha && sha !== head) {
    console.warn(
      `Warning: newest deployment is commit ${sha.slice(0, 7)}, but HEAD is ${head.slice(0, 7)}.`,
    );
  }

  const url = `https://${latest.url}`;
  console.log(`Smoke testing branch "${branch}" at ${url}`);
  return url;
}

const baseUrl = process.env.SMOKE_BASE_URL || resolvePreviewUrl();

const result = spawnSync(
  'playwright',
  ['test', '--project=smoke', ...process.argv.slice(2)],
  { stdio: 'inherit', env: { ...process.env, SMOKE_BASE_URL: baseUrl } },
);
process.exit(result.status ?? 1);
