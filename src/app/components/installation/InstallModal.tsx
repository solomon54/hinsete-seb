// src/app/components/installation/InstallModal.tsx
"use client";

import { useEffect, useState } from "react";
import { installManager } from "@/lib/installManager";
import { createClient } from "@/lib/db/browser-client";
import { useAuth } from "@/hooks/useAuth";
import { Download, Sparkles, Share, X, LayoutTemplate } from "lucide-react";
import confetti from "canvas-confetti";

interface InstallModalProps {
  lessonProgress?: { completed: number; total: number };
}

type ModalMode = "install" | "update" | "ios" | null;

export default function InstallModal({ lessonProgress }: InstallModalProps) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<ModalMode>(null);

  const { user } = useAuth();
  const supabase = createClient();

  const fireCelebration = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
      colors: ["#9b5c12", "#b99b6b", "#fdfaf1"],
      shapes: ["square"] as confetti.Shape[],
      scalar: 1.5,
    };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire from the left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      // Fire from the right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  useEffect(() => {
    installManager.register();

    const checkInstallationStatus = () => {
      const wasInstalled = localStorage.getItem("pwa_installed") === "true";
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;

      if (wasInstalled && !isStandalone) {
        localStorage.setItem("pwa_installed", "false");
      }
    };

    const onInstallAvailable = () => {
      const lastPrompt = localStorage.getItem("pwa_last_prompt");
      const now = Date.now();
      if (!lastPrompt || now - parseInt(lastPrompt) > 86400000) {
        setMode("install");
      }
    };

    const onUpdateAvailable = () => {
      setMode("update");
      setVisible(true);
    };

    const onLessonRead = () => {
      if (installManager.canInstall() && !visible) {
        setMode("install");
        setVisible(true);
        localStorage.setItem("pwa_last_prompt", Date.now().toString());
      } else if (installManager.isIOS() && !visible) {
        setMode("ios");
        setVisible(true);
      }
    };

    installManager.onInstalled(async () => {
      console.log("💎 Installation confirmed by Manager");
      fireCelebration(); // 🎉 Confetti for new installations
      localStorage.setItem("pwa_installed", "true");

      // Keep visible for 2 seconds so they see the success before it hides
      setTimeout(() => setVisible(false), 2000);

      if (user?.id) {
        const { error } = await supabase
          .from("profiles")
          .update({ isPwaInstalled: true })
          .eq("id", user.id);

        if (error) console.error("Error syncing PWA status:", error);
        else console.log("🚀 Sync to Supabase successful");
      }
    });

    window.addEventListener("pwaInstallAvailable", onInstallAvailable);
    window.addEventListener("swUpdateAvailable", onUpdateAvailable);
    window.addEventListener("lessonRead", onLessonRead);

    checkInstallationStatus();

    return () => {
      window.removeEventListener("pwaInstallAvailable", onInstallAvailable);
      window.removeEventListener("swUpdateAvailable", onUpdateAvailable);
      window.removeEventListener("lessonRead", onLessonRead);
    };
  }, [visible, user, supabase]);

  const handleAction = async () => {
    if (mode === "update") {
      fireCelebration(); // 🎉 Added confetti check for updates too!
      const reg = await navigator.serviceWorker.getRegistration();
      reg?.waiting?.postMessage({ type: "SKIP_WAITING" });

      // Delay reload slightly so they see the confetti
      setTimeout(() => window.location.reload(), 1500);
    } else if (mode === "install") {
      await installManager.promptInstall();
      // Logic for setVisible(false) and fireCelebration() is handled in onInstalled listener
    } else {
      setVisible(false);
    }
  };

  if (!visible || !mode) return null;

  const content = {
    update: {
      title: "አዲስ ስሪት ዝግጁ ነው",
      desc: "የተሻሻሉ አገልግሎቶችን ለማግኘት አሁኑኑ ያድሱ።",
      btn: "አድስ",
      icon: <Sparkles className="w-6 h-6 text-amber-600" />,
      bg: "from-amber-50 to-orange-50",
    },
    install: {
      title: "ሕንጸተ ሰብእን ይጫኑ",
      desc: "ያለ ኢንተርኔት በየትኛውም ቦታ ለመጠቀም አፑን ስልክዎ ላይ ይጫኑ።",
      btn: "ጫን",
      icon: <Download className="w-6 h-6 text-[#9b5c12]" />,
      bg: "from-[#fef8f2] to-[#f5e6d3]",
    },
    ios: {
      title: "በ iPhone ይጠቀሙ",
      desc: "ይህንን ገጽ በ iPhone ላይ ለመጫን 'Share' ምልክቱን ነክተው 'Add to Home Screen' ይምረጡ።",
      btn: "ገባኝ",
      icon: <Share className="w-6 h-6 text-blue-600" />,
      bg: "from-blue-50 to-indigo-50",
    },
  }[mode];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-500">
      <div
        className={`relative bg-gradient-to-br ${content.bg} rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border border-[#b99b6b]/40 animate-slideUp`}>
        {/* Decorative Top Pattern */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#9b5c12]/30" />

        <div className="p-8">
          {/* Icon Header */}
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 border border-[#b99b6b]/20 mx-auto">
            {content.icon}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-black text-[#3d1c1d] mb-3 font-serif italic">
              {content.title}
            </h2>
            <p className="text-[#3d1c1d]/70 text-sm leading-relaxed mb-8 px-2">
              {content.desc}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleAction}
              className="relative overflow-hidden w-full py-4 rounded-2xl bg-[#9b5c12] text-white font-bold shadow-lg shadow-[#9b5c12]/30 active:scale-[0.98] hover:bg-[#864e0f] transition-all flex items-center justify-center gap-2 group">
              {/* The Shimmer Layer */}
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer group-hover:animate-none" />

              <span className="relative z-10 flex items-center gap-2">
                {mode === "install" && <LayoutTemplate size={18} />}
                {content.btn}
              </span>
            </button>

            <button
              onClick={() => setVisible(false)}
              className="w-full py-3 text-[#5c3a2e]/60 text-sm font-semibold hover:text-[#5c3a2e] transition-colors">
              ለጊዜው ይቆይ
            </button>
          </div>
        </div>

        {/* Close "X" Button */}
        <button
          title="Close"
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 p-2 text-[#9b5c12]/40 hover:text-[#9b5c12] transition-colors">
          <X size={20} />
        </button>
      </div>

      <style jsx>{`
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
