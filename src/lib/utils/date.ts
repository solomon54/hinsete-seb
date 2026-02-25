//src/lib/utils/date.ts
import { parseISO } from "date-fns";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SKEW_THRESHOLD_MS = 60 * 60 * 1000; // 60 minutes

/**
 * SRS-4.2.1:
 * Determines if a chapter is unlocked.
 *
 * Uses exact millisecond comparison (7 × 24h per week).
 * Immune to timezone, DST, and calendar-boundary errors.
 * Uses server-signed timestamp as the source of truth.
 */
export function isChapterUnlocked(
  joinDate: string,
  weekIndex: number,
  serverTimestamp: string // ISO from server
): boolean {
  if (!joinDate || !serverTimestamp) return false;

  const startMs = parseISO(joinDate).getTime();
  const nowMs = parseISO(serverTimestamp).getTime();

  if (isNaN(startMs) || isNaN(nowMs)) return false;

  const elapsedMs = nowMs - startMs;
  const requiredMs = weekIndex * 7 * MS_PER_DAY;

  return elapsedMs >= requiredMs;
}

/**
 * Returns the exact unlock timestamp (ISO).
 * Useful for WaxSeal display.
 */
export function getChapterUnlockDate(
  joinDate: string,
  weekIndex: number
): string {
  const startMs = parseISO(joinDate).getTime();
  const unlockMs = startMs + weekIndex * 7 * MS_PER_DAY;

  return new Date(unlockMs).toISOString();
}

/**
 * SRS-6.4:
 * Detects if user manipulated their system clock.
 * Compares local device time with trusted server time.
 */
export function checkClockSkew(serverTime: string): boolean {
  if (!serverTime) return false;

  const localTime = Date.now();
  const remoteTime = parseISO(serverTime).getTime();

  if (isNaN(remoteTime)) return false;

  return Math.abs(localTime - remoteTime) > SKEW_THRESHOLD_MS;
}
