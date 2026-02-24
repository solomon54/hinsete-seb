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
import { Search, PlayCircle } from "lucide-react";

import ch1 from "@/lib/contents/chapter_1.json";
import ch2 from "@/lib/contents/chapter_2.json";
import ch3 from "@/lib/contents/chapter_3.json";

const chapters = [ch1, ch2, ch3];

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "chapters" | "concepts" | "activities"
  >("chapters");
  const [searchQuery, setSearchQuery] = useState("");
  const [globalProgress, setGlobalProgress] = useState(0);
  const [chapterStats, setChapterStats] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    async function calculateGlobalStats() {
      let totalWeight = 0;
      let earnedWeight = 0;
      const stats = [];

      for (const ch of chapters) {
        const chId = ch.chapterId;
        const progress = await ProgressRepository.getProgress(user.id, chId);

        const chActions = ch.pages.flatMap(
          (p) => p.blocks?.filter((b: any) => b.type === "action_plan") || []
        );
        const doneActions = progress?.completedActions?.length || 0;

        const totalPages = ch.pages.length;
        // If they finished the chapter, give full page credit
        const readPages = progress?.isCompleted
          ? totalPages
          : progress?.lastPageRead || 0;

        // Progress Calculation: 50% Reading, 50% Actions
        const actionWeight =
          chActions.length > 0 ? (doneActions / chActions.length) * 50 : 50;
        const readingWeight = (readPages / totalPages) * 50;
        const totalChPercent = Math.min(
          100,
          Math.round(actionWeight + readingWeight)
        );

        totalWeight += 100;
        earnedWeight += totalChPercent;

        stats.push({
          id: chId,
          title: ch.title,
          percent: totalChPercent,
          isDone: totalChPercent >= 98, // Threshold for Mastered
          chapterNumber: ch.chapterNumber,
        });
      }
      setGlobalProgress(Math.round((earnedWeight / totalWeight) * 100));
      setChapterStats(stats);
    }
    calculateGlobalStats();
  }, [user]);

  const handleResume = async () => {
    if (!user) return;
    const allProgress = await ProgressRepository.getAllProgress(user.id);
    if (!allProgress || allProgress.length === 0) {
      router.push("/lessons/1");
      return;
    }
    const latest = allProgress.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    const chapterNum = latest.chapterId.split("_")[1];
    // Use lastPageRead + 1 to ensure we go to the next logical page
    router.push(
      `/lessons/${chapterNum}?page=${(latest.lastPageRead || 0) + 1}`
    );
  };

  if (authLoading || !user)
    return (
      <div className="p-20 text-center font-serif text-[#9b2d30]">
        በመጫን ላይ...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f4ece1] pb-24">
      <WisdomHeader />
      <div className="p-6 max-w-5xl mx-auto flex justify-between items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#3d1c1d]">
            ሰላም፣ {user.name}
          </h1>
          <button
            onClick={handleResume}
            className="mt-3 flex items-center gap-2 text-[#9b2d30] font-bold text-sm bg-white/60 px-5 py-2.5 rounded-full border border-[#9b2d30]/10 shadow-sm hover:bg-white active:scale-95 transition-all">
            <PlayCircle size={18} /> ካቆምክበት ቀጥል
          </button>
        </div>
        <ProgressRing percentage={globalProgress} size={85} strokeWidth={6} />
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
          userJoinDate={user.joinDate}
        />
      </main>
    </div>
  );
}
