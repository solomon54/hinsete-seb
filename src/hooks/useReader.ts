// src/hooks/useReader.ts
import { ProgressRepository } from "@/lib/db/repository";
import {
  checkClockSkew,
  isChapterUnlocked,
  getChapterUnlockDate,
} from "@/lib/utils/date";
import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export function useReader(weekNumber: number) {
  const { user, loading: authLoading } = useAuth();

  const [status, setStatus] = useState<
    "loading" | "locked" | "unlocked" | "skewed"
  >("loading");
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  const [unlockDate, setUnlockDate] = useState<Date | null>(null);

  useEffect(() => {
    const evaluateAccess = async () => {
      if (authLoading) return;

      // Safety 1: No user = No access (unchanged)
      if (!user) {
        setStatus("locked");
        setLockMessage(null);
        setUnlockDate(null);
        return;
      }

      /**
       * 👑 OWNER BYPASS (Master Key) – unchanged
       */
      if (user.role === "OWNER") {
        setStatus("unlocked");
        setUnlockDate(null);
        setLockMessage(null);
        return;
      }

      // --- REGULAR USER LOGIC BELOW ---

      const joinDateBase = user.joinDate || user.created_at;

      // Original validation (kept exactly)
      const parsedJoinDate = new Date(joinDateBase);
      if (isNaN(parsedJoinDate.getTime())) {
        setStatus("locked");
        setLockMessage("የመግቢያ ቀን ስህተት ተገኝቷል። እባክዎ ድጋፍ ያግኙ።");
        setUnlockDate(null);
        return;
      }

      const serverTime = new Date().toISOString();

      // 1. Clock Check (Anti-Cheat) – unchanged
      if (checkClockSkew(serverTime)) {
        setStatus("skewed");
        setLockMessage("ሰዓትዎ ትክክል አይደለም። እባክዎ ወደ ትክክለኛው ሰዓት ይመልሱ።");
        setUnlockDate(null);
        return;
      }

      // 2. Milestone Check (prev chapter must be completed) – unchanged
      if (weekNumber > 1) {
        const prevChapterId = `ch_${weekNumber - 1}`;
        const prevProgress = await ProgressRepository.getProgress(
          user.id,
          prevChapterId
        );

        if (!prevProgress || !prevProgress.isCompleted) {
          setStatus("locked");
          setLockMessage(`ምዕራፍ ${weekNumber - 1} ገና አልተጠናቀቀም።`);
          setUnlockDate(null);
          return;
        }
      }

      // 3. Time Check – FIXED & ROBUST (uses utilities directly)
      // Pass real weekNumber (1, 2, 3...) – no more double subtraction!
      const timeUnlocked = isChapterUnlocked(
        joinDateBase, // raw string (utilities handle parsing safely)
        weekNumber,
        serverTime
      );

      if (!timeUnlocked) {
        // Use the same robust utility used everywhere else
        const unlockIso = getChapterUnlockDate(joinDateBase, weekNumber);
        setUnlockDate(new Date(unlockIso));
        setStatus("locked");
        setLockMessage(null); // clear any previous message
        return;
      }

      // Success path
      setStatus("unlocked");
      setUnlockDate(null);
      setLockMessage(null);
    };

    evaluateAccess();
  }, [user, authLoading, weekNumber]);

  return { status, lockMessage, unlockDate };
}
