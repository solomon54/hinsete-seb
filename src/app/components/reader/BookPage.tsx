// src/app/components/reader/BookPage.tsx
"use client";

import { motion } from "framer-motion";

interface PageProps {
  sheetIndex: number;
  currentSheet: number;
  front: { content: string; type?: "title" | "text" } | null;
  back: { content: string; type?: "title" | "text" } | null;
  isDesktop: boolean;
  onFlipComplete: () => void;
}

export const BookPage = ({
  sheetIndex,
  currentSheet,
  front,
  back,
  isDesktop,
  onFlipComplete,
}: PageProps) => {
  const isFlipped = sheetIndex < currentSheet;
  const isCurrent = sheetIndex === currentSheet;

  const zIndex = isFlipped ? sheetIndex + 1 : 100 - sheetIndex;

  return (
    <motion.div
      className={`absolute top-0 h-full preserve-3d shadow-2xl ${
        isDesktop ? "left-1/2 w-1/2" : "left-0 w-full"
      }`}
      style={{
        transformOrigin: "left center",
        zIndex,
        pointerEvents:
          isCurrent ||
          (isDesktop && isFlipped && sheetIndex === currentSheet - 1)
            ? "auto"
            : "none",
      }}
      initial={false}
      animate={{ rotateY: isFlipped ? -180 : 0 }}
      transition={{
        duration: 0.9,
        ease: [0.645, 0.045, 0.355, 1],
      }}
      onAnimationComplete={onFlipComplete}>
      {/* ─── Front Side ─── */}
      <div className="page-surface backface-hidden absolute inset-0 border-none">
        <div className="page-content-wrapper flex h-full flex-col !p-3 md:!p-8">
          {front && (
            <>
              <div
                className={`grow overflow-y-auto pt-2 ${
                  front.type === "title"
                    ? "page-header text-lg md:text-3xl"
                    : "page-text-column text-[11px] leading-snug md:text-base lg:text-lg md:leading-relaxed"
                }`}>
                {front.content}
              </div>

              <div className="page-number pb-1 text-[9px] md:text-xs italic opacity-40">
                {isDesktop ? sheetIndex * 2 + 1 : sheetIndex + 1}
              </div>
            </>
          )}
          <div className="absolute inset-y-0 right-0 w-4 bg-linear-to-l from-black/5 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ─── Back Side ─── */}
      <div
        className="page-surface backface-hidden absolute inset-0 border-none"
        style={{ transform: "rotateY(180deg)" }}>
        <div className="page-content-wrapper flex h-full flex-col mirrored-content p-3! md:p-8!">
          {back ? (
            <>
              <div
                className={`grow overflow-y-auto pt-2 ${
                  back.type === "title"
                    ? "page-header text-lg md:text-3xl"
                    : "page-text-column text-[11px] leading-snug md:text-base lg:text-lg md:leading-relaxed"
                }`}>
                {back.content}
              </div>

              <div className="page-number pb-1 text-[9px] md:text-xs italic opacity-40">
                {isDesktop ? sheetIndex * 2 + 2 : ""}
              </div>
            </>
          ) : (
            <div className="w-full h-full" />
          )}
          <div className="absolute inset-y-0 left-0 w-6 bg-linear-to-r from-black/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </motion.div>
  );
};
