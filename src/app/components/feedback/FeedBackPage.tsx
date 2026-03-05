// src/app/feedback/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, Feather, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/db/browser-client";
import confetti from "canvas-confetti";

interface FeedbackProps {
  onClose: () => void;
}

export default function FeedBackPage({ onClose }: FeedbackProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [greeting, setGreeting] = useState("ሰላም");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setGreeting("እንደምን አደሩ");
    else if (hour >= 12 && hour < 17) setGreeting("እንደምን ዋሉ");
    else if (hour >= 17 && hour < 21) setGreeting("እንደምን አመሹ");
    else setGreeting("ሰላም ጤና ይስጥልኝ: ");
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
    // Dynamic background color swap for the whole page
    <div
      className={`fixed inset-0 z-[90] transition-colors duration-1000 overflow-y-auto animate-slide-up ${
        status === "success" ? "bg-[#E8F5E9]" : "bg-[#F4F1EA]"
      }`}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-30 pointer-events-none" />

      {/* Top Navigation */}
      <div className="sticky top-0 flex justify-between items-center px-6 py-4 z-10">
        <button
          title="close feedback form"
          onClick={onClose}
          className="p-2 active:scale-90 transition-transform text-[#3d1c1d]">
          <X size={24} />
        </button>
        <span className="font-bold text-[#3d1c1d] text-[10px] tracking-[0.3em] uppercase opacity-40">
          አስተያየት
        </span>
        <div className="w-10" />
      </div>

      <main className="flex flex-col items-center px-6 pb-32 pt-4">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <header className="text-center mb-12 select-none">
            <div className="flex items-center justify-center gap-3 opacity-30 mb-6">
              <div className="h-[1px] w-12 bg-[#8B5E34]" />
              <div className="text-[12px]">♱</div>
              <div className="h-[1px] w-12 bg-[#8B5E34]" />
            </div>
            <h1 className="text-4xl font-black text-[#3d1c1d] mb-4 tracking-tight">
              የተጠቃሚ አስተያየት
            </h1>
            <p className="text-[#3d1c1d]/80 leading-relaxed text-lg italic">
              {greeting}{" "}
              <span className="text-[#A67C52] font-bold underline hover:text-[#d8a36d] cursor-pointer transition-all duration-300">
                {userName}
              </span>
              ፤
              <br />
              ይህን መተግበሪያ ለማሻሻል የእርስዎ ሃሳብ እና ምክር በጣም አስፈላጊ ነው።
            </p>
          </header>

          {/* Feedback Area - Swaps to green tint on success */}
          <div
            className={`relative border-y py-12 px-8 transition-all duration-700 ${
              status === "success"
                ? "bg-emerald-50/80 border-emerald-200/50"
                : "bg-[#EFEBE0]/60 border-[#8B5E34]/10"
            }`}>
            <div
              className={`absolute -top-5 left-1/2 -translate-x-1/2 px-4 transition-colors duration-700 ${
                status === "success" ? "bg-[#E8F5E9]" : "bg-[#F4F1EA]"
              }`}>
              <span
                className={`text-4xl font-serif leading-none opacity-60 transition-colors ${
                  status === "success" ? "text-emerald-700" : "text-[#A67C52]"
                }`}>
                «
              </span>
            </div>

            {status === "success" ? (
              <div className="py-10 text-center animate-in fade-in zoom-in duration-700">
                <div className="relative inline-block mb-6">
                  <CheckCircle2
                    size={64}
                    className="text-emerald-600 stroke-1 animate-bounce"
                  />
                  <div className="absolute 🙏🏿inset-0 bg-emerald-400 blur-2xl opacity-20 -z-10" />
                </div>

                <h2 className="text-[#1B5E20] text-2xl font-black mb-4">
                  በታላቅ አክብሮት ተቀብለናል! 🙏🏿
                </h2>

                <p className="text-[#3d1c1d]/80 text-lg leading-relaxed max-w-md mx-auto mb-8 italic">
                  ስለሰጡን ጠቃሚ አስተያየት እናመሰግናለን። የእርስዎ ሃሳብ መተግበሪያውን ይበልጥ የተሻለ ለማድረግና
                  ለተጠቃሚ እንዲመች ለማድረግ ትልቅ አቅም ይሆነናል።
                </p>

                <button
                  onClick={() => setStatus("idle")}
                  className="group flex items-center gap-2 mx-auto text-emerald-700 hover:text-amber-400 cursor-pointer text-xs font-bold uppercase tracking-[0.2em] transition-all hover:gap-4">
                  <span className="border-b border-current opacity-80">
                    ተጨማሪ መልእክት ለመጻፍ
                  </span>
                  <Send size={14} className="rotate-180 opacity-60" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {status === "error" && (
                  <p className="text-red-600 text-xs font-bold mb-4 flex items-center gap-1 cursor-pointer">
                    <AlertCircle size={14} /> እንደገና ይሞክሩ
                  </p>
                )}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="ሀሳብዎን እዚህ ያጋሩን..."
                  className="w-full bg-transparent text-[#3d1c1d] text-center text-xl leading-relaxed outline-none resize-none placeholder:text-[#3d1c1d]/20 min-h-[200px]"
                />
              </div>
            )}

            <div
              className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 transition-colors duration-700 ${
                status === "success" ? "bg-[#E8F5E9]" : "bg-[#F4F1EA]"
              }`}>
              <span
                className={`text-4xl font-serif leading-none opacity-60 transition-colors ${
                  status === "success" ? "text-emerald-700" : "text-[#A67C52]"
                }`}>
                »
              </span>
            </div>
          </div>

          {/* Submit Button - Shimmer logic exactly as original */}
          {status !== "success" && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
                className="group relative w-full max-w-md py-5 rounded-2xl 
                           bg-linear-to-b from-[#A67C52] to-[#8B5E34] 
                           text-white text-xl font-bold shadow-2xl 
                           transition-all active:scale-[0.98] disabled:opacity-50 
                           overflow-hidden shadow-[#8B5E34]/30">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                </div>

                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? "በመላክ ላይ..." : "አስተያየቱን ላክ"}
                  {!loading && <Send size={22} />}
                </span>
              </button>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-20 opacity-30 flex flex-col items-center gap-3 select-none pb-10">
            <Feather size={20} className="text-[#8B5E34]" />
            <p className="text-[10px] tracking-[0.6em] font-black text-[#3d1c1d] uppercase">
              ሕንጸተ ሰብእ
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
