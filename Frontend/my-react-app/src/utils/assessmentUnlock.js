/** Minimum percentage score on a quiz tier to unlock the next level. */
export const BEGINNER_PASS_PERCENTAGE = 60;
export const INTERMEDIATE_PASS_PERCENTAGE = 60;
export const ADVANCED_PASS_PERCENTAGE = 60;
export const MIN_PASS_PERCENTAGE = 60; // Keeping for backward compatibility if needed

/** Remembers which category tab to show after "Back to Assessment" (must match server category string). */
export const LAST_ASSESSMENT_CATEGORY_KEY = 'skillAssessment_lastCategory';

export function rememberLastAssessmentCategory(category) {
  if (!category) return;
  try {
    localStorage.setItem(LAST_ASSESSMENT_CATEGORY_KEY, category);
  } catch {
    /* ignore */
  }
}

export function getLastAssessmentCategory() {
  try {
    return localStorage.getItem(LAST_ASSESSMENT_CATEGORY_KEY);
  } catch {
    return null;
  }
}

const PREFIX = 'skillAssessmentPass:v1';

export function passStorageKey(username, category, tier) {
  return `${PREFIX}:${encodeURIComponent(username)}:${encodeURIComponent(category)}:${tier}`;
}

/** Call after a successful quiz result save when the user meets the unlock threshold. */
export function rememberTierPassed(username, category, tier) {
  if (!username) return;
  try {
    localStorage.setItem(passStorageKey(username, category, tier), '1');
  } catch {
    /* ignore quota / private mode */
  }
}

export function hasRememberedTierPassed(username, category, tier) {
  if (!username) return false;
  try {
    return localStorage.getItem(passStorageKey(username, category, tier)) === '1';
  } catch {
    return false;
  }
}

/**
 * Combines API `highestLevelPassed` with remembered unlocks so the UI stays in sync after refresh.
 */
export function effectiveHighestRank(username, category, apiHighestPassed) {
  const tiers = ['none', 'beginner', 'intermediate', 'advanced'];
  let api = (apiHighestPassed ?? 'none').toString().toLowerCase();
  
  let idx = tiers.indexOf(api);
  if (idx === -1) idx = 0;

  // Local storage should only "upgrade" if the chain is valid
  // Beginner unlocks if passed
  if (hasRememberedTierPassed(username, category, 'beginner')) {
    idx = Math.max(idx, 1);
  }
  
  // Intermediate only unlocks if Beginner is already passed AND Intermediate is passed
  if (idx >= 1 && hasRememberedTierPassed(username, category, 'intermediate')) {
    idx = Math.max(idx, 2);
  }
  
  // Advanced only unlocks if Intermediate is already passed AND Advanced is passed
  if (idx >= 2 && hasRememberedTierPassed(username, category, 'advanced')) {
    idx = Math.max(idx, 3);
  }
  
  return tiers[idx];
}
