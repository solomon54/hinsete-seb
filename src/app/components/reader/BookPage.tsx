//src/app/components/reader/BookPage.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProgressRepository } from "@/lib/db/repository";
import { Progress } from "@/types/progress";
import { User } from "@/types/user";

interface ContentBlock {
  type: string;
  content: string;
  ref?: string;
  id?: string;
  url?: string;
}

interface PageProps {
  sheetIndex: number;
  currentSheet: number;
  front: { blocks: ContentBlock[] } | null;
  back: { blocks: ContentBlock[] } | null;
  isDesktop: boolean;
  onFlipComplete: () => void;
  chapterId: string;
  currentProgress: Progress | undefined;
  onProgressUpdate: () => void;
  totalChapterActions: number;
  user: User | null;
  onNext: () => void;
  onPrev: () => void;
}

export const BookPage = ({
  sheetIndex,
  currentSheet,
  front,
  back,
  isDesktop,
  onFlipComplete,
  chapterId,
  currentProgress,
  onProgressUpdate,
  totalChapterActions,
  user,
  onNext,
  onPrev,
}: PageProps) => {
  const [optimisticActions, setOptimisticActions] = useState<string[]>(
    currentProgress?.completedActions || []
  );

  useEffect(() => {
    if (currentProgress?.completedActions) {
      const dbActions = currentProgress.completedActions;
      setOptimisticActions((current) => {
        if (
          JSON.stringify(current.sort()) ===
          JSON.stringify([...dbActions].sort())
        ) {
          return current;
        }
        return dbActions;
      });
    }
  }, [currentProgress?.completedActions]);

  const handleActionToggle = async (actionId: string) => {
    if (!user) return;

    const totalActions = totalChapterActions || 1;

    setOptimisticActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId]
    );

    try {
      await ProgressRepository.toggleAction(
        user.id,
        chapterId,
        actionId,
        totalActions
      );
      onProgressUpdate?.();
    } catch {
      setOptimisticActions((prev) =>
        prev.includes(actionId)
          ? prev.filter((id) => id !== actionId)
          : [...prev, actionId]
      );
    }
  };

  const isFlipped = sheetIndex < currentSheet;
  const isCurrent = sheetIndex === currentSheet;
  const isActive = isCurrent || isFlipped;

  const zIndex = isFlipped ? 10 + sheetIndex : 100 - sheetIndex;

  const renderContent = (blocks: ContentBlock[]) => {
    return blocks.map((block, idx) => {
      const content = block.content || "";

      switch (block.type) {
        case "header":
          return (
            <h2
              key={idx}
              className="text-center mb-6 text-xl md:text-3xl font-bold text-[#9b2d30]">
              {content}
            </h2>
          );

        case "subtitle":
          return (
            <h3
              key={idx}
              className="font-bold text-lg mt-4 mb-2 text-[#9b2d30]/80 border-b border-[#9b2d30]/10 pb-1">
              {content}
            </h3>
          );

        case "quote":
          return (
            <div
              key={idx}
              className="my-6 p-4 border-l-4 border-[#9b2d30] bg-[#9b2d30]/5 italic">
              <p className="text-[11px] md:text-sm italic">"{content}"</p>
              {block.ref && (
                <cite className="block mt-2 text-right text-[10px] font-bold not-italic opacity-60">
                  — {block.ref}
                </cite>
              )}
            </div>
          );

        case "action_plan": {
          const isChecked = optimisticActions.includes(block.id || "");
          return (
            <div
              key={block.id || idx}
              onClick={(e) => {
                e.stopPropagation();
                if (block.id) handleActionToggle(block.id);
              }}
              className={`my-3 p-3 border border-dashed rounded-lg transition-all cursor-pointer select-none
                ${
                  isChecked
                    ? "bg-green-50/80 border-green-500/60"
                    : "bg-white/60 border-[#9b2d30]/30 hover:bg-[#9b2d30]/5"
                }`}>
              <div className="flex items-start gap-3 pointer-events-none">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 accent-[#9b2d30] pointer-events-none"
                  checked={isChecked}
                  readOnly
                />
                <span className="text-[13px] md:text-sm leading-tight">
                  {content}
                </span>
                {isChecked && (
                  <span className="text-green-700 ml-auto text-sm font-bold">
                    ✓
                  </span>
                )}
              </div>
            </div>
          );
        }

        default:
          const parts = content.split(/(\*\*.*?\*\*)/g);
          return (
            <p
              key={idx}
              className="mb-4 text-[13px] md:text-base leading-[1.8] text-justify">
              {parts.map((part, i) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={i} className="text-[#3d1c1d] font-bold">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          );
      }
    });
  };

  return (
    <motion.div
      drag="x"
      dragPropagation={false}
      className={`absolute top-0 h-full preserve-3d shadow-2xl ${
        isDesktop ? "left-1/2 w-1/2" : "left-0 w-full"
      }`}
      style={{
        transformOrigin: "left center",
        zIndex,
        pointerEvents: isActive ? "auto" : "none",
      }}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => {
        const threshold = 50;
        if (info.offset.x > threshold) onPrev();
        else if (info.offset.x < -threshold) onNext();
      }}
      animate={{ rotateY: isFlipped ? -180 : 0 }}
      transition={{ duration: 0.9, ease: [0.645, 0.045, 0.355, 1] }}
      onAnimationComplete={onFlipComplete}>
      {/* Front Page */}
      <div className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2]">
        {!isDesktop && isCurrent && (
          <div className="absolute inset-0 pointer-events-none z-[3] flex">
            <div
              className="w-[18%] h-full pointer-events-auto touch-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPrev();
              }}
            />
            <div className="flex-1 h-full" />
            <div
              className="w-[18%] h-full pointer-events-auto touch-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNext();
              }}
            />
          </div>
        )}

        <div className="relative flex h-full flex-col p-6 md:p-10">
          {front && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar z-10">
              {renderContent(front.blocks)}
            </div>
          )}
          <div className="text-center text-[10px] opacity-40 py-2">
            ገጽ {isDesktop ? sheetIndex * 2 + 1 : sheetIndex + 1}
          </div>
        </div>
      </div>

      {/* Back Page */}
      <div
        className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2]"
        style={{ transform: "rotateY(180deg)" }}>
        <div className="relative flex h-full flex-col p-6 md:p-10">
          {back && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mirrored-content">
              {renderContent(back.blocks)}
            </div>
          )}
          <div className="text-center text-[10px] opacity-40 py-2">
            ገጽ {isDesktop ? sheetIndex * 2 + 2 : sheetIndex + 1}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
