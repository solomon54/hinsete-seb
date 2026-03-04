//src/components/reader/BookPage.tsx
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useMediaQuery } from "react-responsive";
import { BookPage } from "./BookPage";
import { useAuth } from "@/hooks/useAuth";
import { ProgressRepository } from "@/lib/db/repository";
import { Progress } from "@/types/progress";
import Notepad from "../notes/Notepad";
import { useSearchParams } from "next/navigation";
import { CoverPage } from "./CoverPage";
import { GlossaryPage } from "./GlossaryPage";

interface BookProps {
  pages: any[];
  chapterId: string;
  onPageChange?: (index: number) => void;
}

export const Book = ({ pages, chapterId, onPageChange }: BookProps) => {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const initialPageOverride = searchParams.get("page");

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

  // Count total action plans in chapter (used in BookPage probably)
  const totalActionsInChapter = useMemo(() => {
    return pages.reduce((acc, page) => {
      return (
        acc +
        (page.blocks?.filter((b: any) => b.type === "action_plan").length || 0)
      );
    }, 0);
  }, [pages]);

  // ────────────────────────────────────────────────
  // Progress Restoration & URL deep linking (?page=X)
  // ────────────────────────────────────────────────
  const fetchProgress = useCallback(
    async (isInitialLoad = false) => {
      if (!user) return;

      const p = await ProgressRepository.getProgress(user.id, chapterId);
      if (!p) {
        isRestoring.current = false;
        return;
      }

      setProgress(p);

      // Restore from DB **only** if no URL override is present
      if (
        isInitialLoad &&
        !initialPageOverride &&
        typeof p.lastPageRead === "number"
      ) {
        const restoredSheet = isDesktop
          ? Math.floor(p.lastPageRead / 2)
          : p.lastPageRead;
        setCurrentSheet(restoredSheet);
      }

      // Give React time to settle before allowing auto-save
      setTimeout(() => {
        isRestoring.current = false;
      }, 500);
    },
    [user, chapterId, isDesktop, initialPageOverride]
  );

  // Handle ?page= deep link (takes priority over DB progress)
  useEffect(() => {
    if (!initialPageOverride || !hasMounted) return;

    const pageIdx = parseInt(initialPageOverride, 10) - 1;
    if (!isNaN(pageIdx) && pageIdx >= 0 && pageIdx < pages.length) {
      const targetSheet = isDesktop ? Math.floor(pageIdx / 2) : pageIdx;
      setCurrentSheet(targetSheet);
      isRestoring.current = false;
    }
  }, [initialPageOverride, hasMounted, isDesktop, pages.length]);

  // ────────────────────────────────────────────────
  // Sheet preparation (desktop = 2 pages/sheet, mobile = 1)
  // ────────────────────────────────────────────────
  const sheets = useMemo(() => {
    if (isDesktop) {
      return pages.reduce(
        (acc: any[], _, i) =>
          i % 2 === 0
            ? [...acc, { front: pages[i], back: pages[i + 1] || null }]
            : acc,
        []
      );
    }
    return pages.map((p) => ({ front: p, back: null }));
  }, [pages, isDesktop]);

  // ────────────────────────────────────────────────
  // Audio handling
  // ────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────
  // Auto-save progress (debounced by isRestoring flag)
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!user || loading || isRestoring.current) return;

    const absolutePage = isDesktop ? currentSheet * 2 : currentSheet;
    ProgressRepository.saveLastPageRead(user.id, chapterId, absolutePage);
  }, [currentSheet, user, chapterId, loading, isDesktop]);

  // ────────────────────────────────────────────────
  // Initialization
  // ────────────────────────────────────────────────
  useEffect(() => {
    setHasMounted(true);
    audioRef.current = new Audio("/assets/audio/parchment flip.wav");
    audioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    fetchProgress(true);
  }, [fetchProgress]);

  useEffect(() => {
    if (onPageChange) {
      const absolutePage = isDesktop ? currentSheet * 2 : currentSheet;
      onPageChange(absolutePage);
    }
  }, [currentSheet, isDesktop, onPageChange]);

  // ────────────────────────────────────────────────
  // Navigation handlers
  // ────────────────────────────────────────────────
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
    // TODO: implement real encrypted note saving (should call your Notes repository)
    // This will be connected later with AES + IndexedDB
  };

  if (!hasMounted) {
    return <div className="biranna-viewport bg-[#2c2c2c]" />;
  }

  return (
    <div className="biranna-viewport fixed inset-0 flex items-center justify-center bg-[#2c2c2c]">
      {/* Mute Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-2 right-2 z-1000 px-2 py-1 rounded-full shadow-lg border border-[#9b2d30]/20 text-[#9b2d30] hover:bg-[#f4ece1] transition-colors">
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* Main book container */}
      <div
        className={`book-shell relative preserve-3d transition-all duration-500 w-full h-full`}>
        {isDesktop && <div className="book-spine" />}

        <div className="relative w-full h-full preserve-3d">
          {sheets.map((sheet, index) => {
            // 1. Define the key separately
            const pageKey = `${isDesktop ? "d" : "m"}-${index}`;

            // 2. Remove 'key' from this object
            const pageProps = {
              user: user,
              sheetIndex: index,
              currentSheet: currentSheet,
              front: sheet.front,
              back: sheet.back,
              isDesktop: isDesktop,
              onFlipComplete: handleFlipComplete,
              onNext: next,
              onPrev: prev,
            };

            // 3. Pass key directly to the components
            if (chapterId === "ch_0") {
              return <CoverPage key={pageKey} {...pageProps} />;
            }

            if (chapterId === "ch_6") {
              return <GlossaryPage key={pageKey} {...pageProps} />;
            }

            // Default logic for Chapters 1-5
            return (
              <BookPage
                key={pageKey} // Explicitly passed here
                {...pageProps}
                chapterId={chapterId}
                currentProgress={progress}
                onProgressUpdate={() => fetchProgress(false)}
                totalChapterActions={totalActionsInChapter}
              />
            );
          })}
        </div>

        {/* Desktop: click left/right edges to flip */}
        {isDesktop && (
          <div className="absolute inset-0 flex pointer-events-none z-[500]">
            {/* Increased z to 500 to clear any Glossary stacking */}
            <div
              className="w-[20%] h-full cursor-w-resize pointer-events-auto bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            />
            <div className="flex-1 h-full" />
            <div
              className="w-[20%] h-full cursor-e-resize pointer-events-auto bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            />
          </div>
        )}
      </div>

      {/* Floating Notepad button – bottom right */}
      <button
        onClick={() => setIsNotepadOpen(true)}
        className="fixed bottom-6 right-6 z-[9987] w-14 h-14 bg-[#9b2d30] text-white rounded-full shadow-2xl flex items-center justify-center text-2xl active:scale-90 transition-transform hover:bg-[#7a2326]"
        aria-label="Open reflection notepad">
        ✍️
      </button>

      {/* Notepad Drawer / Modal */}
      {user && (
        <Notepad
          isOpen={isNotepadOpen}
          onClose={() => setIsNotepadOpen(false)}
          userId={user.id}
          password={user.id} // ← most likely placeholder → should be removed or replaced
          chapterId={chapterId}
          pageIndex={isDesktop ? currentSheet * 2 : currentSheet}
          onSave={handleSaveNote}
          onGoToPage={goToPage}
        />
      )}
    </div>
  );
};
