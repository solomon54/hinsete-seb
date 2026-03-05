//src/app/components/admin/UsersList.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/browser-client";
import { formatAmharicDate } from "@/lib/utils/ethiopianCalendar";
import { User, DownloadCloud, MoreHorizontal, Globe } from "lucide-react";
import UserDetailModal from "./UserDetailModal";

export default function UsersList({ searchQuery }: { searchQuery: string }) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getProfiles() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("joinDate", { ascending: false });
      setProfiles(data || []);
    }
    getProfiles();
  }, [supabase]);

  const filtered = profiles.filter(
    (p) =>
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-[#9b2d30]/15 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-[#fdfaf1]/80 border-b border-[#9b2d30]/10">
              <tr className="text-[10px] font-black uppercase tracking-wider text-[#9b2d30]/70">
                <th className="px-6 py-4">USER PROFILE</th>
                <th className="px-6 py-4">APP INSTALLED?</th>
                <th className="px-6 py-4">ROLE</th>
                <th className="px-6 py-4">JOINED</th>
                <th className="px-6 py-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#9b2d30]/5">
              {filtered.map((profile) => (
                <tr
                  key={profile.id}
                  className="hover:bg-[#fdfaf1]/60 transition-colors group">
                  {/* Profile Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#9b2d30]/10 flex items-center justify-center text-[#9b2d30] font-bold overflow-hidden border border-[#9b2d30]/10 shrink-0">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>
                            {profile.name?.charAt(0) || <User size={18} />}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#3d1c1d] text-sm uppercase tracking-tight">
                          {profile.name || "ስም አልተገለጸም"}
                        </p>
                        <p className="text-xs text-[#3d1c1d]/60 truncate italic">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status with Icon and Text */}
                  <td className="px-6 py-4">
                    {profile.isPwaInstalled ? (
                      <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-wide">
                        <DownloadCloud size={16} />
                        <span>Installed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[#3d1c1d]/40 italic text-xs uppercase tracking-wide">
                        <Globe size={16} className="opacity-50" />
                        <span>Web Only</span>
                      </div>
                    )}
                  </td>

                  {/* Role with original colors, no heavy borders */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${
                        profile.role === "OWNER"
                          ? "bg-amber-100 text-amber-700"
                          : profile.role === "ADMIN"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                      {profile.role}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="px-6 py-4 text-xs text-[#3d1c1d]/70 font-medium">
                    {profile.joinDate
                      ? formatAmharicDate(new Date(profile.joinDate))
                      : "—"}
                  </td>

                  {/* Clean Action Button */}
                  <td className="px-6 py-4 text-right">
                    <button
                      title="View Details"
                      onClick={() => setSelectedUser(profile)}
                      className="p-2 hover:bg-[#9b2d30] hover:text-white rounded-xl transition-all text-[#9b2d30] bg-[#9b2d30]/5 active:scale-95">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}
