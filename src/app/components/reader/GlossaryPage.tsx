"use client";

import { motion } from "framer-motion";
import { BlockType } from "@/app/lessons/[week]/page";

interface GlossaryBlock {
  type: BlockType | "definition";
  term?: string; // The Amharic word
  content?: string; // The meaning
}

interface GlossaryPageProps {
  sheetIndex: number;
  currentSheet: number;
  front: { blocks: GlossaryBlock[] } | null;
  back: { blocks: GlossaryBlock[] } | null;
  isDesktop: boolean;
  onFlipComplete: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const GlossaryPage = ({
  sheetIndex,
  currentSheet,
  front,
  back,
  isDesktop,
  onFlipComplete,
  onNext,
  onPrev,
}: GlossaryPageProps) => {
  const isFlipped = sheetIndex < currentSheet;
  const isCurrent = sheetIndex === currentSheet;
  const zIndex = isFlipped ? 10 + sheetIndex : 100 - sheetIndex;

  const renderGlossaryContent = (blocks: GlossaryBlock[]) => {
    return blocks.map((block, idx) => {
      switch (block.type) {
        case "header":
          return (
            <h2
              key={idx}
              className="text-2xl font-bold text-[#9b2d30] border-b-2 border-[#9b2d30]/20 mb-6 pb-2 font-serif">
              {block.content}
            </h2>
          );
        case "definition":
          return (
            <div key={idx} className="mb-4 group">
              <span className="font-bold text-[#9b2d30] text-lg block mb-1 uppercase tracking-wide">
                {block.term}
              </span>
              <p className="text-sm leading-relaxed text-gray-800 italic">
                {block.content}
              </p>
              <div className="w-8 h-[1px] bg-[#9b2d30]/10 mt-2" />
            </div>
          );
        case "text":
          return (
            <p key={idx} className="text-sm mb-4 leading-relaxed opacity-80">
              {block.content}
            </p>
          );
        default:
          return null;
      }
    });
  };

  return (
    <motion.div
      className={`absolute top-0 h-full preserve-3d shadow-2xl ${
        isDesktop ? "left-1/2 w-1/2" : "left-0 w-full"
      }`}
      style={{ transformOrigin: "left center", zIndex }}
      animate={{ rotateY: isFlipped ? -180 : 0 }}
      transition={{ duration: 0.9, ease: [0.645, 0.045, 0.355, 1] }}
      onAnimationComplete={onFlipComplete}>
      {/* Front Surface */}
      <div className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2] border-l border-black/5">
        <div className="relative flex h-full flex-col p-8 md:p-12">
          {front && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {renderGlossaryContent(front.blocks)}
            </div>
          )}
          <div className="text-[10px] opacity-30 text-center mt-4 italic">
            መዝገበ ቃላት
          </div>
        </div>
      </div>

      {/* Back Surface */}
      <div
        className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2]"
        style={{ transform: "rotateY(180deg)" }}>
        <div className="relative flex h-full flex-col p-8 md:p-12">
          {back && (
            <div className="flex-1 overflow-y-auto custom-scrollbar mirrored-content">
              {renderGlossaryContent(back.blocks)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
