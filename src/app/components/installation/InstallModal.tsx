//src/app/components/installation/InstallModal.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { installManager } from "@/lib/installManager";
import { createClient } from "@/lib/db/browser-client";
import { useAuth } from "@/hooks/useAuth";
import {
  Download,
  Sparkles,
  Share,
  X,
  LayoutTemplate,
  CheckCircle2,
  Monitor,
  Smartphone,
} from "lucide-react";
import confetti from "canvas-confetti";

type ModalMode = "install" | "update" | "ios" | null;

export default function InstallModal({
  lessonProgress,
}: {
  lessonProgress?: any;
}) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<ModalMode>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState("ሲስተሙን በማዘጋጀት ላይ...");

  const isRealInstallComplete = useRef(false);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const supabase = createClient();

  const isRunningStandalone = useCallback(() => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  }, []);

  // install prompt can be delayed, so we check after a short timeout to catch it if it appears late
  useEffect(() => {
    const fallback = setTimeout(() => {
      const alreadyTriggered = visible || mode !== null;
      if (alreadyTriggered) return;

      if (!isRunningStandalone()) {
        if (installManager.canInstall()) {
          setMode("install");
          setVisible(true);
        } else if (installManager.isIOS()) {
          setMode("ios");
          setVisible(true);
        }
      }
    }, 5000);

    return () => clearTimeout(fallback);
  }, [visible, mode]);

  const fireCelebration = useCallback(() => {
    const end = Date.now() + 4000;
    const colors = ["#9b2d30", "#b99b6b", "#FFD700"];
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  const runSimulation = () => {
    setIsInstalling(true);
    setIsComplete(false);
    setProgress(0);

    // For updates, we can assume a faster confirmation
    if (mode === "update") isRealInstallComplete.current = true;

    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    let current = 0;
    progressTimerRef.current = setInterval(() => {
      let step = 0;

      if (isRealInstallComplete.current && current > 80) {
        step = 2.5;
        setStatusLabel(mode === "update" ? "ስሪቱን በማዘመን ላይ..." : "በማጠናቀቅ ላይ...");
      } else {
        if (current < 35) {
          step = 1.4;
          setStatusLabel("ፋይሎችን በማውረድ ላይ...");
        } else if (current >= 35 && current < 42) {
          step = 0.05; // STUTTER: Security
          setStatusLabel("ደህንነቱን በማረጋገጥ ላይ...");
        } else if (current < 82) {
          step = 0.8;
          setStatusLabel("ዳታቤዝ በማዘጋጀት ላይ...");
        } else if (current >= 82 && current < 92) {
          step = 0.03; // STUTTER: Heavy lifting
          setStatusLabel("የመጨረሻ ዝግጅት...");
        } else {
          step = 0.04;
        }
      }

      current += step + Math.random() * 0.02;
      if (current >= 100) {
        current = 100;
        clearInterval(progressTimerRef.current!);
        handleFinish();
      }
      setProgress(current);
    }, 60);
  };

  const handleFinish = async () => {
    fireCelebration();
    setIsComplete(true);
    localStorage.setItem("pwa_installed", "true");

    if (user?.id) {
      await supabase
        .from("profiles")
        .update({ isPwaInstalled: true })
        .eq("id", user.id);
    }

    // Auto-reload for updates or if already in app mode
    if (isRunningStandalone() || mode === "update") {
      setTimeout(() => window.location.reload(), 2500);
    }
  };

  useEffect(() => {
    installManager.register();

    const onInstalled = () => {
      isRealInstallComplete.current = true;
    };

    window.addEventListener("appinstalled", onInstalled);
    installManager.onInstalled(onInstalled);

    window.addEventListener("swUpdateAvailable", () => {
      setMode("update");
      setVisible(true);
    });

    window.addEventListener("lessonRead", () => {
      if (!isRunningStandalone() && installManager.canInstall() && !visible) {
        setMode("install");
        setVisible(true);
      } else if (installManager.isIOS() && !isRunningStandalone() && !visible) {
        setMode("ios");
        setVisible(true);
      }
    });

    return () => {
      window.removeEventListener("appinstalled", onInstalled);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [visible, isRunningStandalone, mode]);

  const handleAction = async () => {
    if (mode === "update") {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      runSimulation();
    } else if (mode === "install") {
      const ok = await installManager.promptInstall();
      if (ok) runSimulation();
    } else {
      setVisible(false);
    }
  };

  if (!visible || !mode) return null;

  const content = {
    update: {
      title: "አዲስ ስሪት",
      desc: "የተሻሻሉ አገልግሎቶችን ለማግኘት አሁኑኑ ያድሱ።",
      btn: "አድስ",
      icon: <Download className="w-8 h-8 text-amber-600" />,
      bg: "from-amber-50 to-orange-50",
    },
    install: {
      title: "ሕንጸተ ሰብእ",
      desc: "ያለ ኢንተርኔት ለመጠቀም አፑን ስልክዎ ላይ ይጫኑ።",
      btn: "ጫን",
      icon: <Download className="w-8 h-8 text-[#9b5c12]" />,
      bg: "from-[#fef8f2] to-[#f5e6d3]",
    },
    ios: {
      title: "በ iPhone ይጠቀሙ",
      desc: "ይህንን ገጽ 'Add to Home Screen' በማድረግ ይጫኑ።",
      btn: "ገባኝ",
      icon: <Share className="w-8 h-8 text-blue-600" />,
      bg: "from-blue-50 to-indigo-50",
    },
  }[mode];

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl animate-in fade-in duration-700" />
      <div className="fixed inset-0 z-[101] flex items-end sm:items-center justify-center p-4">
        <div
          className={`relative bg-gradient-to-br ${content.bg} rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden border border-[#b99b6b]/40 animate-slide-up`}>
          <div className="p-8">
            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-6 border border-[#b99b6b]/20 mx-auto">
              {isComplete ? (
                <CheckCircle2 className="w-12 h-12 text-green-600 animate-in zoom-in duration-500" />
              ) : (
                <div className={isInstalling ? "animate-pulse" : ""}>
                  {content.icon}
                </div>
              )}
            </div>

            <div className="text-center mb-10 relative">
              {/* Sub-header Badge - Adds a "Technical" Premium Feel */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9b5c12]/5 border border-[#9b5c12]/10 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isComplete ? "bg-green-500" : "bg-amber-500"
                    }`}></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isComplete ? "bg-green-600" : "bg-amber-600"
                    }`}></span>
                </span>
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#9b5c12]/80">
                  {isComplete
                    ? "System Verified"
                    : isInstalling
                    ? "Processing"
                    : "Available Offline"}
                </span>
              </div>

              {/* Main Title - Mobile First text-3xl to text-4xl */}
              <h2 className="text-3xl sm:text-4xl font-black text-[#3d1c1d] mb-3 font-serif italic tracking-tight leading-tight">
                {isComplete
                  ? "ተጠናቋል!"
                  : isInstalling
                  ? mode === "update"
                    ? "በማዘመን ላይ..."
                    : "በመጫን ላይ..."
                  : content.title}
              </h2>

              {/* for mobile readability */}
              <div className="min-h-[50px] flex items-center justify-center px-2">
                <p className="text-[#3d1c1d]/70 text-sm leading-relaxed font-medium text-balance transition-all duration-500">
                  {isComplete ? (
                    mode === "update" ? (
                      "መተግበሪያው በተሳካ ሁኔታ ታድሷል። አሁን አዲሱን ስሪት መጠቀም ይችላሉ።"
                    ) : (
                      "መተግበሪያው በተሳካ ሁኔታ ተጭኗል። አሁን ያለ ኢንተርኔት መጠቀም ይችላሉ።"
                    )
                  ) : isInstalling ? (
                    <span className="inline-block animate-pulse text-[#9b5c12]">
                      {statusLabel}
                    </span>
                  ) : (
                    content.desc
                  )}
                </p>
              </div>
            </div>

            {isInstalling ? (
              <div className="px-2">
                {!isComplete ? (
                  <>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b5c12]/50">
                        {mode === "update" ? "Updating Engine" : "Optimization"}
                      </span>
                      <span className="text-sm font-black text-[#9b5c12] tabular-nums">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-3 w-full bg-[#9b5c12]/10 rounded-full border border-[#b99b6b]/20 p-[2px] shadow-inner overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#9b2d30] via-[#9b5c12] to-[#b99b6b] transition-all duration-300 relative"
                        style={{ width: `${progress}%` }}>
                        <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                      </div>
                    </div>
                  </>
                ) : !isRunningStandalone() && mode === "install" ? (
                  <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full py-4 rounded-2xl bg-[#9b5c12] text-white font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
                      <Monitor size={18} /> እዚሁ ቀጥል
                    </button>
                    <button
                      onClick={() => (window.location.href = "/")}
                      className="w-full py-4 rounded-2xl border-2 border-[#9b5c12] text-[#9b5c12] font-bold flex items-center justify-center gap-3 active:scale-95 transition-all">
                      <Smartphone size={18} /> አፑን ክፈት
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAction}
                  className="w-full py-4.5 rounded-2xl bg-[#9b5c12] text-white font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                  <LayoutTemplate size={20} />{" "}
                  <span className="font-serif uppercase tracking-widest text-sm">
                    {content.btn}
                  </span>
                </button>
                <button
                  onClick={() => setVisible(false)}
                  className="w-full py-3 text-[#5c3a2e]/50 text-xs font-bold uppercase tracking-widest">
                  ለጊዜው ይቆይ
                </button>
              </div>
            )}
          </div>
          {!isInstalling && (
            <button
              title="Close"
              onClick={() => setVisible(false)}
              className="absolute top-6 right-6 p-2 text-[#9b5c12]/30 hover:text-[#9b5c12] transition-colors">
              <X size={24} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
