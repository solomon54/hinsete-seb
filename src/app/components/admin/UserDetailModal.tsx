//src/app/components/admin/UserDetailModal.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/browser-client";
import { formatAmharicDate } from "@/lib/utils/ethiopianCalendar";
import { X, User, Loader2 } from "lucide-react";

interface UserDetailModalProps {
  user: any;
  onClose: () => void;
}

export default function UserDetailModal({
  user,
  onClose,
}: UserDetailModalProps) {
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserProgress() {
      setLoading(true);
      const { data } = await supabase
        .from("user_progress")
        .select("*")
        .eq("userId", user.id);
      setProgress(data || []);
      setLoading(false);
    }
    fetchUserProgress();
  }, [user.id, supabase]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="relative p-8 text-center">
          <button
            title="Close"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-[#9b2d30] hover:bg-[#9b2d30]/10 rounded-full transition">
            <X size={22} />
          </button>

          {/* Avatar Section */}
          <div className="w-24 h-24 mx-auto rounded-full bg-[#9b2d30]/10 flex items-center justify-center text-4xl font-black text-[#9b2d30] overflow-hidden border-4 border-white shadow-md">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              user.name?.charAt(0)?.toUpperCase() || <User size={40} />
            )}
          </div>

          <h3 className="mt-6 text-2xl font-black text-[#3d1c1d]">
            {user.name || "ስም አልተገለጸም"}
          </h3>
          <p className="text-sm text-[#3d1c1d]/60">{user.email}</p>

          <div className="mt-8 space-y-6 text-left">
            <div className="bg-[#fdfaf1] p-4 rounded-2xl border border-[#9b2d30]/5">
              <p className="text-[10px] uppercase tracking-widest text-[#9b2d30]/60 mb-1 font-black">
                የተመዘገበበት ቀን
              </p>
              <p className="font-bold text-[#3d1c1d]">
                {user.joinDate
                  ? formatAmharicDate(new Date(user.joinDate))
                  : "—"}{" "}
                ዓ.ም
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#9b2d30]/60 mb-3 font-black px-1">
                የትምህርት ሂደት (Progress)
              </p>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-[#9b2d30]" />
                </div>
              ) : progress.length === 0 ? (
                <p className="text-sm italic text-[#3d1c1d]/40 text-center py-4">
                  ገና ምንም ትምህርት አልተጀመረም
                </p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {progress.map((p) => (
                    <div
                      key={p.chapterId}
                      className="flex justify-between items-center bg-white border border-[#9b2d30]/10 p-4 rounded-2xl shadow-sm">
                      <div>
                        <p className="font-bold text-[#3d1c1d]">
                          ሳምንት {p.chapterId.replace("ch_", "")}
                        </p>
                        <p className="text-[10px] text-[#3d1c1d]/50">
                          {p.completedActions?.length || 0} ተግባራት ተከናውነዋል
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-[10px] font-black ${
                          p.isCompleted
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                        {p.isCompleted ? "ተጠናቋል" : "በሂደት"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-10 w-full py-4 bg-[#3d1c1d] text-white font-bold rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-[#3d1c1d]/20">
            ተመለስ
          </button>
        </div>
      </div>
    </div>
  );
}
