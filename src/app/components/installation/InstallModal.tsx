// src/app/components/installation/InstallModal.tsx
"use client";

import { useEffect, useState } from "react";
import { installManager } from "@/lib/installManager";

interface InstallModalProps {
  lessonProgress?: { completed: number; total: number };
}

type ModalMode = "install" | "update" | "ios" | null;

export default function InstallModal({ lessonProgress }: InstallModalProps) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<ModalMode>(null);

  useEffect(() => {
    // 1. Register the worker immediately when the modal's logic initializes
    installManager.register();

    const checkInstallationStatus = () => {
      const wasInstalled = localStorage.getItem("pwa_installed") === "true";
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;

      // Logic: If we thought it was installed, but it's not in standalone mode anymore,
      // the user likely deleted it or is browsing in the browser again.
      if (wasInstalled && !isStandalone) {
        localStorage.setItem("pwa_installed", "false"); // Reset state
      }
    };

    const onInstallAvailable = () => {
      // Only show if we haven't nagged them in the last 24 hours
      const lastPrompt = localStorage.getItem("pwa_last_prompt");
      const now = Date.now();

      if (!lastPrompt || now - parseInt(lastPrompt) > 86400000) {
        setMode("install");
        // We don't setVisible(true) immediately - we wait for a "Lesson Read"
        // or a specific trigger to be polite.
      }
    };

    const onUpdateAvailable = () => {
      setMode("update");
      setVisible(true); // Updates are critical, show immediately
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

    window.addEventListener("pwaInstallAvailable", onInstallAvailable);
    window.addEventListener("swUpdateAvailable", onUpdateAvailable);
    window.addEventListener("lessonRead", onLessonRead);

    installManager.onInstalled(() => {
      localStorage.setItem("pwa_installed", "true");
      setVisible(false);
    });

    checkInstallationStatus();

    return () => {
      window.removeEventListener("pwaInstallAvailable", onInstallAvailable);
      window.removeEventListener("swUpdateAvailable", onUpdateAvailable);
      window.removeEventListener("lessonRead", onLessonRead);
    };
  }, [visible]);

  /* =========================================
     ACTIONS
  ========================================= */

  const handleAction = async () => {
    if (mode === "update") {
      const reg = await navigator.serviceWorker.getRegistration();
      reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    } else if (mode === "install") {
      await installManager.promptInstall();
      setVisible(false);
    } else {
      setVisible(false); // iOS is just instructional
    }
  };

  if (!visible || !mode) return null;

  // UI Text mapping
  const content = {
    update: {
      title: "አዲስ ስሪት ዝግጁ ነው ✨",
      desc: "የተሻሻሉ አገልግሎቶችን ለማግኘት አሁኑኑ ያድሱ።",
      btn: "አድስ",
    },
    install: {
      title: "ሕንጸተ ሰብእን ይጫኑ",
      desc: "ያለ ኢንተርኔት በየትኛውም ቦታ ለመጠቀም አፑን ስልክዎ ላይ ይጫኑ።",
      btn: "ጫን",
    },
    ios: {
      title: "በ iPhone ይጠቀሙ",
      desc: "ይህንን ገጽ በ iPhone ላይ ለመጫን 'Share' ምልክቱን ነክተው 'Add to Home Screen' ይምረጡ።",
      btn: "ገባኝ",
    },
  }[mode];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[#fef8f2] rounded-2xl shadow-2xl w-full max-w-md p-6 mb-4 border border-[#b99b6b]/30 animate-slideUp">
        <div className="w-12 h-1.5 bg-[#b99b6b]/20 rounded-full mx-auto mb-6" />

        <h2 className="text-xl font-bold text-[#9b5c12] mb-3">
          {content.title}
        </h2>
        <p className="text-[#3d1c1d] mb-6 leading-relaxed">{content.desc}</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAction}
            className="w-full py-4 rounded-xl bg-[#9b5c12] text-white font-bold shadow-lg shadow-[#9b5c12]/20 active:scale-[0.98] transition-transform">
            {content.btn}
          </button>
          <button
            onClick={() => setVisible(false)}
            className="w-full py-3 text-[#5c3a2e] font-medium">
            ለጊዜው ይቆይ
          </button>
        </div>
      </div>
      <style jsx>{`
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
