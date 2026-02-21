// src/app/components/reader/Book.tsx
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import { BookPage } from "./BookPage";
import { useAuth } from "@/hooks/useAuth";
import { ProgressRepository } from "@/lib/db/repository";
import { Progress } from "@/types/progress";
import Notepad from "../notes/Notepad";

interface BookProps {
  pages: any[];
  chapterId: string;
}

export const Book = ({ pages, chapterId }: BookProps) => {
  const { user, loading } = useAuth();

  const [hasMounted, setHasMounted] = useState(false);
  const isDesktopQuery = useMediaQuery({ query: "(min-width: 768px)" });
  const isDesktop = hasMounted ? isDesktopQuery : true;

  const [currentSheet, setCurrentSheet] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState<Progress | undefined>(undefined);

  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRestoring = useRef(true);

  const totalActionsInChapter = useMemo(() => {
    return pages.reduce((acc, page) => {
      return (
        acc +
        (page.blocks?.filter((b: any) => b.type === "action_plan").length || 0)
      );
    }, 0);
  }, [pages]);

  const sheets = useMemo(() => {
    return isDesktop
      ? pages.reduce(
          (acc: any[], _, i) =>
            i % 2 === 0
              ? [...acc, { front: pages[i], back: pages[i + 1] || null }]
              : acc,
          []
        )
      : pages.map((p) => ({ front: p, back: null }));
  }, [pages, isDesktop]);

  const playSound = useCallback(() => {
    if (!audioRef.current || isMuted) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, [isMuted]);

  const stopSound = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  const handleFlipComplete = () => {
    setIsFlipping(false);
    stopSound();
  };

  const fetchProgress = useCallback(
    async (isInitialLoad = false) => {
      if (!user) return;
      const p = await ProgressRepository.getProgress(user.id, chapterId);
      if (!p) return;

      setProgress(p);

      if (isInitialLoad && typeof p.lastPageRead === "number") {
        const restoredSheet = isDesktop
          ? Math.floor(p.lastPageRead / 2)
          : p.lastPageRead;
        setCurrentSheet(restoredSheet);
      }

      setTimeout(() => {
        isRestoring.current = false;
      }, 500);
    },
    [user, chapterId, isDesktop]
  );

  useEffect(() => {
    if (!user || loading || isRestoring.current) return;

    const absolutePage = isDesktop ? currentSheet * 2 : currentSheet;
    ProgressRepository.saveLastPageRead(user.id, chapterId, absolutePage);
  }, [currentSheet, user, chapterId, loading, isDesktop]);

  useEffect(() => {
    setHasMounted(true);
    audioRef.current = new Audio("/assets/audio/Parchment flip.wav");
    audioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    fetchProgress(true);
  }, [fetchProgress]);

  const next = () => {
    if (isFlipping || currentSheet >= sheets.length - 1) return;
    setIsFlipping(true);
    playSound();
    setCurrentSheet((prev) => prev + 1);
  };

  const prev = () => {
    if (isFlipping || currentSheet <= 0) return;
    setIsFlipping(true);
    playSound();
    setCurrentSheet((prev) => prev - 1);
  };

  const goToPage = (pageIndex: number) => {
    const targetSheet = isDesktop ? Math.floor(pageIndex / 2) : pageIndex;
    setCurrentSheet(targetSheet);
  };

  const handleSaveNote = async (text: string) => {
    if (!user) return;
    // Implement note saving logic here when ready
  };

  if (!hasMounted) return <div className="biranna-viewport bg-[#2c2c2c]" />;

  return (
    <div className="biranna-viewport fixed inset-0 flex items-center justify-center bg-[#2c2c2c]">
      {/* Mute Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-2 right-2 z-[10000] px-2 py-1 rounded-full shadow-lg border border-[#9b2d30]/20 text-[#9b2d30] hover:bg-[#f4ece1] transition-colors">
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* Book Shell */}
      <div
        className={`book-shell relative preserve-3d ${
          isDesktop ? "w-[90vw] h-[85vh]" : "w-[100vw] h-[100dvh]"
        }`}>
        {isDesktop && <div className="book-spine" />}

        <div className="relative w-full h-full preserve-3d">
          {sheets.map((sheet, index) => (
            <BookPage
              key={`${isDesktop ? "d" : "m"}-${index}`}
              user={user}
              sheetIndex={index}
              currentSheet={currentSheet}
              front={sheet.front}
              back={sheet.back}
              isDesktop={isDesktop}
              onFlipComplete={handleFlipComplete}
              chapterId={chapterId}
              currentProgress={progress}
              onProgressUpdate={() => fetchProgress(false)}
              totalChapterActions={totalActionsInChapter}
              onNext={next}
              onPrev={prev}
            />
          ))}
        </div>

        {/* Desktop-only navigation overlay */}
        {isDesktop && (
          <div className="absolute inset-0 flex pointer-events-none z-30">
            <div
              className="w-[20%] h-full cursor-w-resize pointer-events-auto"
              onClick={prev}
            />
            <div className="flex-1 h-full" />
            <div
              className="w-[20%] h-full cursor-e-resize pointer-events-auto"
              onClick={next}
            />
          </div>
        )}
      </div>

      {/* Notepad Toggle */}
      <button
        onClick={() => setIsNotepadOpen(true)}
        className="fixed bottom-6 right-6 z-[9987] w-14 h-14 bg-[#9b2d30] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl active:scale-90 transition-transform">
        ✍️
      </button>

      {user && (
        <Notepad
          isOpen={isNotepadOpen}
          onClose={() => setIsNotepadOpen(false)}
          userId={user.id}
          password={user.id}
          chapterId={chapterId}
          pageIndex={isDesktop ? currentSheet * 2 : currentSheet}
          onSave={handleSaveNote}
          onGoToPage={goToPage}
        />
      )}
    </div>
  );
};
