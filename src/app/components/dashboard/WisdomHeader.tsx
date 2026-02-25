//src/app/components/dashboard/WisdomHeador.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import quotes from "@/lib/contents/wisdom.json";

const AUTO_HIDE_MS = 8000; // toast duration
const SESSION_LIMIT = 2; // max toasts per session
const LONG_SESSION_INTERVAL = 60 * 60 * 1000; // 60 minutes

export default function WisdomHeader() {
  const [isVisible, setIsVisible] = useState(false);
  const [quote, setQuote] = useState<{ text: string; ref: string } | null>(
    null
  );

  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(false);

  // ---------- Helpers ----------
  const getSessionCount = () =>
    parseInt(sessionStorage.getItem("wisdom_count") || "0");

  const setSessionCount = (count: number) =>
    sessionStorage.setItem("wisdom_count", count.toString());

  const getUsedQuotes = (): number[] =>
    JSON.parse(sessionStorage.getItem("wisdom_used") || "[]");

  const setUsedQuotes = (arr: number[]) =>
    sessionStorage.setItem("wisdom_used", JSON.stringify(arr));

  const getRandomQuote = () => {
    const used = getUsedQuotes();
    const availableIndexes = quotes
      .map((_, i) => i)
      .filter((i) => !used.includes(i));

    let randomIndex: number;
    if (availableIndexes.length === 0) {
      setUsedQuotes([]);
      randomIndex = Math.floor(Math.random() * quotes.length);
    } else {
      randomIndex =
        availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      setUsedQuotes([...used, randomIndex]);
    }

    return quotes[randomIndex];
  };

  const showQuote = () => {
    const currentCount = getSessionCount();
    if (currentCount >= SESSION_LIMIT) return;

    if (isVisibleRef.current) return; // prevent stacking

    const q = getRandomQuote();

    if (hideTimer.current) clearTimeout(hideTimer.current);

    setQuote(q);
    setIsVisible(true);
    isVisibleRef.current = true;
    setSessionCount(currentCount + 1);

    hideTimer.current = setTimeout(() => {
      setIsVisible(false);
      isVisibleRef.current = false;
      hideTimer.current = null;
    }, AUTO_HIDE_MS);
  };

  const dismiss = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setIsVisible(false);
    isVisibleRef.current = false;
  };

  // ---------- Initial Session & Interval ----------
  useEffect(() => {
    if (!sessionStorage.getItem("wisdom_initialized")) {
      sessionStorage.setItem("wisdom_initialized", "true");
      showQuote();
    }

    intervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible" && !isVisibleRef.current) {
        showQuote();
      }
    }, LONG_SESSION_INTERVAL);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ---------- UI ----------
  return (
    <AnimatePresence>
      {isVisible && quote && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.98 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-xl bg-[#9b2d30] text-white rounded-2xl shadow-2xl backdrop-blur-lg">
          <div className="p-5 pr-12 flex gap-3 items-start">
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
            onClick={dismiss}
            className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
