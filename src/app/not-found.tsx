"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, MoveLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fef8f2] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#9b5c12] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#9b2d30] blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-xs w-full relative z-10">
        {/* Smaller Animated Icon Container */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-dashed border-[#b99b6b]/40 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-10 h-10 text-[#9b5c12]/80 stroke-[1.2]" />
          </div>
        </div>

        {/* Text Content - Refined sizes */}
        <h1 className="text-7xl font-black text-[#3d1c1d]/5 absolute -top-8 left-1/2 -translate-x-1/2 select-none tracking-tighter">
          404
        </h1>

        <h2 className="text-2xl font-black text-[#3d1c1d] mb-3 font-serif italic tracking-tight">
          መንገዱ ጠፍቶብዎታል?
        </h2>

        <p className="text-[#3d1c1d]/60 text-sm mb-10 leading-relaxed font-medium px-2">
          የፈለጉት ገጽ ሊገኝ አልቻለም። ምናልባት ወደ ሌላ የጥበብ ማህደር ተዛውሮ ይሆናል።
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="group relative flex items-center justify-center gap-2.5 w-full h-14 bg-[#9b5c12] text-white rounded-2xl font-bold shadow-lg shadow-[#9b5c12]/20 active:scale-[0.98] transition-all overflow-hidden">
            {/* SHIMMER EFFECT LAYER */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />

            <Home size={18} className="relative z-10" />
            <span className="relative z-10 font-serif tracking-wider text-sm uppercase">
              ወደ ዋናው ገጽ
            </span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full py-2 text-[#9b5c12]/70 font-bold text-xs hover:text-[#9b5c12] transition-colors tracking-widest uppercase">
            <MoveLeft size={14} /> ተመለስ
          </button>
        </div>
      </motion.div>

      {/* Subtle Footer Quote */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 text-[9px] font-bold uppercase tracking-[0.4em] text-[#b99b6b]/60 opacity-50">
        Hinsete Seb • Wisdom Unfolded
      </motion.p>
    </div>
  );
}
