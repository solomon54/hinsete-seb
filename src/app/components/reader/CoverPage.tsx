//scr/app/components/reader/CoverPage.tsx
"use client";

import { motion, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import { BlockType } from "@/app/lessons/[week]/page";
import { User } from "@/types/user";
import { useState } from "react";

interface CoverContentBlock {
  type: BlockType | "cover_visual";
  content?: string;
  ref?: string;
  id?: string;
}

interface CoverPageProps {
  sheetIndex: number;
  currentSheet: number;
  front: { blocks: CoverContentBlock[] } | null;
  back: { blocks: CoverContentBlock[] } | null;
  isDesktop: boolean;
  onFlipComplete: () => void;
  user: User | null;
  onNext: () => void;
  onPrev: () => void;
}

export const CoverPage = ({
  sheetIndex,
  currentSheet,
  front,
  back,
  isDesktop,
  onFlipComplete,
  onNext,
  onPrev,
}: CoverPageProps) => {
  const router = useRouter();

  const isFlipped = sheetIndex < currentSheet;
  const isCurrent = sheetIndex === currentSheet;
  const isActive = isCurrent || isFlipped;
  const zIndex = isFlipped ? 10 + sheetIndex : 100 - sheetIndex;

  const renderCoverContent = (
    blocks: CoverContentBlock[],
    isFrontPage: boolean
  ) => {
    const elements = blocks.map((block, idx) => {
      const content = block.content || "";

      switch (block.type) {
        case "header":
          return (
            <h1
              key={idx}
              className={`text-center font-serif font-bold text-[#9b2d30] leading-tight ${
                isFrontPage && sheetIndex === 0
                  ? "text-xl md:text-2xl mb-2"
                  : "text-lg md:text-xl mb-6"
              }`}>
              {content}
            </h1>
          );

        case "subtitle":
          return (
            <h2
              key={idx}
              className="text-center text-sm md:text-lg text-[#9b2d30]/70 italic font-serif mb-4">
              {content}
            </h2>
          );

        case "quote":
          return (
            <div
              key={idx}
              className="my-4 p-4 border-l-2 border-[#9b2d30]/30 bg-[#9b2d30]/10 italic rounded-r-lg relative z-20">
              <p className="text-[11px] md:text-base text-[#3d1c1d] leading-relaxed italic">
                “{content}”
              </p>
              {block.ref && (
                <cite className="block text-right text-[8px] mt-2 font-bold opacity-60">
                  — {block.ref}
                </cite>
              )}
            </div>
          );

        case "text":
        default: {
          if (content.includes("\n") && /^\d+\./.test(content.trim())) {
            return (
              <div key={idx} className="my-4 space-y-2 relative z-50">
                {content.split("\n").map((line, lIdx) => {
                  return (
                    <div
                      key={lIdx}
                      className="flex items-center justify-between p-3 rounded-md border border-[#9b2d30]/10 bg-white/10 shadow-sm">
                      <span className="text-[12px] md:text-sm text-gray-800 font-medium">
                        {line.split(/(\*\*.*?\*\*)/g).map((part, pIdx) =>
                          part.startsWith("**") ? (
                            <strong key={pIdx} className="text-[#9b2d30]">
                              {part.slice(2, -2)}
                            </strong>
                          ) : (
                            part
                          )
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
            <p
              key={idx}
              className="mb-3 text-[13px] md:text-base leading-[1.7] text-justify text-gray-800">
              {content.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                part.startsWith("**") ? (
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
      }
    });

    if (isFrontPage && sheetIndex === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[55vh] py-8 text-center">
          <div className="w-16 h-[1px] bg-[#9b2d30]/30 mb-6" />
          <div className="flex flex-col items-center w-full">{elements}</div>
          <div className="w-16 h-[1px] bg-[#9b2d30]/30 mt-6" />
        </div>
      );
    }

    return elements;
  };

  return (
    <motion.div
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragEnd={(e, info) => {
        const threshold = 40;
        if (info.offset.x > threshold) onPrev();
        else if (info.offset.x < -threshold) onNext();
      }}
      className={`absolute top-0 h-full preserve-3d shadow-2xl touch-none ${
        isDesktop ? "left-1/2 w-1/2" : "left-0 w-full"
      }`}
      style={{
        transformOrigin: "left center",
        zIndex,
        pointerEvents: isActive ? "auto" : "none",
        touchAction: "pan-y",
      }}
      animate={{ rotateY: isFlipped ? -180 : 0 }}
      transition={{ duration: 0.8, ease: "circOut" }}
      onAnimationComplete={onFlipComplete}>
      {/* FRONT PAGE */}
      <div className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2] border-r border-black/5">
        {!isDesktop && isCurrent && (
          <div className="absolute inset-0 pointer-events-none z-[1] flex">
            <div
              className="w-[35%] h-full pointer-events-auto cursor-pointer active:bg-black/5 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
            />
            <div className="flex-1 h-full" />
            <div
              className="w-[35%] h-full pointer-events-auto cursor-pointer active:bg-black/5 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            />
          </div>
        )}

        <div className="relative flex h-full flex-col p-6 md:p-12">
          {front && (
            <div
              className={`flex-1 overflow-y-auto pr-1 custom-scrollbar z-20 relative ${
                sheetIndex === 0 ? "flex flex-col justify-center" : ""
              }`}>
              {renderCoverContent(front.blocks, true)}
            </div>
          )}
          <div className="text-center text-[9px] opacity-60 text-[#9b2d30] font-serif">
            ገጽ {isDesktop ? sheetIndex * 2 + 1 : sheetIndex + 1}
          </div>
        </div>
      </div>

      {/* BACK PAGE */}
      <div
        className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2]"
        style={{ transform: "rotateY(180deg)" }}>
        <div className="relative flex h-full flex-col p-6 md:p-12">
          {back && (
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar z-20 relative mirrored-content">
              {renderCoverContent(back.blocks, false)}
            </div>
          )}
          <div className="text-center text-[9px] opacity-60 text-[#9b2d30] font-serif">
            ገጽ {isDesktop ? sheetIndex * 2 + 2 : sheetIndex + 1}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
