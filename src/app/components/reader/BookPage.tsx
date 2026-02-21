"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { ProgressRepository } from "@/lib/db/repository";
import { Progress } from "@/types/progress";
import { useEffect, useState, useRef } from "react";
import { User } from "@/types/user";

interface ContentBlock {
  type: string;
  content: string;
  ref?: string;
  id?: string;
  url?: string;
}

// 1. Add 'user' to the Interface
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
}

// 2. Add 'user' to the Destructuring
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
}: PageProps) => {
  // ──────────────────────────────────────────────────────────
  // 1. Optimistic State with Protection against Overwrites
  // ──────────────────────────────────────────────────────────
  const [optimisticActions, setOptimisticActions] = useState<string[]>(
    currentProgress?.completedActions || []
  );

  // Sync only when the database version actually changes to prevent flickering
  useEffect(() => {
    if (currentProgress?.completedActions) {
      const dbActions = currentProgress.completedActions;
      setOptimisticActions((currentLocal) => {
        // If local matches DB, don't trigger a re-render
        if (
          JSON.stringify(currentLocal.sort()) ===
          JSON.stringify([...dbActions].sort())
        ) {
          return currentLocal;
        }
        return dbActions;
      });
    }
  }, [currentProgress?.completedActions]);

  // ──────────────────────────────────────────────────────────
  // 2. Toggle Logic with Full Rollback & Logging
  // ──────────────────────────────────────────────────────────
  // Inside BookPage.tsx
  useEffect(() => {
    console.log("DEBUG: BookPage received user prop:", user?.id || "NULL");
  }, [user]);

  const handleActionToggle = async (actionId: string) => {
    if (!user) {
      console.warn("Toggle ignored: No user found.");
      return;
    }

    console.log(
      `[Action] Toggling ID: ${actionId} | Total in Chapter: ${totalChapterActions}`
    );

    const totalActions = totalChapterActions || 1;

    // 1️⃣ Optimistic update (UI changes immediately)
    setOptimisticActions((prev) =>
      prev.includes(actionId)
        ? prev.filter((id) => id !== actionId)
        : [...prev, actionId]
    );

    try {
      // 2️⃣ Sync to IndexedDB
      await ProgressRepository.toggleAction(
        user.id,
        chapterId,
        actionId,
        totalActions
      );

      // 3️⃣ Tell parent to refresh currentProgress
      onProgressUpdate?.();
    } catch (err) {
      console.error("Critical Sync Failure:", err);

      // 4️⃣ Rollback on error (Reverse the UI state)
      setOptimisticActions((prev) =>
        prev.includes(actionId)
          ? prev.filter((id) => id !== actionId)
          : [...prev, actionId]
      );
    }
  };

  // ──────────────────────────────────────────────────────────
  // 3. Logic & Z-Index
  // ──────────────────────────────────────────────────────────
  const isFlipped = sheetIndex < currentSheet;
  const isCurrent = sheetIndex === currentSheet;

  // Ensure visible pages are ALWAYS interactive
  const isActive = isCurrent || isFlipped;

  // High Z-Index to stay above Book navigation overlays
  const zIndex = isFlipped ? 20000 + sheetIndex : 30000 - sheetIndex;

  // ──────────────────────────────────────────────────────────
  // 4. Content Renderer
  // ──────────────────────────────────────────────────────────
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

        case "action_plan":
          const isChecked = optimisticActions.includes(block.id || "");
          return (
            <div
              key={block.id || idx}
              onClick={() => block.id && handleActionToggle(block.id)}
              className={`my-3 p-3 border border-dashed rounded-lg transition-all cursor-pointer hover:bg-[#9b2d30]/5
                ${
                  isChecked
                    ? "bg-green-100 border-green-500"
                    : "bg-white/40 border-[#9b2d30]/30"
                }`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 accent-[#9b2d30]"
                  checked={isChecked}
                  readOnly // Controlled by the parent div's onClick
                />
                <span className="text-[11px] md:text-xs font-medium leading-tight">
                  {content}
                </span>
                {isChecked && (
                  <span className="text-green-600 font-bold ml-auto">✔</span>
                )}
              </div>
            </div>
          );

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
      {/* Front Page */}
      <div className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2]">
        <div className="relative flex h-full flex-col p-6 md:p-10">
          {front && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
