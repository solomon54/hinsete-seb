"use client";
import { motion } from "framer-motion";

interface BookPageProps {
  content: string;
  pageNumber: number;
  isFlipped: boolean;
}

export const BookPage = ({ content, pageNumber, isFlipped }: BookPageProps) => {
  return (
    <motion.div
      initial={false}
      animate={{ rotateY: isFlipped ? -180 : 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="absolute inset-0 w-full h-full preserve-3d origin-left cursor-pointer"
      style={{ backfaceVisibility: "hidden" }}>
      {/* Front of Page (Parchment) */}
      <div className="absolute inset-0 bg-[#f4ece1] p-12 shadow-2xl border-l-4 border-black/10 flex flex-col justify-between">
        <div className="prose prose-stone max-w-none">
          <p className="font-serif text-lg leading-relaxed text-ink-black">
            {content}
          </p>
        </div>
        <div className="text-center font-serif italic text-sm text-gray-500">
          — {pageNumber} —
        </div>
      </div>
    </motion.div>
  );
};
