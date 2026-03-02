//src/app/components/reader/BookPage.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ProgressRepository } from "@/lib/db/repository";
import { Progress } from "@/types/progress";
import { User } from "@/types/user";

interface ContentBlock {
  type: string;
  content?: string;
  items?: string[];
  ordered?: boolean;
  ref?: string;
  id?: string;
  url?: string;
  caption?: string;
  label?: string; // For signed-line
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
      setOptimisticActions(currentProgress?.completedActions || []);
    }
  };

  // Helper to handle **bold** text consistently
  const renderRichText = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="text-[#3d1c1d] font-extrabold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        part
      )
    );
  };

  const isFlipped = sheetIndex < currentSheet;
  const isCurrent = sheetIndex === currentSheet;
  const isActive = isCurrent || isFlipped;
  const zIndex = isFlipped ? 10 + sheetIndex : 100 - sheetIndex;

  const renderContent = (blocks: ContentBlock[]) => {
    return blocks.map((block, idx) => {
      switch (block.type) {
        case "header":
          return (
            <h2
              key={idx}
              className="text-center mb-6 text-xl md:text-3xl font-bold text-[#9b2d30]">
              {block.content}
            </h2>
          );

        case "subtitle":
          return (
            <h3
              key={idx}
              className="font-bold text-base md:text-lg mt-6 mb-2 text-[#9b2d30]/80 border-b border-[#9b2d30]/10 pb-1 font-serif uppercase tracking-wide">
              {block.content}
            </h3>
          );

        case "quote":
          return (
            <div
              key={idx}
              className="my-6 p-4 border-l-4 border-[#9b2d30] bg-[#9b2d30]/5 italic">
              <p className="text-[12px] md:text-sm italic leading-relaxed">
                "{block.content}"
              </p>
              {block.ref && (
                <cite className="block mt-2 text-right text-[10px] font-bold not-italic opacity-60">
                  — {block.ref}
                </cite>
              )}
            </div>
          );

        case "list": {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag key={idx} className="mb-4 space-y-3 ml-1">
              {block.items?.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-[13px] md:text-base leading-snug">
                  <span className="text-[#9b2d30] font-bold min-w-[1rem]">
                    {block.ordered ? `${i + 1}.` : "•"}
                  </span>
                  <span className="flex-1">{renderRichText(item)}</span>
                </li>
              ))}
            </ListTag>
          );
        }

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
                  className="mt-1 w-4 h-4 accent-[#9b2d30]"
                  checked={isChecked}
                  readOnly
                />
                <span className="text-[13px] md:text-sm leading-tight">
                  {renderRichText(block.content || "")}
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

        case "signed-line":
          return (
            <div key={idx} className="my-4 group flex flex-col">
              <div className="flex flex-wrap items-end gap-x-2">
                <span className="text-[12px] md:text-sm font-serif text-gray-800 leading-tight">
                  {renderRichText(block.label || "")}
                </span>
                <div className="flex-1 min-w-[120px] border-b-[1px] md:border-b-2 border-[#9b2d30]/20 pb-0.5 h-6 bg-[#9b2d30]/[0.01] relative">
                  <span className="absolute right-0 -bottom-3 text-[6px] uppercase opacity-20 font-sans tracking-tighter">
                    ማኅተም / Sign
                  </span>
                </div>
              </div>
            </div>
          );

        case "image":
          return (
            <div key={idx} className="my-6 flex flex-col items-center">
              <img
                src={block.url}
                alt={block.content}
                className="w-full rounded-lg shadow-sm border border-[#9b2d30]/10"
              />
              {block.caption && (
                <p className="text-center text-[10px] mt-2 italic opacity-60 font-serif">
                  {block.caption}
                </p>
              )}
            </div>
          );

        case "spacer":
          return <div key={idx} className="h-4 md:h-8" />;

        default:
          return (
            <p
              key={idx}
              className="mb-4 text-[13px] md:text-base leading-[1.8] text-justify text-gray-900/90">
              {renderRichText(block.content || "")}
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
      onDragEnd={(_, info) => {
        const threshold = 50;
        if (info.offset.x > threshold) onPrev();
        else if (info.offset.x < -threshold) onNext();
      }}
      animate={{ rotateY: isFlipped ? -180 : 0 }}
      transition={{ duration: 0.9, ease: [0.645, 0.045, 0.355, 1] }}
      onAnimationComplete={onFlipComplete}>
      <div className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2]">
        {!isDesktop && isCurrent && (
          <div className="absolute inset-0 pointer-events-none z-[3] flex">
            <div
              className="w-[20%] h-full pointer-events-auto touch-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPrev();
              }}
            />
            <div className="flex-1 h-full" />
            <div
              className="w-[20%] h-full pointer-events-auto touch-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNext();
              }}
            />
          </div>
        )}
        <div className="relative flex h-full flex-col p-6 md:p-12">
          {front && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar z-10">
              {renderContent(front.blocks)}
            </div>
          )}
          <div className="text-center text-[10px] opacity-40 py-2 font-serif italic">
            ገጽ {isDesktop ? sheetIndex * 2 + 1 : sheetIndex + 1}
          </div>
        </div>
      </div>
      <div
        className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2]"
        style={{ transform: "rotateY(180deg)" }}>
        <div className="relative flex h-full flex-col p-6 md:p-12">
          {back && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mirrored-content z-10">
              {renderContent(back.blocks)}
            </div>
          )}
          <div className="text-center text-[10px] opacity-40 py-2 font-serif italic">
            ገጽ {isDesktop ? sheetIndex * 2 + 2 : sheetIndex + 1}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
