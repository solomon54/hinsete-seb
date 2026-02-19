// src/app/components/reader/BookPage.tsx

import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ProgressRepository } from "@/lib/db/repository";
import { Progress } from "@/types/progress";
import { useEffect, useState } from "react";

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

  //  Added Props (Progress System)
  chapterId: string;
  currentProgress: Progress | undefined;
  onProgressUpdate: () => void;
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
}: PageProps) => {
  const { user } = useAuth();

  // Keep track of optimistic completed actions
  const [optimisticActions, setOptimisticActions] = useState<string[]>(
    currentProgress?.completedActions || []
  );
  useEffect(() => {
    if (currentProgress?.completedActions) {
      setOptimisticActions(currentProgress.completedActions);
    }
  }, [currentProgress]);

  const [showCompletedAnimation, setShowCompletedAnimation] = useState(false);
  // Count total actions on this page (front + back)
  const totalActions = [
    ...(front?.blocks || []),
    ...(back?.blocks || []),
  ].filter((b) => b.type === "action_plan").length;

  useEffect(() => {
    if (optimisticActions.length === totalActions && totalActions > 0) {
      setShowCompletedAnimation(true);

      setTimeout(() => setShowCompletedAnimation(false), 3000);
    }
  }, [optimisticActions, totalActions]);

  const isFlipped = sheetIndex < currentSheet;
  const isCurrent = sheetIndex === currentSheet;

  //  Desktop: both visible pages should be interactive
  const isActive =
    isCurrent || (isDesktop && isFlipped && sheetIndex === currentSheet - 1);

  const zIndex = isFlipped ? sheetIndex + 1 : 100 - sheetIndex;

  //  Toggle Action Plan Progress
  const handleActionToggle = async (actionId: string) => {
    if (!user) return;

    // 1️⃣ Optimistic update
    setOptimisticActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId]
    );

    // 2️⃣ Sync to DB
    try {
      await ProgressRepository.toggleAction(
        user.id,
        chapterId,
        actionId,
        4 // totalActions, replace 4 with dynamic count if available
      );

      // 3️⃣ Update parent progress
      onProgressUpdate?.();
    } catch (err) {
      console.error("Failed to sync action:", err);

      // 4️⃣ Rollback on error
      setOptimisticActions((prev) =>
        prev.includes(actionId)
          ? prev.filter((id) => id !== actionId)
          : [...prev, actionId]
      );
    }
  };

  const renderContent = (blocks: ContentBlock[]) => {
    return blocks.map((block, idx) => {
      const content = block.content || "";

      switch (block.type) {
        case "header":
          return (
            <h2
              key={idx}
              className="page-header text-center mb-6 text-xl md:text-3xl font-bold text-[#9b2d30]">
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
              className="my-6 p-4 border-l-4 border-[#9b2d30] bg-[#9b2d30]/5 italic shadow-sm">
              <p className="text-[11px] md:text-sm leading-relaxed italic">
                "{content}"
              </p>
              {block.ref && (
                <cite className="block mt-2 text-right text-[10px] font-bold not-italic opacity-60">
                  — {block.ref}
                </cite>
              )}
            </div>
          );

        case "action_plan":
          const isChecked = optimisticActions.includes(block.id || "");

          return (
            <div
              key={idx}
              className={`my-3 p-3 border border-dashed rounded-lg transition-all
      ${
        isChecked
          ? "bg-green-200/50 border-green-400"
          : "bg-white/40 border-[#9b2d30]/30"
      }`}>
              <label className="flex items-start justify-between gap-3 cursor-pointer group">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 accent-[#9b2d30] cursor-pointer"
                    checked={isChecked} // uses optimistic state now
                    onChange={() => block.id && handleActionToggle(block.id)}
                  />

                  <span className="text-[11px] md:text-xs font-medium leading-tight">
                    {content}
                  </span>
                </div>

                {isChecked && (
                  <span className="text-green-600 font-bold text-sm">✔</span>
                )}
              </label>
            </div>
          );

        case "image":
          return (
            <div key={idx} className="my-4 text-center">
              <img
                src={block.url}
                alt={content}
                className="mx-auto rounded-md max-h-48 object-contain"
              />
              {content && (
                <p className="text-[10px] mt-1 opacity-50 italic">{content}</p>
              )}
            </div>
          );

        default:
          //  Markdown Bold Logic (Safe Split)
          const parts = content.split(/(\*\*.*?\*\*)/g);

          return (
            <p
              key={idx}
              className="page-text-column mb-4 text-[13px] md:text-base leading-[1.8] text-justify">
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
      className={`absolute top-0 h-full preserve-3d shadow-2xl ${
        isDesktop ? "left-1/2 w-1/2" : "left-0 w-full"
      }`}
      style={{
        transformOrigin: "left center",
        zIndex,
        pointerEvents: isActive ? "auto" : "none",
      }}
      animate={{ rotateY: isFlipped ? -180 : 0 }}
      transition={{ duration: 0.9, ease: [0.645, 0.045, 0.355, 1] }}
      onAnimationComplete={onFlipComplete}>
      {/* ───────── Front Side ───────── */}
      <div className="page-surface backface-hidden absolute inset-0 overflow-hidden">
        <div className="page-content-wrapper relative flex h-full flex-col p-6 md:p-10">
          {front && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
              {renderContent(front.blocks)}
              <div className="h-8" />
            </div>
          )}

          <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] italic opacity-40 bg-[#e4ecee]/80 backdrop-blur-sm py-1">
            ገጽ {isDesktop ? sheetIndex * 2 + 1 : sheetIndex + 1}
          </div>
        </div>
      </div>

      {/* ───────── Back Side ───────── */}
      <div
        className="page-surface backface-hidden absolute inset-0 overflow-hidden"
        style={{ transform: "rotateY(180deg)" }}>
        <div className="page-content-wrapper relative flex h-full flex-col p-6 md:p-10">
          {back ? (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar scroll-smooth mirrored-content">
              {renderContent(back.blocks)}
              <div className="h-10" />
            </div>
          ) : (
            <div className="w-full h-full bg-[#f4ece1]/20" />
          )}

          <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] italic opacity-40 bg-[#f4ece1]/80 backdrop-blur-sm py-1">
            ገጽ {isDesktop ? sheetIndex * 2 + 2 : sheetIndex + 1}
          </div>
        </div>
      </div>

      {/* ─── Chapter Completed Animation ─── */}
      {showCompletedAnimation && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-[20000] bg-black/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="bg-green-500 text-white font-bold text-2xl md:text-4xl p-6 md:p-12 rounded-xl shadow-lg text-center max-w-[90vw] w-full">
            🎉 Chapter Completed! 🎉
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
