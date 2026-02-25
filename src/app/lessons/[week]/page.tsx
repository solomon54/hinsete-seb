//src/app/lessons/[week]/page.tsx
"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useReader } from "@/hooks/useReader";
import { useAuth } from "@/hooks/useAuth";
import { WaxSeal } from "@/app/components/dashboard/WaxSeal";
import { Book } from "@/app/components/reader/Book";
import Notepad from "@/app/components/notes/Notepad";

// Content Imports
import chapter1 from "@/lib/contents/chapter_1.json";
import chapter2 from "@/lib/contents/chapter_2.json";
import chapter3 from "@/lib/contents/chapter_3.json";

// --- STRICT TYPES FOR YOUR BLOCK SCHEMA ---
export type BlockType =
  | "header"
  | "subtitle"
  | "text"
  | "quote"
  | "image"
  | "action_plan";

export interface ContentBlock {
  type: BlockType;
  content?: string;
  ref?: string; // For quotes
  url?: string; // For images
  caption?: string; // For images
  id?: string; // For action plans
}

export interface ChapterPage {
  pageNumber: number;
  blocks: ContentBlock[];
}

export interface ChapterData {
  chapterId: string;
  chapterNumber: number;
  title: string;
  pages: ChapterPage[];
}

// Map the imports with double-casting to ensure TS respects the Schema
const CHAPTERS: Record<number, ChapterData> = {
  1: chapter1 as unknown as ChapterData,
  2: chapter2 as unknown as ChapterData,
  3: chapter3 as unknown as ChapterData,
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  const weekNumber = parseInt(params.week as string);
  const { status, unlockDate } = useReader(weekNumber);

  const [currentPage, setCurrentPage] = useState(0);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  const chapterData = useMemo(() => CHAPTERS[weekNumber], [weekNumber]);

  // Auth Guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [user, authLoading, router, pathname]);

  const handlePageChange = (index: number) => {
    setCurrentPage(index);
  };

  if (authLoading || status === "loading" || !chapterData) {
    return (
      <div className="biranna-viewport flex items-center justify-center font-serif italic text-[#9b2d30] animate-pulse">
        ብራናው እየተከፈተ ነው...
      </div>
    );
  }

  if (status === "locked" && unlockDate) {
    return <WaxSeal unlockDate={unlockDate.toISOString()} />;
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-[#fdfaf1]">
      <Book
        pages={chapterData.pages}
        chapterId={chapterData.chapterId}
        onPageChange={handlePageChange}
      />

      <Notepad
        isOpen={isNotepadOpen}
        onClose={() => setIsNotepadOpen(false)}
        chapterId={chapterData.chapterId}
        userId={user.id}
        pageIndex={currentPage}
        password={user.id}
      />
    </div>
  );
}
