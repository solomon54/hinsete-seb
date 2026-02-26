// src/lib/utils/date.ts
import { parseISO, isValid } from "date-fns";

/**
 * Number of milliseconds in one full day (used for weekly unlock calculations)
 */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Maximum acceptable clock difference between client and server (1 hour)
 * Beyond this threshold we consider the local clock potentially manipulated
 */
const SKEW_THRESHOLD_MS = 60 * 60 * 1000;

/**
 * Determines whether a chapter/week is unlocked based on time elapsed since joinDate.
 *
 * Logic:
 *   - Week 1 (weekIndex=1 or weekNumber=1) → unlocked immediately
 *   - Week 2 → unlocked after 7 days
 *   - Week N → unlocked after (N-1) × 7 days
 *
 * @param joinDate ISO string from server (user registration date)
 * @param weekNumber 1-based week number (most user-friendly)
 * @param serverTimestamp ISO string — trusted time anchor from last sync
 * @returns true if enough time has passed according to server time
 */
export function isChapterUnlocked(
  joinDate: string | null | undefined,
  weekNumber: number,
  serverTimestamp: string | null | undefined
): boolean {
  // Early exit — missing critical data → treat as locked (safest default)
  if (!joinDate || !serverTimestamp) {
    return false;
  }

  const start = parseISO(joinDate);
  const now = parseISO(serverTimestamp);

  // Invalid date strings → treat as locked
  if (!isValid(start) || !isValid(now)) {
    return false;
  }

  const elapsedMs = now.getTime() - start.getTime();

  // Negative elapsed time (clock skew backward or manipulated joinDate) → locked
  if (elapsedMs < 0) {
    return false;
  }

  const requiredMs = (weekNumber - 1) * MS_PER_DAY * 7;

  return elapsedMs >= requiredMs;
}

/**
 * Calculates the exact ISO timestamp when the given week becomes unlocked.
 *
 * @param joinDate ISO string (user registration date)
 * @param weekNumber 1-based week number
 * @returns ISO string of unlock moment (or current time if input invalid)
 */
export function getChapterUnlockDate(
  joinDate: string | null | undefined,
  weekNumber: number
): string {
  // Defensive fallback — invalid/missing joinDate → pretend it's now
  if (!joinDate) {
    return new Date().toISOString();
  }

  const start = parseISO(joinDate);
  if (!isValid(start)) {
    return new Date().toISOString();
  }

  const daysToAdd = (weekNumber - 1) * 7;
  const unlockMs = start.getTime() + daysToAdd * MS_PER_DAY;

  return new Date(unlockMs).toISOString();
}

/**
 * Detects significant clock difference between client and last known server time.
 * Used to warn user or disable time-sensitive features (drip-feed) when skew is large.
 *
 * @param serverTime ISO timestamp from last successful sync
 * @returns true if difference is suspiciously large (> 1 hour)
 */
export function checkClockSkew(serverTime: string | null | undefined): boolean {
  if (!serverTime) {
    return true; // No trusted time → assume skew / unsafe
  }

  const remoteMs = parseISO(serverTime).getTime();
  if (!isValid(remoteMs)) {
    return true;
  }

  const localMs = Date.now();
  const difference = Math.abs(localMs - remoteMs);

  return difference > SKEW_THRESHOLD_MS;
}

/**
 * Helper — formats a date difference in human-readable Amharic-friendly way
 * (useful for UI messages: "Chapter unlocks in 3 days", etc.)
 */
export function formatTimeUntilUnlock(
  unlockIso: string,
  nowIso: string = new Date().toISOString()
): string {
  const unlock = parseISO(unlockIso);
  const now = parseISO(nowIso);

  if (!isValid(unlock) || !isValid(now)) {
    return "—";
  }

  const diffMs = unlock.getTime() - now.getTime();
  if (diffMs <= 0) return "አሁን ይገኛል";

  const days = Math.floor(diffMs / MS_PER_DAY);
  const hours = Math.floor((diffMs % MS_PER_DAY) / (60 * 60 * 1000));

  if (days > 0) {
    return days === 1 ? "ነገ" : `${days} ቀናት ቀርቷል`;
  }

  if (hours > 0) {
    return `${hours} ሰዓት ቀርቷል`;
  }

  return "በቅርብ ጊዜ";
}
