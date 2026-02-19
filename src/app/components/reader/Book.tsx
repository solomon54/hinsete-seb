//src/app/components/reader/Book.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMediaQuery } from "react-responsive";
import { BookPage } from "./BookPage";
// Optional: Import a Volume icon from lucide-react if you have it installed
// import { Volume2, VolumeX } from "lucide-react";

interface BookProps {
  pages: { content: string; type?: "title" | "text" }[];
}

export const Book = ({ pages }: BookProps) => {
  const [hasMounted, setHasMounted] = useState(false);
  const isDesktopQuery = useMediaQuery({ query: "(min-width: 768px)" });
  const isDesktop = hasMounted ? isDesktopQuery : true;

  const [currentSheet, setCurrentSheet] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // New Mute State
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setHasMounted(true);
    audioRef.current = new Audio("/assets/audio/Parchment flip.wav");
    audioRef.current.preload = "auto";
  }, []);

  const playSound = useCallback(() => {
    if (!audioRef.current || isMuted) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, [isMuted]);

  const stopSound = useCallback(() => {
    if (!audioRef.current) return;
    // We pause and reset so it doesn't linger
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, []);

  const handleFlipComplete = () => {
    setIsFlipping(false);
    stopSound(); // Stop the sound as soon as the page finish flipping
  };

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
      {/* Mute Toggle Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-2 right-2 z-[10000] px-1 rounded-full shadow-lg border border-[#9b2d30]/20 text-[#9b2d30] hover:bg-[#f4ece1] transition-colors">
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
            />
          ))}
        </div>

        <div
          className="absolute inset-0 flex z-[9999] pointer-events-none"
          style={{ transform: "translateZ(1000px)" }}>
          <div
            className="w-1/2 h-full cursor-w-resize pointer-events-auto"
            onClick={prev}
          />
          <div
            className="w-1/2 h-full cursor-e-resize pointer-events-auto"
            onClick={next}
          />
        </div>
      </div>
    </div>
  );
};
