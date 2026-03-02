//src/app/components/reader/GlossaryPage.tsx
"use client";

import { motion } from "framer-motion";

export const GlossaryPage = ({
  sheetIndex,
  currentSheet,
  front,
  back,
  isDesktop,
  onFlipComplete,
  onNext,
  onPrev,
}: any) => {
  const isFlipped = sheetIndex < currentSheet;
  const isCurrent = sheetIndex === currentSheet;
  const zIndex = isFlipped ? 10 + sheetIndex : 100 - sheetIndex;
  const isActive = isCurrent || isFlipped;

  // 1. Move Stamp into a helper function
  const renderStamp = (pageData: any) => {
    if (!pageData) return null;

    const hasLegacyKeywords = pageData.blocks.some(
      (b: any) => b.content?.includes("Legacy") || b.content?.includes("ግብ")
    );

    if (!hasLegacyKeywords) return null;

    return (
      <div className="mt-12 mb-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 12 }}
          className="w-24 h-24 border-4 border-double border-[#9b2d30] rounded-full flex flex-col items-center justify-center text-[#9b2d30] font-bold bg-[#9b2d30]/5 shadow-sm relative">
          {/* Top Descriptor: Now slightly higher to clear the dashed line */}
          <span className="absolute top-1 text-[6px] opacity-40 tracking-[0.2em] font-serif uppercase">
            EOTC • ሕንጸት
          </span>

          <span className="text-center leading-tight uppercase tracking-tighter text-[11px] z-10 py-1">
            የጸደቀ
            <br />
            <span className="text-[8px] font-medium opacity-80">VERIFIED</span>
            <br />
            SEAL
          </span>

          {/* Decorative inner circle dash */}
          <div className="absolute inset-3 border border-dashed border-[#9b2d30]/20 rounded-full pointer-events-none" />

          {/* ♱ Placed perfectly between the solid border and dashed line */}
          <div className="absolute bottom-[2px] text-[14px] opacity-40 leading-none">
            ♱
          </div>
        </motion.div>

        <p className="text-[10px] mt-4 font-serif text-[#9b2d30] opacity-70 italic tracking-wide">
          የ፲ ዓመት የሕይወት ግብ ማህተም
        </p>
      </div>
    );
  };

  const renderContent = (blocks: any[]) => {
    return blocks.map((block, idx) => {
      switch (block.type) {
        case "header":
          return (
            <h1
              key={idx}
              className="text-xl md:text-2xl font-serif font-bold text-[#9b2d30] mb-6 text-center border-b border-[#9b2d30]/10 pb-4">
              {block.content}
            </h1>
          );
        case "definition":
          return (
            <div key={idx} className="mb-6 pl-2 group">
              <dt className="font-bold text-[#9b2d30] text-base mb-1 font-serif tracking-wide">
                {block.term}
              </dt>
              <dd className="text-[13px] leading-relaxed text-gray-700 pl-4 border-l border-[#9b2d30]/10 italic">
                {block.content}
              </dd>
            </div>
          );
        case "text":
          return (
            <p
              key={idx}
              className="text-sm md:text-base mb-4 leading-relaxed text-gray-800 text-justify">
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
      style={{
        transformOrigin: "left center",
        zIndex,
        pointerEvents: isActive ? "auto" : "none",
      }}
      animate={{ rotateY: isFlipped ? -180 : 0 }}
      transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
      onAnimationComplete={onFlipComplete}>
      {/* FRONT SURFACE */}
      <div className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2] border-r border-black/5">
        {/* Navigation Zones */}
        {isCurrent && (
          <div className="absolute inset-0 z-30 flex pointer-events-none">
            <div
              className="h-full w-[20%] pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
            />
            <div className="flex-1" />
            <div
              className="h-full w-[20%] pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            />
          </div>
        )}

        <div className="relative flex h-full flex-col p-8 md:p-12">
          {front && (
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar z-20 relative">
              {renderContent(front.blocks)}
              {/* 2. Added Stamp Check to Front (for Mobile) */}
              {renderStamp(front)}
            </div>
          )}
          <div className="text-[9px] opacity-30 text-center mt-4 font-serif">
            ገጽ {isDesktop ? sheetIndex * 2 + 1 : sheetIndex + 1}
          </div>
        </div>
      </div>

      {/* BACK SURFACE */}
      <div
        className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2]"
        style={{ transform: "rotateY(180deg)" }}>
        <div className="relative flex h-full flex-col p-8 md:p-12">
          {back ? (
            <div className="flex-1 h-full overflow-y-auto custom-scrollbar mirrored-content z-10 pr-2">
              {renderContent(back.blocks)}
              {/* 3. Keep Stamp Check on Back (for Desktop) */}
              {renderStamp(back)}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center opacity-10">
              <span className="font-serif italic text-lg">የብራናው መጨረሻ</span>
            </div>
          )}
          <div className="text-[9px] opacity-30 text-center mt-4 font-serif">
            ገጽ {isDesktop ? sheetIndex * 2 + 2 : sheetIndex + 1}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
