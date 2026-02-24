//src/app/components/dashboard/ContentSections.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Lock,
  ChevronRight,
  CheckCircle2,
  Circle,
  Bookmark,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ProgressRepository } from "@/lib/db/repository";
import { useAuth } from "@/hooks/useAuth";

interface ContentSectionsProps {
  activeTab: string;
  chapters: any[];
  chapterStats: any[];
  searchQuery: string;
  userJoinDate: string;
}

export default function ContentSections({
  activeTab,
  chapters,
  chapterStats,
  searchQuery,
  userJoinDate,
}: ContentSectionsProps) {
  const { user } = useAuth();
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  // ── Confetti Celebration (Cinnabar Red theme) ─────────────────────
  const triggerCelebration = useCallback(() => {
    confetti({
      particleCount: 180,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#9b2d30", "#f4ece1", "#3d1c1d", "#e8d5c0"],
      ticks: 300,
    });

    // Second burst for extra joy
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 50,
        origin: { x: 0.1, y: 0.7 },
        colors: ["#9b2d30", "#f4ece1"],
      });
    }, 180);
  }, []);

  // Load completed action plans for Activities tab
  useEffect(() => {
    if (user && activeTab === "activities") {
      const loadAllActions = async () => {
        const allProgs = await ProgressRepository.getAllProgress(user.id);
        const allIds = allProgs.flatMap(
          (p: { completedActions?: string[] }) => p.completedActions || []
        );
        setCompletedActions(allIds);
      };
      loadAllActions();
    }
  }, [user, activeTab]);

  const isUnlocked = (index: number) => {
    if (!userJoinDate) return index === 0;
    const days = Math.floor(
      (new Date().getTime() - new Date(userJoinDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days >= index * 7;
  };

  const unlockedChapters = chapters.filter((_, i) => isUnlocked(i));

  // ── ACTIVITIES TAB (Stacked Mobile-First Layout) ──────────────────────
  if (activeTab === "activities") {
    const activities = unlockedChapters.flatMap((ch) =>
      ch.pages.flatMap(
        (p: { blocks: any[]; pageNumber: any }) =>
          p.blocks
            ?.filter(
              (b: any) =>
                b.type === "action_plan" &&
                b.content.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((b: any) => ({
              ...b,
              chNum: ch.chapterNumber,
              pgNum: p.pageNumber,
            })) || []
      )
    );

    return (
      <div className="flex flex-col gap-6 pb-24">
        {activities.length > 0 ? (
          activities.map((act, idx) => {
            const isDone = completedActions.includes(act.id);
            return (
              <Link key={idx} href={`/lessons/${act.chNum}?page=${act.pgNum}`}>
                <div
                  className={`group flex flex-col gap-3 rounded-[2rem] border transition-all shadow-sm active:scale-[0.96] px-4 py-5 md:flex-row md:items-start md:gap-4 md:px-6 ${
                    isDone
                      ? "bg-white/60 border-green-200"
                      : "bg-white border-[#9b2d30]/10"
                  }`}>
                  <div className="flex items-center justify-between w-full md:w-auto md:mt-1">
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 size={24} className="text-green-500" />
                      ) : (
                        <Circle size={24} className="text-[#9b2d30]/20" />
                      )}
                      <span className="md:hidden text-[10px] font-bold px-2 py-0.5 rounded bg-[#9b2d30]/5 text-[#9b2d30] uppercase">
                        ሳምንት {act.chNum} • ገጽ {act.pgNum}
                      </span>
                    </div>
                    <span
                      className={`md:hidden text-[9px] font-black px-2 py-1 rounded-md uppercase ${
                        isDone
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                      {isDone ? "ተጠናቅቋል" : "በሂደት ላይ"}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-[15px] md:text-base text-[#3d1c1d] leading-relaxed font-medium">
                      {act.content}
                    </p>
                    <div className="hidden md:flex items-center gap-2 mt-4">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#9b2d30]/5 text-[#9b2d30] uppercase">
                        ሳምንት {act.chNum} • ገጽ {act.pgNum}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase ${
                          isDone
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-600"
                        }`}>
                        {isDone ? "ተጠናቅቋል" : "በሂደት ላይ"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-20 opacity-40 italic">
            ምንም ተግባር አልተገኘም
          </div>
        )}
      </div>
    );
  }

  // ── CHAPTERS TAB (with MASTERED + Confetti) ────────────────────────
  if (activeTab === "chapters") {
    return (
      <div className="flex flex-col gap-5 pb-24">
        {chapterStats.map((ch, i) => {
          const unlocked = isUnlocked(i);
          const isMastered = ch.percent === 100 && unlocked;

          return (
            <Link
              key={ch.id}
              href={unlocked ? `/lessons/${ch.chapterNumber}` : "#"}>
              <div
                className={`relative p-5 md:p-6 rounded-[2.5rem] border transition-all flex flex-col gap-4 md:flex-row md:items-center md:gap-6 ${
                  unlocked
                    ? "bg-white border-[#9b2d30]/10 shadow-sm hover:shadow-md"
                    : "bg-gray-200/40 opacity-60"
                }`}>
                {/* MASTERED Badge + Celebration */}
                {isMastered && (
                  <div
                    onMouseEnter={triggerCelebration}
                    onClick={triggerCelebration} // also works on mobile tap
                    className="absolute -right-2 -top-3 rotate-12 bg-[#9b2d30] text-white text-[9px] font-black px-4 py-1 rounded-md shadow-lg border-2 border-white/30 z-10 cursor-pointer active:scale-95 transition-transform">
                    MASTERED 🎉
                  </div>
                )}

                <div className="flex items-center justify-between md:contents">
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl flex-shrink-0 ${
                      unlocked
                        ? "bg-[#9b2d30]/5 text-[#9b2d30] border border-[#9b2d30]/10"
                        : "bg-gray-300 text-gray-500"
                    }`}>
                    {unlocked ? ch.chapterNumber : <Lock size={20} />}
                  </div>

                  {unlocked && (
                    <ChevronRight
                      size={20}
                      className="text-[#9b2d30]/20 md:hidden"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#3d1c1d] text-base md:text-lg leading-tight mb-3">
                    {ch.title}
                  </h3>

                  {unlocked && (
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`bg-[#9b2d30] h-full rounded-full transition-all duration-1000 ${
                          ch.percent > 0 && ch.percent < 100
                            ? "animate-pulse"
                            : ""
                        }`}
                        style={{ width: `${ch.percent}%` }}
                      />
                    </div>
                  )}
                </div>

                {unlocked && (
                  <ChevronRight
                    size={20}
                    className="hidden md:block text-[#9b2d30]/20"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  // ── CONCEPTS TAB ─────────────────────────────────────────────────────
  if (activeTab === "concepts") {
    const concepts = unlockedChapters
      .flatMap((ch) =>
        ch.pages.flatMap(
          (p: { blocks: any[]; pageNumber: any }) =>
            p.blocks
              ?.filter((b: any) => b.type === "subtitle")
              .map((b: any) => ({
                ...b,
                chNum: ch.chapterNumber,
                pgNum: p.pageNumber,
              })) || []
        )
      )
      .filter((c) =>
        c.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return (
      <div className="flex flex-col gap-4 pb-24">
        {concepts.map((conc, idx) => (
          <Link key={idx} href={`/lessons/${conc.chNum}?page=${conc.pgNum}`}>
            <div className="bg-white px-5 py-6 rounded-[2rem] border border-[#9b2d30]/10 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-transform">
              <div className="flex-1 pr-4">
                <h4 className="font-bold text-[#3d1c1d] text-[15px] md:text-base group-hover:text-[#9b2d30] transition-colors leading-snug">
                  {conc.content}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-[#9b2d30]/60 font-black uppercase tracking-widest">
                    ከሳምንት {conc.chNum} የተወሰደ መሠረታዊ ሐሳብ
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#9b2d30]/5 flex items-center justify-center">
                <Bookmark
                  size={18}
                  className="text-[#9b2d30]/30 group-hover:text-[#9b2d30] transition-colors"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return null;
}
