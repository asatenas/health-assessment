export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

/**
 * Calculate risk level from RCRI and HAS2 scores.
 *
 * A score of null, -1 or NaN means "not available". Returns 'unknown' only
 * when both scores are unavailable; otherwise uses the higher available
 * score: 0–1 low, 2–3 medium, 4+ high.
 */
export function calculateRiskLevel(
  rcri: number | null,
  has2: number | null,
): RiskLevel {
  const validRcri = isAvailable(rcri) ? rcri : null;
  const validHas2 = isAvailable(has2) ? has2 : null;

  if (validRcri === null && validHas2 === null) return 'unknown';

  const maxScore = Math.max(
    validRcri ?? Number.NEGATIVE_INFINITY,
    validHas2 ?? Number.NEGATIVE_INFINITY,
  );

  if (maxScore <= 1) return 'low';
  if (maxScore <= 3) return 'medium';
  return 'high';
}

function isAvailable(score: number | null): score is number {
  return score != null && score !== -1 && !Number.isNaN(score);
}
