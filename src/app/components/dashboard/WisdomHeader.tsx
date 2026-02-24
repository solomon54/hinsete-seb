"use client";

import { useState, useEffect } from "react";
import { X, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import quotes from "@/lib/contents/wisdom.json";

export default function WisdomHeader() {
  const [isVisible, setIsVisible] = useState(false);
  const [quote, setQuote] = useState({ text: "", ref: "" });

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("wisdom_dismissed");
    if (!isDismissed) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("wisdom_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-[#9b2d30] text-white overflow-hidden relative">
          <div className="p-5 pr-12 max-w-5xl mx-auto flex gap-3 items-start">
            <Quote size={20} className="text-white/40 mt-1 shrink-0" />
            <div>
              <p className="text-sm md:text-base font-serif italic leading-relaxed">
                "{quote.text}"
              </p>
              <p className="text-[10px] mt-2 opacity-70 font-bold uppercase tracking-widest">
                — {quote.ref}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
