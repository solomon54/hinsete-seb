// src/app/components/feedback/FeedBackPage.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth"; // Use your existing auth hook
import { createClient } from "@/lib/db/browser-client";
import { Send, Sparkles } from "lucide-react";

export default function Feedback({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // This gives us the ID and Email automatically
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!message.trim() || !user) return;
    setLoading(true);

    const { error } = await supabase.from("feedback").insert({
      profile_id: user.id, // Linked to your profiles table
      content: message,
      page_context: window.location.pathname,
    });

    if (!error) {
      // Trigger that premium confetti we built!
      // fireCelebration();
      alert("አስተያየትዎ ደርሶናል፣ እናመሰግናለን!");
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#fdfaf1] flex flex-col animate-slideUp">
      {/* Header with no X - using a "Back" or "Cancel" instead */}
      <div className="p-6 flex justify-between items-center border-b border-[#b99b6b]/10">
        <button onClick={onClose} className="text-[#9b5c12] font-semibold">
          ተመለስ
        </button>
        <h2 className="text-xl font-serif italic text-[#3d1c1d]">አስተያየት</h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 p-8 max-w-2xl mx-auto w-full">
        <p className="text-[#3d1c1d]/60 mb-6 text-center">
          ሰላም {user?.displayName || user?.email?.split("@")[0]}፣ ይህን መተግበሪያ የተሻለ
          ለማድረግ የእርስዎ አስተያየት ይረዳናል።
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="ሀሳብዎን እዚህ ይጻፉ..."
          className="w-full h-64 p-6 bg-white/50 border border-[#b99b6b]/30 rounded-3xl focus:ring-2 focus:ring-[#9b5c12] outline-none text-[#3d1c1d] resize-none transition-all shadow-inner"
        />

        <button
          onClick={handleSubmit}
          disabled={loading || !message.trim()}
          className="mt-8 relative overflow-hidden w-full py-5 rounded-2xl bg-[#9b5c12] text-white font-bold shadow-lg disabled:opacity-50 group">
          {/* Reuse your Shimmer Layer here */}
          <div className="shimmer-layer" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? "በመላክ ላይ..." : "አስተያየት ላክ"} <Send size={18} />
          </span>
        </button>
      </div>
    </div>
  );
}
