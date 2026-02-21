// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProgressRepository } from "@/lib/db/repository";
import ProgressRing from "@/app/components/dashboard/ProgressRing";
import Notepad from "@/app/components/notes/Notepad";
import Link from "next/link";
import { BookOpenText, Lock } from "lucide-react";

// Mock chapters (later replace with real content fetch)
import chapter1 from "@/lib/mock/chapter_1.json";
import chapter2 from "@/lib/mock/chapter_2.json";
import chapter3 from "@/lib/mock/chapter_3.json";

const mockChapters = [chapter1, chapter2, chapter3];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getDaysSince(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const join = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));
}

function isChapterUnlocked(
  joinDate: string | null | undefined,
  weekIndex: number
): boolean {
  if (!joinDate) return weekIndex === 0; // at least week 1 always visible
  const days = getDaysSince(joinDate);
  return days >= weekIndex * 7;
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"content" | "activities">(
    "content"
  );
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [actionPlans, setActionPlans] = useState<any[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  useEffect(() => {
    if (!user?.id || authLoading) return;

    async function loadProgress() {
      setIsLoadingProgress(true);

      const weekStats: Record<string, number> = {};
      const allPlans: any[] = [];
      let totalCompleted = 0;
      let totalCount = 0;

      for (let i = 0; i < mockChapters.length; i++) {
        const chapter = mockChapters[i];
        const chapterId = `ch_${i + 1}`;

        // Real weekly lock logic (roadmap step 3)
        const unlocked = isChapterUnlocked(user.joinDate, i);
        if (!unlocked) continue;

        const chapterActions = chapter.pages.flatMap(
          (page: any) =>
            page.blocks
              ?.filter((b: any) => b.type === "action_plan")
              .map((ap: any) => ({
                ...ap,
                pageNumber: page.pageNumber,
                chapterNum: i + 1,
              })) || []
        );

        const progress = await ProgressRepository.getProgress(
          user.id,
          chapterId
        );
        const completedActions = progress?.completedActions || [];
        const completedCount = chapterActions.filter((a) =>
          completedActions.includes(a.id)
        ).length;

        weekStats[chapterId] =
          chapterActions.length > 0
            ? Math.round((completedCount / chapterActions.length) * 100)
            : 0;

        totalCompleted += completedCount;
        totalCount += chapterActions.length;

        chapterActions.forEach((ap) => {
          allPlans.push({
            ...ap,
            chapterId,
            status: completedActions.includes(ap.id)
              ? "completed"
              : "inProgress",
          });
        });
      }

      setProgresses(weekStats);
      setActionPlans(allPlans);
      setOverallProgress(
        totalCount ? Math.round((totalCompleted / totalCount) * 100) : 0
      );
      setIsLoadingProgress(false);
    }

    loadProgress();
  }, [user?.id, user?.joinDate, authLoading]);

  // ── Early returns ───────────────────────────────────────

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#f4ece1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9b2d30] mx-auto mb-4"></div>
          <p className="text-[#3d1c1d]">በመጫን ላይ...</p>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f4ece1] pb-28 relative">
      {/* Header */}
      <div className="p-6 bg-white/40 border-b border-[#9b2d30]/10 backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#3d1c1d]">
              ሠላም፣ {user.name || "ተማሪ"}
            </h1>
            <p className="text-sm text-[#9b2d30]/80 mt-1">የዛሬውን ሕንጸትህን ቀጥል</p>
          </div>
          <ProgressRing percentage={overallProgress} size={64} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 md:px-6 gap-3 sticky top-0 bg-[#f4ece1]/90 backdrop-blur-md z-10 border-b border-[#9b2d30]/10">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-3.5 rounded-xl text-sm md:text-base font-semibold transition-all ${
            activeTab === "content"
              ? "bg-[#9b2d30] text-white shadow-md"
              : "bg-white/70 text-[#3d1c1d] hover:bg-white/90"
          }`}>
          ትምህርቶች
        </button>
        <button
          onClick={() => setActiveTab("activities")}
          className={`flex-1 py-3.5 rounded-xl text-sm md:text-base font-semibold transition-all ${
            activeTab === "activities"
              ? "bg-[#9b2d30] text-white shadow-md"
              : "bg-white/70 text-[#3d1c1d] hover:bg-white/90"
          }`}>
          ተግባራት {actionPlans.length > 0 && `(${actionPlans.length})`}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {isLoadingProgress ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white/50 p-5 rounded-2xl h-28 animate-pulse"
              />
            ))}
          </div>
        ) : activeTab === "content" ? (
          <div className="grid grid-cols-1 gap-4">
            {mockChapters.map((ch, i) => {
              const chapterId = `ch_${i + 1}`;
              const weekNum = i + 1;
              const unlocked = isChapterUnlocked(user.joinDate, i);

              if (!unlocked) {
                return (
                  <div
                    key={chapterId}
                    className="bg-white/60 p-5 rounded-2xl border border-[#9b2d30]/15 flex items-center gap-4 opacity-75">
                    <div className="w-14 h-14 bg-amber-900/10 rounded-xl flex items-center justify-center">
                      <Lock size={24} className="text-[#9b2d30]/70" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#3d1c1d]/80 mb-1.5">
                        ሳምንት {weekNum} – ታስሯል
                      </h3>
                      <p className="text-sm text-[#3d1c1d]/60">
                        ቀጣይ ሳምንት ይጠብቁ…
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <Link key={chapterId} href={`/dashboard/lesson/${weekNum}`}>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#9b2d30]/10 flex items-center gap-4 hover:shadow-md hover:border-[#9b2d30]/30 transition-all">
                    <div className="w-14 h-14 bg-[#9b2d30]/10 rounded-xl flex items-center justify-center font-bold text-[#9b2d30] text-xl">
                      {weekNum}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#3d1c1d] mb-2">
                        {ch.title || `ሳምንት ${weekNum}`}
                      </h3>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#9b2d30] h-full rounded-full transition-all duration-700"
                          style={{ width: `${progresses[chapterId] || 0}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#9b2d30] min-w-[3.5rem] text-right">
                      {progresses[chapterId] || 0}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Activities / action plans list – add your content here */}
            <p className="text-center text-[#3d1c1d]/60 py-10">
              ተግባራት በቅርብ ጊዜ ይታከላሉ...
            </p>
          </div>
        )}
      </div>

      {/* Floating Notepad Button */}
      <button
        onClick={() => setIsNotepadOpen(true)}
        className="fixed bottom-24 right-6 z-50 p-4 bg-[#9b2d30] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-[#f5e9d6]/30"
        aria-label="ማስታወሻ ክፈት">
        <BookOpenText size={26} strokeWidth={2.2} />
      </button>

      {/* General Notepad */}
      <Notepad
        isOpen={isNotepadOpen}
        onClose={() => setIsNotepadOpen(false)}
        userId={user.id}
        password={user.id}
        chapterId="general"
        pageIndex={0}
        onSave={(html) => console.log("General note saved:", html)}
        onGoToPage={(idx) => {
          console.log("History selected → page index:", idx);
          // You could navigate here in the future
        }}
      />
    </div>
  );
}
