//src/app/components/security/ClientSecurity.tsx
"use client";

import { useEffect, useState } from "react";

export default function ClientSecurity() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // 1. SELECTION & INTERACTION
    const blockEvents = (e: any) => {
      const target = e.target as HTMLElement;

      if (!target || target.nodeType !== 1) return;

      if (
        target.closest("input, textarea, .ProseMirror") ||
        target.isContentEditable
      ) {
        return;
      }

      e.preventDefault();
      return false;
    };

    // 2. CONSOLE POISONING
    const warnTheInspector = () => {
      console.clear();
      console.log(
        "%c ⚠ CRITICAL SECURITY VIOLATION ⚠ ",
        "color: white; background: #ff0000; font-size: 35px; font-weight: bold; border: 4px solid black; padding: 10px; text-shadow: 3px 3px 0px #000;"
      );
      console.log(
        "%cUnauthorized access attempt detected. Your session has been flagged.",
        "color: red; font-size: 16px; margin-top: 10px; font-family: monospace;"
      );
    };

    // 3. SILENT DEVTOOLS DETECTION
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        setBlocked(true);
      }

      const start = performance.now();
      new Function("return true")();
      const end = performance.now();
      if (end - start > 40) {
        setBlocked(true);
      }
    };

    // 4. GLOBAL HOTKEYS
    const handleKeydown = (e: KeyboardEvent) => {
      const isMac =
        typeof window !== "undefined" &&
        /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (
        e.keyCode === 123 ||
        (cmdOrCtrl && e.shiftKey && [73, 74, 67].includes(e.keyCode)) ||
        (cmdOrCtrl && [85, 83].includes(e.keyCode))
      ) {
        e.preventDefault();
        setBlocked(true);
      }
    };

    window.addEventListener("contextmenu", blockEvents);
    window.addEventListener("selectstart", blockEvents);
    window.addEventListener("dragstart", blockEvents);
    window.addEventListener("keydown", handleKeydown);

    const interval = setInterval(() => {
      if (blocked) {
        clearInterval(interval);
        return;
      }
      detectDevTools();
      warnTheInspector();
    }, 1000);

    return () => {
      window.removeEventListener("contextmenu", blockEvents);
      window.removeEventListener("selectstart", blockEvents);
      window.removeEventListener("dragstart", blockEvents);
      window.removeEventListener("keydown", handleKeydown);
      clearInterval(interval);
    };
  }, [blocked]);

  if (blocked) {
    return (
      <div className="fixed inset-0 bg-black text-red-700 flex items-center justify-center z-[999999] select-none pointer-events-auto overflow-hidden">
        <div className="text-center p-12 border-2 border-red-900 bg-black shadow-[0_0_150px_rgba(255,0,0,0.25)] max-w-xl">
          <div className="flex items-center justify-center gap-6 animate-pulse mb-8">
            <span className="text-5xl text-red-600">⚠</span>
            <h1 className="text-4xl font-light tracking-[0.25em] text-red-600 uppercase">
              System Terminated
            </h1>
            <span className="text-5xl text-red-600">⚠</span>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-red-800 to-transparent mb-10" />

          <div className="space-y-4 font-mono text-sm uppercase tracking-widest text-red-500/90">
            <p className="font-light">
              Protocol Error:{" "}
              <span className="text-red-500 font-bold">0x882</span>
            </p>
            <p className="font-light leading-relaxed">
              Unauthorized inspection detected.
              <br />
              Client environment has been locked.
            </p>
            <div className="pt-6">
              <span className="px-4 py-2 border border-red-900/50 text-[11px] text-red-800 tracking-tighter">
                ENVIRONMENT FLAG: COMPROMISED
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
