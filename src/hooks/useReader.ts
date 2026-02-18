import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { isChapterUnlocked, checkClockSkew } from "@/lib/utils/date";

export function useReader(weekNumber: number) {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<
    "loading" | "locked" | "unlocked" | "skewed"
  >("loading");
  const [unlockDate, setUnlockDate] = useState<Date | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setStatus("locked");
      return;
    }

    // Baseline: Current time (In production, fetch this from a lightweight /api/time endpoint)
    const serverTime = new Date().toISOString();

    // 1. Check for Anti-Cheat (SRS-6.4)
    if (checkClockSkew(serverTime)) {
      setStatus("skewed");
      return;
    }

    // 2. Check Drip-Feed (SRS-4.2.1)
    // weekNumber is 1-indexed from URL, we need 0-indexed for calculation
    const weekIndex = weekNumber - 1;
    const isUnlocked = isChapterUnlocked(user.joinDate, weekIndex, serverTime);

    if (isUnlocked) {
      setStatus("unlocked");
    } else {
      const date = new Date(user.joinDate);
      date.setDate(date.getDate() + weekIndex * 7);
      setUnlockDate(date);
      setStatus("locked");
    }
  }, [user, authLoading, weekNumber]);

  return { status, unlockDate };
}
