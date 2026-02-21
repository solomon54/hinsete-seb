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

/**
 * 📖 Book Component
 *
 * The core reader engine for the Biranna manuscript experience.
 * Handles page navigation, progress restoration, auto-saving,
 * audio effects, and notepad integration.
 *
 * Key Features:
 * - Responsive layout for desktop/mobile (sheet grouping)
 * - Optimistic progress restoration from IndexedDB
 * - Debounced auto-save to prevent overwrite during load
 * - Gesture-based navigation with sound effects
 * - Notepad with page-jump functionality
 */
export const Book = ({ pages, chapterId }: BookProps) => {
  // 🛡️ Authentication & Loading State
  const { user, loading } = useAuth();

  // 📱 Responsive Mounting
  const [hasMounted, setHasMounted] = useState(false);
  const isDesktopQuery = useMediaQuery({ query: "(min-width: 768px)" });
  const isDesktop = hasMounted ? isDesktopQuery : true;

  // 📄 Reader State
  const [currentSheet, setCurrentSheet] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState<Progress | undefined>(undefined);

  // 📝 Notepad State
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  // 🔊 Audio Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔄 Restoration Flag (Prevents save during initial load)
  const isRestoring = useRef(true);

  // 📊 Memoized Computations
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

  // 🎵 Sound Controls
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

  // 🔄 Flip Completion Handler
  const handleFlipComplete = () => {
    setIsFlipping(false);
    stopSound();
  };

  // 📥 Fetch & Restore Progress
  const fetchProgress = useCallback(async () => {
    if (!user) return;
    const p = await ProgressRepository.getProgress(user.id, chapterId);
    if (p) {
      setProgress(p);
      if (typeof p.lastPageRead === "number" && currentSheet === 0) {
        const restoredSheet = isDesktop
          ? Math.floor(p.lastPageRead / 2)
          : p.lastPageRead;
        setCurrentSheet(restoredSheet);
      }
    }
    // Restoration complete: Enable saving after a short delay
    setTimeout(() => {
      isRestoring.current = false;
    }, 500);
  }, [user, chapterId, isDesktop]);

  // 💾 Auto-Save Progress (Single Effect, Guarded by Restoration Flag)
  useEffect(() => {
    if (!user || loading) return;
    if (isRestoring.current) return;

    const savePage = async () => {
      console.log("💾 AUTO-SAVING POSITION:", currentSheet);
      await ProgressRepository.saveLastPageRead(
        user.id,
        chapterId,
        currentSheet
      );
    };

    savePage();
  }, [currentSheet, user, chapterId, loading]);

  // 🏗️ Component Mounting & Audio Setup
  useEffect(() => {
    setHasMounted(true);
    audioRef.current = new Audio("/assets/audio/Parchment flip.wav");
    audioRef.current.preload = "auto";
  }, []);

  // 🔄 Load Progress on Mount/User Change
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // ➡️ Navigation Handlers
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

  // 📖 Page Jump Function (For Notepad History Navigation)
  const goToPage = (pageIndex: number) => {
    const targetSheet = isDesktop ? Math.floor(pageIndex / 2) : pageIndex;
    setCurrentSheet(targetSheet);
  };

  // 🖋️ Note Saving Handler
  const handleSaveNote = async (text: string) => {
    if (!user) return;
    console.log("Note Saved:", text);
  };

  // ⏳ Loading & Mounting Guards
  if (!hasMounted) return <div className="biranna-viewport bg-[#2c2c2c]" />;

  // if (loading) {
  //   return (
  //     <div className="biranna-viewport bg-[#2c2c2c] flex items-center justify-center text-white">
  //       Loading your journey...
  //     </div>
  //   );
  // }

  // 🎨 Render the Manuscript
  return (
    <div className="biranna-viewport fixed inset-0 flex items-center justify-center bg-[#2c2c2c]">
      {/* 🔇 Mute Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-2 right-2 z-[10000] px-2 py-1 rounded-full shadow-lg border border-[#9b2d30]/20 text-[#9b2d30] hover:bg-[#f4ece1] transition-colors">
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* 📖 Book Shell */}
      <div
        className={`book-shell relative preserve-3d ${
          isDesktop ? "w-[90vw] h-[85vh]" : "w-[100vw] h-[100dvh]"
        }`}>
        {isDesktop && <div className="book-spine" />}

        <div className="relative w-full h-full preserve-3d">
          {sheets.map((sheet, index) => (
            <BookPage
              key={`${isDesktop ? "d" : "m"}-${index}`}
              user={user} // Pass user explicitly for child access
              sheetIndex={index}
              currentSheet={currentSheet}
              front={sheet.front}
              back={sheet.back}
              isDesktop={isDesktop}
              onFlipComplete={handleFlipComplete}
              chapterId={chapterId}
              currentProgress={progress}
              onProgressUpdate={fetchProgress}
              totalChapterActions={totalActionsInChapter}
            />
          ))}
        </div>

        {/* 🖱️ Navigation Overlay */}
        {isDesktop ? (
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
          <div className="absolute inset-0 flex z-15">
            <div className="w-1/2 h-full cursor-w-resize" onClick={prev} />
            <div className="w-1/2 h-full cursor-e-resize" onClick={next} />
          </div>
        )}
      </div>

      {/* ✍️ Notepad Toggle */}
      <button
        onClick={() => setIsNotepadOpen(true)}
        className="fixed bottom-6 right-6 z-9987 w-14 h-14 bg-[#9b2d30] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl active:scale-90 transition-transform">
        ✍️
      </button>

      {/* 📝 Notepad Drawer (Guarded by User) */}
      {user && (
        <Notepad
          isOpen={isNotepadOpen}
          onClose={() => setIsNotepadOpen(false)}
          userId={user.id}
          password={user.id}
          chapterId={chapterId}
          pageIndex={isDesktop ? currentSheet * 2 : currentSheet}
          onSave={handleSaveNote}
          onGoToPage={goToPage} // Enable page jumping from notepad history
        />
      )}
    </div>
  );
};
