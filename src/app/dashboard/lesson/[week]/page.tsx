"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useReader } from "@/hooks/useReader";
import { WaxSeal } from "@/app/components/dashboard/WaxSeal";
import { Book } from "@/app/components/reader/Book";

// 1. Static Import Mapping (ይህ ስህተቱን ያስቀረዋል)
import chapter1 from "@/lib/mock/chapter_1.json";
import chapter2 from "@/lib/mock/chapter_2.json";
import chapter3 from "@/lib/mock/chapter_3.json";

const CHAPTERS: Record<number, any> = {
  1: chapter1,
  2: chapter2,
  3: chapter3,
};

export default function LessonPage() {
  const params = useParams();
  const weekNumber = parseInt(params.week as string);
  const { status, unlockDate } = useReader(weekNumber);
  const [chapterData, setChapterData] = useState<any>(null);

  useEffect(() => {
    // ካርታው ውስጥ ካለ ዳታውን ሴት እናደርጋለን
    if (CHAPTERS[weekNumber]) {
      setChapterData(CHAPTERS[weekNumber]);
    }
  }, [weekNumber]);

  if (status === "loading" || !chapterData) {
    return (
      <div className="biranna-viewport flex items-center justify-center font-serif italic text-[#9b2d30]">
        ብራናው እየተከፈተ ነው...
      </div>
    );
  }

  if (status === "locked" && unlockDate) {
    return <WaxSeal unlockDate={unlockDate.toISOString()} />;
  }

  // chapterData አሁን በውስጡ .pages አለው
  return <Book pages={chapterData.pages} chapterId={chapterData.chapterId} />;
}
