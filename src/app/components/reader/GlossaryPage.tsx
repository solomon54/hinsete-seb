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

  const parseRichText = (text: string) => {
    if (!text) return "";
    return text.split(/(\*\*.*?\*\*|__.*?__|\[br\])/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-[#9b2d30]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("__") && part.endsWith("__")) {
        return (
          <span
            key={i}
            className="border-b-2 border-dotted border-[#9b2d30]/60">
            {part.slice(2, -2)}
          </span>
        );
      }
      if (part === "[br]") return <br key={i} />;
      return part;
    });
  };

  const renderStamp = (pageData: any) => {
    if (!pageData) return null;
    const hasLegacyKeywords = pageData.blocks.some(
      (b: any) =>
        b.content?.includes("Legacy") ||
        b.content?.includes("ግብ") ||
        b.type === "signed-line"
    );
    if (!hasLegacyKeywords) return null;

    return (
      <div className="mt-8 mb-4 flex flex-col items-center justify-center scale-90">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 12 }}
          className="w-24 h-24 border-4 border-double border-[#9b2d30] rounded-full flex flex-col items-center justify-center text-[#9b2d30] font-bold bg-[#9b2d30]/5 shadow-sm relative">
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
          <div className="absolute inset-3 border border-dashed border-[#9b2d30]/20 rounded-full pointer-events-none" />
          <div className="absolute bottom-[2px] text-[14px] opacity-40 leading-none">
            ♱
          </div>
        </motion.div>
        <p className="text-[9px] mt-2 font-serif text-[#9b2d30] opacity-60 italic tracking-wide">
          የ፲ ዓመት የሕይወት ግብ ማህተም
        </p>
      </div>
    );
  };

  const renderContent = (blocks: any[]) => {
    if (!blocks) return null;
    return blocks.map((block, idx) => {
      switch (block.type) {
        case "header":
          return (
            <h1
              key={idx}
              className="text-sm md:text-base lg:text-xl font-serif font-bold text-[#9b2d30] mb-4 text-center border-b border-[#9b2d30]/10 pb-2 uppercase tracking-wide">
              {block.content}
            </h1>
          );

        case "sub-header": // Future-proof: for smaller sections
          return (
            <h2
              key={idx}
              className="text-sm md:text-md font-serif font-bold text-gray-800 mt-4 mb-2 border-l-4 border-[#9b2d30] pl-2">
              {block.content}
            </h2>
          );

        case "definition":
          return (
            <div
              key={idx}
              className="mb-4 pl-3 border-l-2 border-[#9b2d30]/7 bg-black/[0.01] py-1">
              <dt className="font-bold text-[#9b2d30] text-[10px] md:text-sm lg:text-base mb-0.5 font-serif">
                {block.term}
              </dt>
              <dd className="text-[8px] md:text-[12px] leading-relaxed text-gray-700 italic">
                {parseRichText(block.content)}
              </dd>
            </div>
          );

        case "list":
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag key={idx} className="mb-4 space-y-3">
              {block.items.map((item: string, i: number) => (
                <li
                  key={i}
                  className="flex gap-3 text-[9px] md:text-sm leading-relaxed text-gray-800">
                  <span className="font-bold text-[#9b2d30] min-w-[1.2rem]">
                    {block.ordered ? `${i + 1}.` : "•"}
                  </span>
                  <span className="flex-1">{parseRichText(item)}</span>
                </li>
              ))}
            </ListTag>
          );

        case "table":
          return (
            <div
              key={idx}
              className="mb-6 w-full overflow-x-auto rounded-md border border-[#9b2d30]/20 shadow-inner bg-white/10">
              <table className="w-full border-collapse font-serif text-left">
                <thead>
                  <tr className="bg-[#9b2d30]/10 text-[#9b2d30]">
                    {block.headers.map((h: string, i: number) => (
                      <th
                        key={i}
                        className="p-2 text-[7px] md:text-[10px] font-bold border-b border-[#9b2d30]/20">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row: string[], ri: number) => (
                    <tr
                      key={ri}
                      className="border-b border-[#9b2d30]/5 last:border-0 hover:bg-[#9b2d30]/5 transition-colors">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="p-2 text-[7px] md:text-[11px] text-gray-800 align-top leading-tight">
                          {parseRichText(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );

        case "signed-line":
          return (
            <div key={idx} className="my-2 md:my-4 group flex flex-col">
              <div className="flex flex-wrap items-end gap-x-2">
                <span className="text-[9px] md:text-sm font-serif text-gray-800 leading-tight">
                  {parseRichText(block.label)}
                </span>
                {/* Adaptive Line: thinner on mobile (1px), standard on desktop (2px) */}
                <div className="flex-1 min-w-[120px] border-b-[1px] md:border-b-2 border-[#9b2d30]/20 pb-0.5 h-5 bg-[#9b2d30]/[0.01] relative group-hover:border-[#9b2d30]/50 transition-all duration-300 mb-1.5">
                  <span className="absolute right-0 -bottom-3 text-[6px] capitalize opacity-30 font-sans tracking-tighter ">
                    ሃሳብኅን አዚህ ፃፍ /write your idea on here ✍️
                  </span>
                </div>
              </div>
            </div>
          );

        case "spacer":
          /* Reduced height: 8px on mobile, 24px on desktop */
          return <div key={idx} className="h-0.5 sm:h-2 md:h-6" />;

        case "callout":
          return (
            <div
              key={idx}
              className="my-8 p-5 rounded-md border-2 border-double border-[#9b2d30]/20 bg-[#9b2d30]/5 relative shadow-sm">
              <div className="absolute -top-3 left-6 bg-[#fdf8f2] px-3 text-[9px] font-bold text-[#9b2d30] uppercase tracking-[0.2em]">
                {block.label || "ማሳሰቢያ"}
              </div>
              <p className="text-[9px] md:text-sm text-center italic text-gray-800 leading-relaxed font-serif">
                {parseRichText(block.content)}
              </p>
            </div>
          );

        case "image": // Future-proof placeholder
          return (
            <div key={idx} className="my-4 flex justify-center">
              <img
                src={block.url}
                alt={block.alt}
                className="max-w-full rounded shadow-md border border-gray-200"
              />
            </div>
          );

        case "spacer":
          return <div key={idx} className="h-6" />;

        case "text":
          return (
            <p
              key={idx}
              className="text-[9px] md:text-base mb-4 leading-relaxed text-gray-800 text-justify font-serif opacity-90">
              {parseRichText(block.content)}
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
      <div className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2] border-r border-black/5">
        <div className="relative flex h-full flex-col p-8 md:p-14">
          {front && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar z-20 relative">
              {renderContent(front.blocks)}
              {renderStamp(front)}
            </div>
          )}
          <div className="text-[9px] opacity-30 text-center mt-4 font-serif italic border-t border-black/5 pt-2">
            ገጽ {isDesktop ? sheetIndex * 2 + 1 : sheetIndex + 1}
          </div>
        </div>
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
      </div>

      <div
        className="page-surface backface-hidden absolute inset-0 overflow-hidden bg-[#fdf8f2]"
        style={{ transform: "rotateY(180deg)" }}>
        <div className="relative flex h-full flex-col p-8 md:p-14">
          {back ? (
            <div className="flex-1 h-full overflow-y-auto custom-scrollbar mirrored-content z-10 pr-2">
              {renderContent(back.blocks)}
              {renderStamp(back)}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center opacity-10 flex-col">
              <div className="text-xl mb-4 opacity-20">♱</div>
              <span className="font-serif italic text-lg tracking-[0.4em] uppercase">
                ተፈጸመ
              </span>
            </div>
          )}
          <div className="text-[9px] opacity-30 text-center mt-4 font-serif italic border-t border-black/5 pt-2">
            ገጽ {isDesktop ? sheetIndex * 2 + 2 : sheetIndex + 1}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
