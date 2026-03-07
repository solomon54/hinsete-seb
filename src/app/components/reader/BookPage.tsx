// src/app/components/reader/BookPage.tsx
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

        case "poem":
          return (
            <div
              key={idx}
              className="my-10 px-6 py-8 bg-[#9b2d30]/[0.04] border-x-2 border-[#9b2d30]/10 rounded-3xl relative overflow-hidden">
              <span className="absolute -top-2 -left-1 text-4xl md:text-7xl text-[#9b2d30]/5 font-serif select-none">
                “
              </span>
              <p className="text-[13px] md:text-[15px] leading-[2.2] text-[#3d1c1d]/90 font-serif whitespace-pre-line italic text-center tracking-wide drop-shadow-[0_0.5px_0.5px_rgba(155,45,48,0.1)]">
                {renderRichText(block.content || "")}
              </p>
              <span className="absolute -bottom-6 -right-1 text-4xl md:text-7xl text-[#9b2d30]/5 font-serif select-none">
                ”
              </span>
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

        // src/app/components/reader/BookPage.tsx

        case "action_plan": {
          const isChecked = optimisticActions.includes(block.id || "");
          return (
            <div
              key={block.id || idx}
              onClick={(e) => {
                e.stopPropagation();
                if (block.id) handleActionToggle(block.id);
              }}
              className={`my-3 p-3 border border-dashed rounded-lg transition-all select-none relative z-9998 pointer-events-auto cursor-pointer
        ${
          isChecked
            ? "bg-green-50/80 border-green-500/60"
            : "bg-white/60 border-[#9b2d30]/30 hover:bg-[#9b2d30]/5"
        }`}
              style={{ transform: "translateZ(10px)" }}>
              <div className="flex items-start gap-3 pointer-events-none">
                <input
                  placeholder="Action"
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

        case "image": {
          // Check if this is the action-plan image to apply "push" styling
          const isActionPlanImage =
            block.url?.includes("action-plan") ||
            block.caption?.includes("ተግባር");

          return (
            <div
              key={idx}
              className={`flex flex-col items-center w-full ${
                isActionPlanImage ? "my-2" : "my-6"
              }`}>
              <img
                src={block.url}
                alt={block.content || "divider"}
                className={`rounded-lg shadow-sm border border-[#9b2d30]/10 object-cover ${
                  isActionPlanImage
                    ? "w-[95%] h-32 opacity-75"
                    : "w-full h-auto"
                }`}
              />
              {block.caption && (
                <p className="text-center text-[10px] mt-1 italic opacity-50 font-serif">
                  {block.caption}
                </p>
              )}
            </div>
          );
        }

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
      // THE FIX: We force shadow to none on mobile to stop it from blocking the UI
      className={`absolute top-0 h-full preserve-3d ${
        isDesktop ? "left-1/2 w-1/2 shadow-2xl" : "left-0 w-full shadow-none"
      }`}
      style={{
        transformOrigin: "left center",
        zIndex,
        pointerEvents:
          isCurrent || sheetIndex === currentSheet - 1 ? "auto" : "none",
      }}
      initial={false}
      animate={{
        rotateY: isFlipped ? -180 : 0,
        x: isFlipped ? -0.2 : 0,
      }}
      transition={{ duration: 0.9, ease: [0.645, 0.045, 0.355, 1] }}
      onAnimationComplete={onFlipComplete}>
      {/* FRONT SIDE */}
      <div
        className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2]"
        style={{ boxShadow: !isDesktop ? "none" : undefined }}>
        {/* MOBILE OVERLAY TAP ZONES - Reduced to 15% to give even more room for checkboxes */}
        {!isDesktop && isCurrent && (
          <div className="absolute inset-0 pointer-events-none z-[50] flex">
            <div
              className="w-[15%] h-full pointer-events-auto touch-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPrev();
              }}
            />
            <div className="flex-1 h-full" />
            <div
              className="w-[15%] h-full pointer-events-auto touch-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNext();
              }}
            />
          </div>
        )}

        {/* This shadow is only for Desktop "spine" effect */}
        {isDesktop && (
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-30" />
        )}

        <div className="relative flex h-full flex-col p-6 md:p-12 z-10">
          {front && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-20">
              {renderContent(front.blocks)}
            </div>
          )}
          <div className="text-center text-[10px] opacity-40 py-2 font-serif italic">
            ገጽ {isDesktop ? sheetIndex * 2 + 1 : sheetIndex + 1}
          </div>
        </div>
      </div>

      {/* BACK SIDE */}
      <div
        className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2]"
        style={{
          transform: "rotateY(180deg)",
          boxShadow: !isDesktop ? "none" : undefined,
        }}>
        {isDesktop && (
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-30" />
        )}

        <div className="relative flex h-full flex-col p-6 md:p-12 z-10">
          {back && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mirrored-content relative z-20">
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
