// src/hooks/useReader.ts

import { ProgressRepository } from "@/lib/db/repository";
import { checkClockSkew, isChapterUnlocked } from "@/lib/utils/date";
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
      if (!user) {
        setStatus("locked");
        return;
      }

      const serverTime = new Date().toISOString();

      // 1. Anti-Cheat Check
      if (checkClockSkew(serverTime)) {
        setStatus("skewed");
        setLockMessage("ሰዓትዎ ትክክል አይደለም። እባክዎ ወደ ትክክለኛው ሰዓት ይመልሱ።");
        return;
      }

      // 2. Time Check
      const weekIndex = weekNumber - 1;
      const timeUnlocked = isChapterUnlocked(
        user.joinDate,
        weekIndex,
        serverTime
      );

      if (!timeUnlocked) {
        const date = new Date(user.joinDate);
        date.setDate(date.getDate() + weekIndex * 7);
        setUnlockDate(date);
        setStatus("locked");
        setLockMessage(
          `ይህ ምዕራፍ ገና አልተከፈተም። በ ${date.toLocaleDateString("am-ET")} ይከፈታል።`
        );
        return;
      }

      // 3. Milestone Check (Hybrid Logic)
      if (weekNumber > 1) {
        const prevChapterId = `ch_${weekNumber - 1}`;
        const prevProgress = await ProgressRepository.getProgress(
          user.id,
          prevChapterId
        );

        if (!prevProgress || !prevProgress.isCompleted) {
          setStatus("locked");
          setLockMessage(
            `የቀደመውን ምዕራፍ (ምዕራፍ ${
              weekNumber - 1
            }) ተግባራዊ ልምምዶችን ሳያጠናቅቁ ወደዚህ ምዕራፍ ማለፍ አይቻልም።`
          );
          return;
        }
      }

      setStatus("unlocked");
    };

    evaluateAccess();
  }, [user, authLoading, weekNumber]);

  return { status, lockMessage, unlockDate };
}
