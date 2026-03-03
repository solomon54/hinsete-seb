//src/app/components/security/ClientSecurity.tsx
"use client";

import { useEffect, useState } from "react";

export default function ClientSecurity() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const disable = (e: Event) => e.preventDefault();

    // Disable right click
    document.addEventListener("contextmenu", disable);

    // Disable selection
    document.addEventListener("selectstart", disable);

    // Disable drag
    document.addEventListener("dragstart", disable);

    // Disable common shortcuts
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toLowerCase() === "u") ||
        (e.ctrlKey && e.key.toLowerCase() === "s")
      ) {
        e.preventDefault();
        setBlocked(true);
      }
    });

    // DevTools detection (best effort)
    const interval = setInterval(() => {
      const devtools =
        window.outerWidth - window.innerWidth > 160 ||
        window.outerHeight - window.innerHeight > 160;

      if (devtools) {
        setBlocked(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (blocked) {
    return (
      <div className="fixed inset-0 bg-black text-red-600 flex items-center justify-center z-[9999]">
        <div className="text-center p-6">
          <h1 className="text-3xl font-bold mb-4">⚠ SECURITY WARNING ⚠</h1>
          <p>
            Developer tools detected.
            <br />
            This session has been flagged.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
