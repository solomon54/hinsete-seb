// src/app/components/installation/InstallModal.tsx
"use client";

import { useEffect, useState } from "react";
import { installManager } from "@/lib/installManager";
import { createClient } from "@/lib/db/browser-client";
import { useAuth } from "@/hooks/useAuth";

interface InstallModalProps {
  lessonProgress?: { completed: number; total: number };
}

type ModalMode = "install" | "update" | "ios" | null;

export default function InstallModal({ lessonProgress }: InstallModalProps) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<ModalMode>(null);

  // 1. Get the authenticated user
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    // 2. Start the engine
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

    // 3. Define the Installation Sync Logic
    // This is the specific "One thing" we ensure doesn't get lost
    installManager.onInstalled(async () => {
      console.log("✅ Installation confirmed by Manager");
      localStorage.setItem("pwa_installed", "true");
      setVisible(false);

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
