// src/app/components/installation/InstallPrompt.tsx
"use client";
import { useEffect } from "react";
import { InstallManager } from "@/lib/installManager";

/**
 * Functional component to handle Android/iOS install prompt + SW updates
 */
export default function InstallPrompt() {
  useEffect(() => {
    const manager = new InstallManager();

    // iOS fallback
    manager.showIOSInstallInstructions();

    // Trigger install prompt on first lesson read
    const onFirstLessonRead = () => {
      manager.promptInstall();
    };

    // Optional callback when installation occurs
    manager.onInstalled(() => {
      console.log("[InstallPrompt] Hinsete installed successfully!");
    });

    // Listen for a custom event 'lessonRead'
    document.addEventListener("lessonRead", onFirstLessonRead);

    return () => {
      document.removeEventListener("lessonRead", onFirstLessonRead);
    };
  }, []);

  return null; // purely functional, no UI
}
