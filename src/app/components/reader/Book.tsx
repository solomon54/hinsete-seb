// src/app/components/reader/Book.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMediaQuery } from "react-responsive";
import { BookPage } from "./BookPage";
import { useAuth } from "@/hooks/useAuth";
import { ProgressRepository } from "@/lib/db/repository";
import { Progress } from "@/types/progress";

interface BookProps {
  pages: any[];
  chapterId: string;
}

export const Book = ({ pages, chapterId }: BookProps) => {
  const { user } = useAuth();

  const [hasMounted, setHasMounted] = useState(false);
  const isDesktopQuery = useMediaQuery({ query: "(min-width: 768px)" });
  const isDesktop = hasMounted ? isDesktopQuery : true;

  const [currentSheet, setCurrentSheet] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState<Progress | undefined>(undefined);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mount + Prepare Audio
  useEffect(() => {
    setHasMounted(true);
    audioRef.current = new Audio("/assets/audio/Parchment flip.wav");
    audioRef.current.preload = "auto";
  }, []);

  // Fetch Progress from IndexedDB
  const fetchProgress = useCallback(async () => {
    if (!user) return;

    const p = await ProgressRepository.getProgress(user.id, chapterId);

    if (p) {
      setProgress(p);

      // 🔥 Restore last page
      if (typeof p.lastPageRead === "number") {
        setCurrentSheet(p.lastPageRead);
      }
    }
  }, [user, chapterId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // 💾 Auto-save current sheet when it changes
  useEffect(() => {
    if (!user) return;

    ProgressRepository.saveLastPageRead(user.id, chapterId, currentSheet);
  }, [currentSheet, user, chapterId]);

  // Sound Controls
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

  // Navigation
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

  // Sheet Grouping
  const sheets = isDesktop
    ? pages.reduce(
        (acc: any[], _, i) =>
          i % 2 === 0
            ? [...acc, { front: pages[i], back: pages[i + 1] || null }]
            : acc,
        []
      )
    : pages.map((p) => ({ front: p, back: null }));

  if (!hasMounted) return <div className="biranna-viewport bg-[#2c2c2c]" />;

  return (
    <div className="biranna-viewport fixed inset-0 flex items-center justify-center bg-[#2c2c2c]">
      {/* 🔊 Mute Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-2 right-2 z-[10000] px-2 py-1 rounded-full shadow-lg border border-[#9b2d30]/20 text-[#9b2d30] hover:bg-[#f4ece1] transition-colors">
        {isMuted ? "🔇" : "🔊"}
      </button>

      <div
        className={`book-shell relative preserve-3d ${
          isDesktop ? "w-[90vw] h-[85vh]" : "w-[100vw] h-[100dvh]"
        }`}>
        {isDesktop && <div className="book-spine" />}

        <div className="relative w-full h-full preserve-3d">
          {sheets.map((sheet, index) => (
            <BookPage
              key={`${isDesktop ? "d" : "m"}-${index}`}
              sheetIndex={index}
              currentSheet={currentSheet}
              front={sheet.front}
              back={sheet.back}
              isDesktop={isDesktop}
              onFlipComplete={handleFlipComplete}
              chapterId={chapterId}
              currentProgress={progress}
              onProgressUpdate={fetchProgress}
            />
          ))}
        </div>

        {/* Fixed Navigation Overlay (15% Left/Right Only) */}

        {isDesktop ? (
          // Desktop → edge zones only
          <div className="absolute inset-0 flex pointer-events-none z-[10005]">
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
        ) : (
          // Mobile → full page flip (like before)
          <div className="absolute inset-0 flex z-15">
            <div className="w-1/2 h-full cursor-w-resize" onClick={prev} />
            <div className="w-1/2 h-full cursor-e-resize" onClick={next} />
          </div>
        )}
      </div>
    </div>
  );
};
