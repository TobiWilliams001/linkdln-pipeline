export type ContentTypeName =
  | "INSIGHT"
  | "STORY"
  | "PROCESS"
  | "OPINION"
  | "RESULT"
  | "OBSERVATION";

const TYPE_WEIGHTS: Record<ContentTypeName, number> = {
  OBSERVATION: 1.5,
  INSIGHT: 1.2,
  OPINION: 1.1,
  STORY: 1.0,
  PROCESS: 1.0,
  RESULT: 0.6,
};

// Fixed order used only to break exact ties deterministically.
const TYPE_ORDER: ContentTypeName[] = [
  "OBSERVATION",
  "INSIGHT",
  "OPINION",
  "STORY",
  "PROCESS",
  "RESULT",
];

function weekIndex(year: number, weekNumber: number): number {
  return year * 53 + weekNumber;
}

export interface PastPost {
  contentType: ContentTypeName;
  year: number;
  weekNumber: number;
}

/**
 * Picks `cadence` content types for the next batch, favoring types that
 * haven't been used recently (weighted by how important each type is to
 * post regularly). Deterministic given the same inputs.
 */
export function contentMix(
  cadence: number,
  recentPosts: PastPost[],
  targetWeek: { year: number; weekNumber: number },
): ContentTypeName[] {
  const targetIndex = weekIndex(targetWeek.year, targetWeek.weekNumber);

  const lastUsedIndex: Partial<Record<ContentTypeName, number>> = {};
  for (const post of recentPosts) {
    const idx = weekIndex(post.year, post.weekNumber);
    const existing = lastUsedIndex[post.contentType];
    if (existing === undefined || idx > existing) {
      lastUsedIndex[post.contentType] = idx;
    }
  }

  const working = { ...lastUsedIndex };
  const result: ContentTypeName[] = [];

  for (let i = 0; i < cadence; i++) {
    let best: ContentTypeName = TYPE_ORDER[0];
    let bestScore = -Infinity;

    for (const type of TYPE_ORDER) {
      const last = working[type];
      const sinceLastUsed = last === undefined ? targetIndex + 10 : targetIndex - last;
      const score = TYPE_WEIGHTS[type] * sinceLastUsed;
      if (score > bestScore) {
        bestScore = score;
        best = type;
      }
    }

    result.push(best);
    working[best] = targetIndex;
  }

  return result;
}
