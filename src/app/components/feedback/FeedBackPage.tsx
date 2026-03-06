// src/app/feedback/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Feather,
  Stars,
  MessageSquareQuote,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/db/browser-client";
import confetti from "canvas-confetti";
import Link from "next/link";

interface FeedbackProps {
  onClose?: () => void;
}

export default function FeedBackPage({ onClose }: FeedbackProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [greeting, setGreeting] = useState("ሰላም");

  // Theme Color: Deep Burnt Orange
  const themeColor = "#d35400";

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setGreeting("እንደምን አደሩ");
    else if (hour >= 12 && hour < 17) setGreeting("እንደምን ዋሉ");
    else if (hour >= 17 && hour < 21) setGreeting("እንደምን አመሹ");
    else setGreeting("ሰላም ጤና ይስጥልኝ");
  }, []);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleSubmit = async () => {
    if (!message.trim() || !user || loading) return;
    setLoading(true);
    setStatus("idle");

    const { error } = await supabase.from("feedback").insert({
      profile_id: user.id,
      content: message.trim(),
      page_context: window.location.pathname,
    });

    if (!error) {
      setStatus("success");
      setMessage("");
      triggerConfetti();
    } else {
      setStatus("error");
    }
    setLoading(false);
  };

  if (authLoading) return null;

  const userName = user?.display_name || user?.email?.split("@")[0] || "ወዳጃችን";

  return (
    <div
      className={`fixed inset-0 z-[90] transition-colors duration-1000 overflow-y-auto ${
        status === "success" ? "bg-emerald-50" : "bg-[#fefaf6]"
      }`}>
      {/* Background Texture - Matching Biranna style */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20 pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 flex justify-between items-center px-4 py-3 z-10 bg-[#fefaf6]/90 backdrop-blur-sm border-b border-[#d35400]/5">
        <div className="flex items-center gap-2">
          <Feather size={18} className="text-[#d35400]" />
          <span className="font-bold text-[#d35400] text-[10px] tracking-[0.3em] uppercase">
            አስተያየት
          </span>
        </div>
      </header>

      <main className="flex flex-col items-center px-3 md:px-6 pb-20 pt-6">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header Section */}
          <header className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 opacity-20">
              <Stars size={20} className="text-[#d35400]" />
              <div className="h-[1px] w-12 bg-[#d35400]" />
              <div className="text-[12px]">♱</div>
              <div className="h-[1px] w-12 bg-[#d35400]" />
              <Stars size={20} className="text-[#d35400]" />
            </div>

            <h1 className="text-xl md:text-3xl font-black text-[#2c1a11] tracking-tight">
              የተጠቃሚ አስተያየት
            </h1>

            <p className="text-[#2c1a11]/80 leading-relaxed text-sm md:text-lg italic px-2">
              {greeting}{" "}
              <span className="text-[#d35400] font-black underline underline-offset-4 decoration-[#d35400]/20">
                {userName}
              </span>
              ፤ <br />
              ይህን መተግበሪያ ለማሻሻል የእርስዎ ሃሳብ እና ምክር ለእኛ ትልቅ ዋጋ አለው።
            </p>
          </header>

          {/* Feedback Input Area */}
          <div
            className={`relative border-y md:border-x md:rounded-[3rem] py-10 px-6 md:px-12 transition-all duration-700 shadow-2xl shadow-[#d35400]/5 ${
              status === "success"
                ? "bg-white border-emerald-200"
                : "bg-white border-[#d35400]/10"
            }`}>
            {/* Ornamental Quotes */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#fefaf6] px-4">
              <MessageSquareQuote
                size={40}
                className={`opacity-20 ${
                  status === "success" ? "text-emerald-600" : "text-[#d35400]"
                }`}
              />
            </div>

            {status === "success" ? (
              <div className="py-8 text-center animate-in fade-in zoom-in duration-700 space-y-6">
                <div className="relative inline-block">
                  <CheckCircle2
                    size={60}
                    className="text-emerald-600 stroke-1 animate-bounce"
                  />
                  <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20 -z-10" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-[#1B5E20] text-xl md:text-2xl font-black">
                    በታላቅ አክብሮት ተቀብለናል!
                  </h2>
                  <p className="text-[#2c1a11]/70 text-sm md:text-lg leading-relaxed italic max-w-sm mx-auto">
                    ስለሰጡን ጠቃሚ አስተያየት እናመሰግናለን። የእርስዎ ሃሳብ መተግበሪያውን ይበልጥ የተሻለ
                    ለማድረግ ብርታት ይሆነናል።
                  </p>
                </div>

                <button
                  onClick={() => setStatus("idle")}
                  className="mt-4 px-8 py-3 rounded-full border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all">
                  ተጨማሪ መልእክት ለመጻፍ
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                {status === "error" && (
                  <div className="flex items-center gap-2 text-red-600 text-[11px] font-bold mb-4 bg-red-50 px-4 py-2 rounded-full">
                    <AlertCircle size={14} /> እባክዎን እንደገና ይሞክሩ
                  </div>
                )}

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="እባክዎት ሀሳብዎን እዚህ ያጋሩን..."
                  className="w-full bg-transparent text-[#2c1a11] text-center text-base md:text-xl leading-relaxed outline-none resize-none placeholder:text-[#2c1a11]/20 min-h-[180px] md:min-h-[250px] font-medium"
                  autoFocus
                />
              </div>
            )}

            {/* Bottom Ornament */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#fefaf6] px-4 opacity-10">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#d35400]"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {status !== "success" && (
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
                className="group relative w-full max-w-sm py-4 md:py-5 rounded-2xl 
                           bg-[#d35400] text-white text-lg md:text-xl font-black shadow-xl 
                           transition-all active:scale-[0.97] disabled:opacity-45 
                           overflow-hidden hover:bg-[#d35400]">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer" />
                </div>

                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? "በመላክ ላይ..." : "አስተያየቱን ላክ"}
                  {!loading && (
                    <Send
                      size={20}
                      className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    />
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Footer Branding */}
          <footer className="pt-10 flex flex-col items-center gap-3 opacity-20 select-none">
            <div className="h-[1px] w-20 bg-[#d35400]" />
            <p className="text-[9px] tracking-[0.5em] font-black text-[#2c1a11] uppercase">
              ሕንጸተ ሰብእ • 2018 E.C
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
