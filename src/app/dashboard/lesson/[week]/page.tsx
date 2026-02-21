//src/app/dashboard/lesson/[week]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useReader } from "@/hooks/useReader";
import { WaxSeal } from "@/app/components/dashboard/WaxSeal";
import { Book } from "@/app/components/reader/Book";
import Notepad from "@/app/components/notes/Notepad"; // Notepad ጨምር
import { BookOpenText } from "lucide-react"; // ለ Notepad button

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

  // 1. የገጽ ቁጥርን የሚይዝ State (Progress-ን ለመመለስ)
  const [currentPage, setCurrentPage] = useState(0);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  useEffect(() => {
    if (CHAPTERS[weekNumber]) {
      setChapterData(CHAPTERS[weekNumber]);
    }
  }, [weekNumber]);

  // 2. ገጽ ሲቀየር ማስታወሻውም አብሮ እንዲቀየር
  const handlePageChange = (index: number) => {
    setCurrentPage(index);
    // እዚህ ጋር ለወደፊቱ ProgressRepository.saveLastPageRead መጥራት ይቻላል
  };

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

  return (
    <div className="relative min-h-screen">
      {/* Book ላይ handlePageChange ጨምር (ኮምፖነንቱ የሚቀበል ከሆነ) */}
      <Book
        pages={chapterData.pages}
        chapterId={chapterData.chapterId}
        onPageChange={handlePageChange}
      />

      {/* ገጹን እና ተጠቃሚውን በትክክል እናገናኝ */}
      <Notepad
        isOpen={isNotepadOpen}
        onClose={() => setIsNotepadOpen(false)}
        chapterId={chapterData.chapterId}
        userId="guest_user" // በ useAuth() የሚመጣውን userId እዚህ ይተኩ
        pageIndex={currentPage} // አሁን ዳታው በየገጹ ይለያያል!
        password="user_password" // ተጠቃሚው የገባበት ፓስዎርድ
      />
    </div>
  );
}
