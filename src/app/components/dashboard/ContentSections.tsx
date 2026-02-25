//src/app/components/dashboard/ContentSections.tsx
// src/app/components/dashboard/ContentSections.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Lock,
  ChevronRight,
  CheckCircle2,
  Circle,
  Bookmark,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ProgressRepository } from "@/lib/db/repository";
import { useAuth } from "@/hooks/useAuth";
import { WaxSeal } from "./WaxSeal";
import {
  isChapterUnlocked,
  getChapterUnlockDate,
  checkClockSkew,
} from "@/lib/utils/date";

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

  // ── Clock Skew & Server Time Reference ─────────────────────────────
  const [serverNow] = useState(new Date().toISOString());
  const [isClockWrong, setIsClockWrong] = useState(false);
  const [inspectingChapterIndex, setInspectingChapterIndex] = useState<
    number | null
  >(null);

  const [completedActions, setCompletedActions] = useState<string[]>([]);

  useEffect(() => {
    setIsClockWrong(checkClockSkew(serverNow));
  }, [serverNow]);

  // ── Celebration ─────────────────────────────────────────────────────
  const triggerCelebration = useCallback(() => {
    confetti({
      particleCount: 160,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#9b2d30", "#f4ece1", "#3d1c1d", "#e8d5c0"],
      ticks: 280,
    });
    setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 65,
        spread: 45,
        origin: { x: 0.15, y: 0.7 },
        colors: ["#9b2d30", "#f4ece1"],
      });
    }, 160);
  }, []);

  // ── Load completed actions for Activities tab ───────────────────────
  useEffect(() => {
    if (!user || activeTab !== "activities") return;

    const loadAllActions = async () => {
      try {
        const allProgs = await ProgressRepository.getAllProgress(user.id);
        const allIds = allProgs.flatMap(
          (p: { completedActions?: string[] }) => p.completedActions || []
        );
        setCompletedActions(allIds);
      } catch (err) {
        console.error("Failed to load completed actions:", err);
      }
    };
    loadAllActions();
  }, [user, activeTab]);

  // ── Refined Unlock Logic using utilities ───────────────────────────
  const isUnlocked = (index: number): boolean => {
    if (!userJoinDate) return index === 0;
    return isChapterUnlocked(userJoinDate, index, serverNow);
  };

  const getUnlockDate = (chapterIndex: number): string => {
    return getChapterUnlockDate(userJoinDate, chapterIndex);
  };

  const unlockedChapters = chapters.filter((_, i) => isUnlocked(i));

  // ── CHAPTERS TAB ────────────────────────────────────────────────────
  if (activeTab === "chapters") {
    return (
      <div className="flex flex-col gap-4 pb-28 px-1 sm:px-4">
        {/* Wax Seal Modal */}
        {inspectingChapterIndex !== null && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3">
            <div className="relative w-full max-w-[340px] bg-[#fdfaf1] rounded-3xl overflow-hidden shadow-2xl border border-[#9b2d30]/20">
              {/* Clock Skew Warning */}
              {isClockWrong && (
                <div className="bg-amber-100 text-amber-800 text-[10px] py-1 text-center font-bold uppercase tracking-widest">
                  እባክዎ የስልክዎን ሰዓት ያስተካክሉ
                </div>
              )}

              <button
                onClick={() => setInspectingChapterIndex(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#9b2d30]/5 text-[#9b2d30] hover:bg-[#9b2d30]/10 transition-colors">
                <X size={20} />
              </button>

              <WaxSeal unlockDate={getUnlockDate(inspectingChapterIndex)} />

              <div className="p-5 pt-0">
                <button
                  onClick={() => setInspectingChapterIndex(null)}
                  className="w-full py-4 bg-[#3d1c1d] text-white font-bold rounded-2xl active:scale-95 transition-transform">
                  ተመለስ
                </button>
              </div>
            </div>
          </div>
        )}

        {chapterStats.map((ch, i) => {
          const unlocked = isUnlocked(i);
          const isMastered = unlocked && ch.percent === 100;

          const card = (
            <div
              className={`relative p-4 rounded-2xl border transition-all flex flex-col gap-3 active:scale-[0.98] ${
                unlocked
                  ? "bg-[#fdfaf1] border-[#9b2d30]/20 shadow-sm"
                  : "bg-[#f8f0e8]/80 border-dashed border-[#9b2d30]/25 opacity-85 cursor-help"
              }`}
              onClick={
                !unlocked ? () => setInspectingChapterIndex(i) : undefined
              }>
              {isMastered && (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerCelebration();
                  }}
                  className="absolute -right-1.5 -top-2.5 rotate-12 bg-[#9b2d30] text-white text-[12px] font-black px-1 py-0.5 rounded shadow-lg z-10 cursor-pointer active:scale-95">
                  MASTERED 🎉
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                    unlocked
                      ? "bg-[#9b2d30]/10 text-[#9b2d30]"
                      : "bg-[#9b2d30]/60 text-white"
                  }`}>
                  {unlocked ? ch.chapterNumber : <Lock size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-bold leading-tight text-[15px] ${
                      unlocked ? "text-[#3d1c1d]" : "text-[#3d1c1d]/60"
                    }`}>
                    {ch.title}
                  </h3>

                  {unlocked && (
                    <div className="w-full bg-[#3d1c1d]/8 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-[#9b2d30] h-full rounded-full transition-all duration-1000"
                        style={{ width: `${ch.percent}%` }}
                      />
                    </div>
                  )}
                </div>

                {unlocked && (
                  <ChevronRight size={20} className="text-[#9b2d30]/40" />
                )}
              </div>
            </div>
          );

          return unlocked ? (
            <Link key={ch.id} href={`/lessons/${ch.chapterNumber}`}>
              {card}
            </Link>
          ) : (
            <div key={ch.id}>{card}</div>
          );
        })}
      </div>
    );
  }

  // ── ACTIVITIES TAB ──────────────────────────────────────────────────
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
      <div className="flex flex-col gap-4 pb-28 px-1">
        {activities.length > 0 ? (
          activities.map((act, idx) => {
            const isDone = completedActions.includes(act.id);
            return (
              <Link key={idx} href={`/lessons/${act.chNum}?page=${act.pgNum}`}>
                <div
                  className={`group flex flex-col gap-2.5 rounded-2xl border transition-all shadow-sm active:scale-[0.97] p-4 ${
                    isDone
                      ? "bg-[#f0f9f0]/70 border-green-200"
                      : "bg-[#fdfaf1] border-[#9b2d30]/20"
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {isDone ? (
                        <CheckCircle2 size={22} className="text-green-600" />
                      ) : (
                        <Circle size={22} className="text-[#9b2d30]/40" />
                      )}
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#9b2d30]/10 text-[#9b2d30] uppercase">
                        ሳምንት {act.chNum} • ገጽ {act.pgNum}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                        isDone
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                      {isDone ? "ተጠናቅቋል" : "በሂደት"}
                    </span>
                  </div>

                  <p className="text-[14.5px] leading-relaxed text-[#3d1c1d] font-medium">
                    {act.content}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-20 opacity-50 text-sm italic">
            ምንም ተግባር አልተገኘም
          </div>
        )}
      </div>
    );
  }

  // ── CONCEPTS TAB ────────────────────────────────────────────────────
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
      <div className="flex flex-col gap-4 pb-28 px-1">
        {concepts.map((conc, idx) => (
          <Link key={idx} href={`/lessons/${conc.chNum}?page=${conc.pgNum}`}>
            <div className="bg-[#fdfaf1] px-4 py-5 rounded-2xl border border-[#9b2d30]/20 shadow-sm flex items-center justify-between group active:scale-[0.97] transition-transform">
              <div className="w-10 h-10 mr-2 rounded-full bg-[#9b2d30]/10 flex items-center justify-center shrink-0">
                <Bookmark
                  size={18}
                  className="text-[#9b2d30]/50 group-hover:text-[#9b2d30]"
                />
              </div>
              <div className="flex-1 pr-3">
                <h4 className="font-bold text-[14.5px] text-[#3d1c1d] group-hover:text-[#9b2d30] transition-colors leading-snug">
                  {conc.content}
                </h4>
                <div className="mt-1.5">
                  <span className="text-[10px] text-[#9b2d30]/70 font-semibold uppercase tracking-wide">
                    ከሳምንት {conc.chNum} የተወሰደ መሠረታዊ ሐሳብ
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return null;
}
