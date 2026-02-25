//src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ProgressRepository } from "@/lib/db/repository";
import ProgressRing from "@/app/components/dashboard/ProgressRing";
import WisdomHeader from "@/app/components/dashboard/WisdomHeader";
import TabSwitcher from "@/app/components/dashboard/TabSwitcher";
import ContentSections from "@/app/components/dashboard/ContentSections";
import Notepad from "@/app/components/notes/Notepad";
import { UserNav } from "@/app/components/profile/UserNav";
import { Search, PlayCircle, LogIn, BookOpenText } from "lucide-react";

import ch1 from "@/lib/contents/chapter_1.json";
import ch2 from "@/lib/contents/chapter_2.json";
import ch3 from "@/lib/contents/chapter_3.json";

const chapters = [ch1, ch2, ch3];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // --- State ---
  const [activeTab, setActiveTab] = useState<
    "chapters" | "concepts" | "activities"
  >("chapters");
  const [searchQuery, setSearchQuery] = useState("");
  const [globalProgress, setGlobalProgress] = useState(0);
  const [chapterStats, setChapterStats] = useState<any[]>([]);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    async function calculateStats() {
      const stats = [];
      let totalWeight = 0;
      let earnedWeight = 0;

      for (const ch of chapters) {
        const chId = ch.chapterId;
        const progress = user
          ? await ProgressRepository.getProgress(user.id, chId)
          : null;

        const chActions = ch.pages.flatMap(
          (p) => p.blocks?.filter((b: any) => b.type === "action_plan") || []
        );
        const doneActions = progress?.completedActions?.length || 0;
        const totalPages = ch.pages.length;
        const readPages = progress?.isCompleted
          ? totalPages
          : progress?.lastPageRead || 0;

        const actionWeight =
          chActions.length > 0 ? (doneActions / chActions.length) * 50 : 50;
        const readingWeight = (readPages / totalPages) * 50;
        const totalChPercent = user
          ? Math.min(100, Math.round(actionWeight + readingWeight))
          : 0;

        totalWeight += 100;
        earnedWeight += totalChPercent;

        stats.push({
          id: chId,
          title: ch.title,
          percent: totalChPercent,
          isDone: totalChPercent >= 98,
          chapterNumber: ch.chapterNumber,
        });
      }
      setGlobalProgress(
        totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0
      );
      setChapterStats(stats);
    }

    calculateStats();
  }, [user, authLoading]);

  const handleResume = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    const allProgress = await ProgressRepository.getAllProgress(user.id);
    if (!allProgress || allProgress.length === 0) {
      router.push("/lessons/1");
      return;
    }
    const latest = [...allProgress].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    const chapterNum = latest.chapterId.split("_")[1];
    router.push(
      `/lessons/${chapterNum}?page=${(latest.lastPageRead || 0) + 1}`
    );
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4ece1]">
        <div className="text-center font-serif text-[#9b2d30] animate-pulse">
          በመጫን ላይ...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4ece1] pb-24 relative">
      {/* 1. Global Navigation Avatar - Placed in a container to align with content */}
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="absolute right-3 top-3 z-[100]">
          <UserNav />
        </div>
      </div>

      <WisdomHeader />

      {/* 2. Header Content: Name, Button, and Progress Ring */}
      <div className="px-6 py-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 pt-2">
            <h1 className="text-2xl md:text-3xl font-bold text-[#3d1c1d]">
              {user
                ? `ሰላም፣ ${
                    user.user_metadata?.full_name || user.email?.split("@")[0]
                  }`
                : "እንኳን ደህና መጡ"}
            </h1>

            <button
              onClick={handleResume}
              className="mt-4 flex items-center gap-2 text-[#9b2d30] font-bold text-sm bg-white/60 px-5 py-2.5 rounded-full border border-[#9b2d30]/10 shadow-sm hover:bg-white active:scale-95 transition-all w-fit">
              {user ? (
                <>
                  <PlayCircle size={18} /> ካቆምክበት ቀጥል
                </>
              ) : (
                <>
                  <LogIn size={18} /> ለመጀመር ይግቡ
                </>
              )}
            </button>
          </div>

          {/* Progress Ring: Scaled slightly for mobile to prevent crowding */}
          <div className="flex flex-col items-center gap-2 mt-12 md:mt-16">
            <div className="scale-90 md:scale-100 origin-right">
              <ProgressRing
                percentage={globalProgress}
                size={85}
                strokeWidth={6}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mb-6 max-w-5xl mx-auto">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b2d30]/40"
            size={18}
          />
          <input
            type="text"
            placeholder="ትምህርቶችን ወይም ተግባራትን ፈልግ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-[#9b2d30]/10 focus:bg-white outline-none transition-all shadow-inner text-sm"
          />
        </div>
      </div>

      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="p-6 max-w-5xl mx-auto">
        <ContentSections
          activeTab={activeTab}
          chapters={chapters}
          chapterStats={chapterStats}
          searchQuery={searchQuery}
          userJoinDate={user?.joinDate || user?.created_at}
        />
      </main>

      {/* Floating Action Button for Notepad */}
      <button
        onClick={() => setIsNotepadOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#9b2d30] text-[#fdfaf1] rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-[#fdfaf1]/20">
        <BookOpenText size={24} />
      </button>

      {/*  the Notepad Component  */}
      {user && (
        <Notepad
          isOpen={isNotepadOpen}
          onClose={() => setIsNotepadOpen(false)}
          chapterId="general_notes"
          userId={user.id}
          pageIndex={0}
          password={user.id}
        />
      )}
    </div>
  );
}
