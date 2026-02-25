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

      // Safety 1: No user = No access
      if (!user) {
        setStatus("locked");
        return;
      }

      // Safety 2: Handle malformed joinDate to prevent crash
      const joinDateBase = user.joinDate || user.created_at; // Fallback to created_at
      const parsedJoinDate = new Date(joinDateBase);

      if (isNaN(parsedJoinDate.getTime())) {
        console.error("Critical: Invalid User Join Date", joinDateBase);
        setStatus("locked");
        setLockMessage("የመግቢያ ቀን ስህተት ተገኝቷል። እባክዎ ድጋፍ ያግኙ።");
        return;
      }

      const serverTime = new Date().toISOString();
      const weekIndex = weekNumber - 1;

      // 1. Clock Check (Anti-Cheat)
      if (checkClockSkew(serverTime)) {
        setStatus("skewed");
        setLockMessage("ሰዓትዎ ትክክል አይደለም። እባክዎ ወደ ትክክለኛው ሰዓት ይመልሱ።");
        return;
      }

      // 2. Milestone Check (The "No Bypass" Guard)
      // Users MUST finish previous week before even checking the time for the next
      if (weekNumber > 1) {
        const prevChapterId = `ch_${weekNumber - 1}`;
        const prevProgress = await ProgressRepository.getProgress(
          user.id,
          prevChapterId
        );

        if (!prevProgress || !prevProgress.isCompleted) {
          setStatus("locked");
          setLockMessage(
            `ምዕራፍ ${
              weekNumber - 1
            } ገና አልተጠናቀቀም። የቀደመውን ምዕራፍ ተግባራት ሳይጨርሱ ወደዚህ ማለፍ አይቻልም።`
          );
          // Set unlockDate to null here so the UI doesn't try to show a timer
          setUnlockDate(null);
          return;
        }
      }

      // 3. Time Check (Week-by-Week drip feed)
      const timeUnlocked = isChapterUnlocked(
        parsedJoinDate.toISOString(),
        weekIndex,
        serverTime
      );

      if (!timeUnlocked) {
        const date = new Date(parsedJoinDate);
        date.setDate(date.getDate() + weekIndex * 7);

        setUnlockDate(date);
        setStatus("locked");
        setLockMessage(
          `ይህ ምዕራፍ በ ${date.toLocaleDateString(
            "am-ET"
          )} ይከፈታል። እስከዚያው ያለፉትን ምዕራፎች ይከልሱ።`
        );
        return;
      }

      setStatus("unlocked");
      setUnlockDate(null);
    };

    evaluateAccess();
  }, [user, authLoading, weekNumber]);

  return { status, lockMessage, unlockDate };
}
