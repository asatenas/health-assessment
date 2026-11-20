import { describe, expect, it } from 'vitest';

import { calculateRiskLevel, type RiskLevel } from '@/lib/scoring/risk-level';

type Case = [
  name: string,
  rcri: number | null,
  has2: number | null,
  expected: RiskLevel,
];

const cases: Case[] = [
  // 1 vs 2: low/medium boundary
  ['rcri 1 is low', 1, 0, 'low'],
  ['rcri 2 is medium', 2, 0, 'medium'],
  ['has2 1 is low', 0, 1, 'low'],
  ['has2 2 is medium', 0, 2, 'medium'],

  // 3 vs 4: medium/high boundary
  ['rcri 3 is medium', 3, 0, 'medium'],
  ['rcri 4 is high', 4, 0, 'high'],
  ['has2 3 is medium', 0, 3, 'medium'],
  ['has2 4 is high', 0, 4, 'high'],

  // higher score wins
  ['both zero is low', 0, 0, 'low'],
  ['higher has2 wins', 1, 4, 'high'],
  ['higher rcri wins', 4, 1, 'high'],

  // -1 means not available
  ['rcri -1 uses has2', -1, 2, 'medium'],
  ['has2 -1 uses rcri', 2, -1, 'medium'],

  // one score missing (null)
  ['rcri null uses has2', null, 4, 'high'],
  ['has2 null uses rcri', 4, null, 'high'],
  ['rcri null, has2 low', null, 1, 'low'],

  // NaN means not available (previously fell through to 'high')
  ['rcri NaN uses has2', Number.NaN, 2, 'medium'],
  ['has2 NaN uses rcri', 3, Number.NaN, 'medium'],

  // both missing
  ['both null', null, null, 'unknown'],
  ['both -1', -1, -1, 'unknown'],
  ['null and -1', null, -1, 'unknown'],
  ['-1 and null', -1, null, 'unknown'],
  ['both NaN', Number.NaN, Number.NaN, 'unknown'],
  ['NaN and null', Number.NaN, null, 'unknown'],
  ['-1 and NaN', -1, Number.NaN, 'unknown'],
];

describe('calculateRiskLevel', () => {
  it.each(cases)(
    '%s (rcri=%s, has2=%s) -> %s',
    (_name, rcri, has2, expected) => {
      expect(calculateRiskLevel(rcri, has2)).toBe(expected);
    },
  );
});
