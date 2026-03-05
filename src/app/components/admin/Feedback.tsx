"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/browser-client";
import {
  MessageSquare,
  Clock,
  User,
  Trash2,
  Mail,
  ExternalLink,
  Shield,
  Send,
  X,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { formatAmharicDate } from "@/lib/utils/ethiopianCalendar";

// Define the interface for props to fix the TypeScript error
interface FeedbackProps {
  searchQuery: string;
}

export default function Feedback({ searchQuery }: FeedbackProps) {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [successId, setSuccessId] = useState<string | null>(null);

  const supabase = createClient();

  // Helper to format 12-hour time with Amharic period labels
  const formatEthioTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "ከሰዓት" : "ጥዋት";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  };

  async function fetchFeedback() {
    const { data, error } = await supabase
      .from("feedback")
      .select(
        `id, content, created_at, page_context, profiles ( name, email, avatarUrl, role )`
      )
      .order("created_at", { ascending: false });
    if (!error) setFeedbacks(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchFeedback();
  }, []);

  // Filter feedback based on search query (Name, Email, or Message Content)
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const query = searchQuery.toLowerCase();
    return (
      fb.content.toLowerCase().includes(query) ||
      fb.profiles?.name?.toLowerCase().includes(query) ||
      fb.profiles?.email?.toLowerCase().includes(query)
    );
  });

  const confirmDelete = async (id: string) => {
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (!error) setFeedbacks(feedbacks.filter((f) => f.id !== id));
    setDeletingId(null);
  };

  const handleSendEmail = async (
    fbId: string,
    email: string,
    content: string
  ) => {
    // Logic for sending email would go here
    console.log(`Sending to ${email}: ${content}`);

    setSuccessId(fbId);
    setReplyingTo(null);
    setReplyText("");

    // Auto-hide success message after 3 seconds
    setTimeout(() => setSuccessId(null), 3000);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 text-[#9b2d30]">
        <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 px-2">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-[#3d1c1d] font-serif italic flex items-center gap-3">
          <MessageSquare className="text-[#9b2d30]" size={28} /> የደንበኞች አስተያየት
        </h2>
      </div>

      {filteredFeedbacks.length === 0 ? (
        <div className="text-center p-20 bg-white/40 rounded-[32px] border border-dashed border-[#9b2d30]/20 italic text-[#3d1c1d]/40">
          ምንም ተዛማጅ መልእክት አልተገኘም
        </div>
      ) : (
        filteredFeedbacks.map((fb) => {
          const date = new Date(fb.created_at);
          const timeStr = formatEthioTime(date);

          return (
            <div
              key={fb.id}
              className="bg-white/90 backdrop-blur-md p-5 md:p-6 rounded-[32px] border border-[#9b2d30]/10 shadow-sm transition-all overflow-hidden relative">
              {/* Inline Success Toast Overlay */}
              {successId === fb.id && (
                <div className="absolute inset-0 bg-white/95 z-10 flex items-center justify-center animate-in fade-in duration-300">
                  <div className="flex flex-col items-center gap-2 text-green-600">
                    <CheckCircle2 size={40} className="animate-bounce" />
                    <p className="font-black text-sm uppercase tracking-widest">
                      መልእክቱ ተልኳል!
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start gap-2 mb-4">
                <div className="flex items-center gap-3">
                  {/* Perfect Circle Avatar */}
                  <div className="w-11 h-11 rounded-full bg-[#9b2d30]/5 flex items-center justify-center font-bold text-[#9b2d30] border border-[#9b2d30]/10 shrink-0 overflow-hidden shadow-inner">
                    {fb.profiles?.avatarUrl ? (
                      <img
                        src={fb.profiles.avatarUrl}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <span className="text-lg">
                        {fb.profiles?.name?.charAt(0) || <User size={20} />}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-[#3d1c1d] text-sm truncate uppercase tracking-tight">
                      {fb.profiles?.name || "ስም አልተገለጸም"}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] text-[#3d1c1d]/50 truncate">
                        {fb.profiles?.email}
                      </p>
                      {/* Email Up Arrow */}
                      <ChevronUp size={10} className="text-[#9b2d30]/40" />
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1.5 text-[9px] font-black text-[#9b2d30]/60 bg-[#fdfaf1] px-2 py-1 rounded-lg">
                    <Clock size={10} />
                    <span>{formatAmharicDate(date)} ዓ.ም</span>
                    <span className="opacity-30"> |</span>
                    <span className="tracking-tighter">{timeStr}</span>
                  </div>
                  <p className="text-[9px] text-blue-500 font-bold mt-1 uppercase tracking-tighter flex items-center justify-end gap-1">
                    <ExternalLink size={10} /> {fb.page_context || "General"}
                  </p>
                </div>
              </div>

              <div className="bg-[#fdfaf1]/40 p-4 rounded-2xl border-l-2 border-[#9b2d30]/20 mb-4 shadow-inner">
                <p className="text-[#3d1c1d] text-sm leading-relaxed whitespace-pre-wrap italic">
                  {fb.content}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#9b2d30]/5 pt-4">
                <button
                  onClick={() =>
                    setReplyingTo(replyingTo === fb.id ? null : fb.id)
                  }
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm active:scale-95 ${
                    replyingTo === fb.id
                      ? "bg-[#3d1c1d] text-white"
                      : "bg-[#9b2d30]/5 text-[#9b2d30]"
                  }`}>
                  <Mail size={14} />{" "}
                  {replyingTo === fb.id ? "ተው (Cancel)" : "ምላሽ (Reply)"}
                </button>

                {deletingId === fb.id ? (
                  <div className="flex items-center gap-1 animate-in slide-in-from-right-2">
                    <button
                      onClick={() => confirmDelete(fb.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-xl text-[9px] font-bold uppercase shadow-md shadow-red-200">
                      አጥፋ
                    </button>
                    <button
                      title="Cancel"
                      onClick={() => setDeletingId(null)}
                      className="p-2 bg-gray-100 text-gray-500 rounded-xl">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    title="Delete Feedback"
                    onClick={() => setDeletingId(fb.id)}
                    className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Inline Reply Form */}
              {replyingTo === fb.id && (
                <div className="mt-4 p-4 bg-white border border-[#9b2d30]/10 rounded-2xl animate-in fade-in slide-in-from-top-2 shadow-inner">
                  <textarea
                    autoFocus
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="መልእክትዎን እዚህ ይጻፉ..."
                    className="w-full p-3 text-sm border-none focus:ring-0 placeholder-[#3d1c1d]/30 min-h-[120px] resize-none bg-transparent"
                  />
                  <div className="flex justify-end pt-3 border-t border-[#9b2d30]/5">
                    <button
                      disabled={!replyText.trim()}
                      onClick={() =>
                        handleSendEmail(fb.id, fb.profiles.email, replyText)
                      }
                      className="flex items-center gap-2 bg-[#9b2d30] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase disabled:opacity-30 shadow-md active:scale-95 transition-transform">
                      <Send size={14} /> መልእክት ላክ
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
