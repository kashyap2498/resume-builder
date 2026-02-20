// =============================================================================
// Resume Builder - Entry Warnings (per-entry actionable warnings)
// =============================================================================

import type { ExperienceEntry } from '@/types/resume';

export type WarningLevel = 'info' | 'warning' | 'suggestion';

export interface EntryWarning {
  id: string;
  level: WarningLevel;
  message: string;
  /** If provided, the warning has a one-click action */
  action?: {
    label: string;
    type: 'split' | 'swap' | 'promote_bullet' | 'custom';
    payload?: unknown;
  };
}

const COMPANY_INDICATORS = /\b(?:Inc\.?|LLC|Corp(?:oration)?\.?|Ltd\.?|Limited|Technologies|Solutions|Systems|Group|Associates|Partners|Consulting|Services|Company|Co\.?|Foundation|Institute|University|College|Hospital|Bank|Agency|Studio|Labs?|Ventures?|Capital|Holdings?|International|Global|Enterprises?)\b/i;

export function computeExperienceWarnings(
  entry: ExperienceEntry,
  index: number,
): EntryWarning[] {
  const warnings: EntryWarning[] = [];

  // Too many bullets — consider splitting
  if (entry.highlights.length > 8) {
    const midpoint = Math.floor(entry.highlights.length / 2);
    warnings.push({
      id: `${index}-too-many-bullets`,
      level: 'suggestion',
      message: `${entry.highlights.length} bullets — consider splitting this entry`,
      action: {
        label: 'Split at midpoint',
        type: 'split',
        payload: { entryIndex: index, bulletIndex: midpoint },
      },
    });
  }

  // Position looks like a company name
  if (entry.position && COMPANY_INDICATORS.test(entry.position) && entry.company && !COMPANY_INDICATORS.test(entry.company)) {
    warnings.push({
      id: `${index}-swap-position`,
      level: 'warning',
      message: 'Position looks like a company name',
      action: {
        label: 'Swap',
        type: 'swap',
        payload: { entryIndex: index },
      },
    });
  }

  // No dates detected
  if (!entry.startDate && !entry.endDate) {
    warnings.push({
      id: `${index}-no-dates`,
      level: 'info',
      message: 'No dates detected',
    });
  }

  // Company field is empty — check if first bullet looks like a company name
  if (!entry.company) {
    if (entry.highlights.length > 0) {
      const firstBullet = entry.highlights[0];
      const words = firstBullet.split(/\s+/).filter(Boolean);
      const isShort = firstBullet.length < 60 && !firstBullet.endsWith('.');
      const isCapitalized = words.length >= 1 && words.length <= 6 &&
        words.filter(w => /^[A-Z]/.test(w)).length / words.length >= 0.6;

      if (isShort && isCapitalized) {
        warnings.push({
          id: `${index}-promote-bullet`,
          level: 'warning',
          message: 'First bullet looks like a company name',
          action: {
            label: 'Move to Company',
            type: 'promote_bullet',
            payload: { entryIndex: index },
          },
        });
      } else {
        warnings.push({
          id: `${index}-no-company`,
          level: 'warning',
          message: 'Company field is empty',
        });
      }
    } else {
      warnings.push({
        id: `${index}-no-company`,
        level: 'warning',
        message: 'Company field is empty',
      });
    }
  }

  // Position field is empty
  if (!entry.position) {
    warnings.push({
      id: `${index}-no-position`,
      level: 'warning',
      message: 'Position field is empty',
    });
  }

  // Suspicious bullets that look like new job entries (contain date range)
  const DATE_RANGE_RE = /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–—to]+\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|[Pp]resent|[Cc]urrent)/i;
  for (let i = 0; i < entry.highlights.length; i++) {
    const bullet = entry.highlights[i];
    if (DATE_RANGE_RE.test(bullet) && bullet.length < 100) {
      warnings.push({
        id: `${index}-suspicious-split-${i}`,
        level: 'warning',
        message: `Bullet ${i + 1} looks like a new job entry`,
        action: {
          label: 'Split here',
          type: 'split',
          payload: { entryIndex: index, bulletIndex: i },
        },
      });
    }
  }

  return warnings;
}
