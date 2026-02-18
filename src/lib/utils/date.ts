import { differenceInDays, parseISO } from "date-fns";

const SKEW_THRESHOLD_MS = 60 * 60 * 1000; // 60 minutes

/**
 * SRS-4.2.1: Determines if a chapter is unlocked.
 * It uses the server-signed time as a baseline.
 */
export function isChapterUnlocked(
  joinDate: string,
  weekIndex: number,
  serverTimestamp: string // ISO from server
): boolean {
  const start = parseISO(joinDate);
  const now = parseISO(serverTimestamp);

  const daysElapsed = differenceInDays(now, start);
  return daysElapsed >= weekIndex * 7;
}

/**
 * SRS-6.4: Detects if user manipulated their system clock.
 */
export function checkClockSkew(serverTime: string): boolean {
  const localTime = Date.now();
  const remoteTime = new Date(serverTime).getTime();

  return Math.abs(localTime - remoteTime) > SKEW_THRESHOLD_MS;
}
