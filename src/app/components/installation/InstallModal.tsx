// src/app/components/installation/InstallModal.tsx
"use client";
import { useState, useEffect } from "react";
import { InstallManager } from "@/lib/installManager";

interface InstallModalProps {
  lessonProgress?: { completed: number; total: number };
}

export default function InstallModal({ lessonProgress }: InstallModalProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("Prepare to install Hinsete!");
  let managerRef = useState<InstallManager | null>(null)[0];

  useEffect(() => {
    const manager = new InstallManager();
    managerRef = manager;

    manager.showIOSInstallInstructions();

    const showInstallPrompt = () => {
      setMessage("Install Hinsete on your device for full offline access!");
      setVisible(true);
    };

    window.addEventListener("lessonRead", showInstallPrompt);

    managerRef.onInstalled(() => {
      console.log("[InstallModal] PWA installed successfully");
      setVisible(false);
    });

    return () => window.removeEventListener("lessonRead", showInstallPrompt);
  }, []);

  const handleInstall = () => {
    managerRef?.promptInstall();
    setVisible(false);
  };

  const handleDismiss = () => setVisible(false);

  if (!visible) return null;

  const progressText = lessonProgress?.total
    ? `Progress: ${lessonProgress.completed}/${lessonProgress.total} lessons read`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-[#fef8f2] rounded-t-2xl shadow-xl w-full max-w-md p-6 animate-slideUp">
        <h2 className="text-lg font-bold text-[#9b5c12] mb-2">{message}</h2>
        {progressText && (
          <p className="text-sm text-[#3d1c1d] mb-4">{progressText}</p>
        )}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-lg bg-gray-300 text-[#3d1c1d] hover:bg-gray-400 transition">
            Dismiss
          </button>
          <button
            onClick={handleInstall}
            className="px-4 py-2 rounded-lg bg-[#9b5c12] text-[#fff8f0] hover:bg-[#b37b4c] transition">
            Install
          </button>
        </div>
      </div>
      <style jsx>{`
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
        @keyframes slideUp {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
