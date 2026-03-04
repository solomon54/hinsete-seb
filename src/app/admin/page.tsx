// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/db/browser-client";
import {
  Users,
  DownloadCloud,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Search,
  X,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatAmharicDate } from "@/lib/utils/ethiopianCalendar"; // ← Import from your existing file
import { UserNav } from "../components/profile/UserNav";

interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: "STUDENT" | "ADMIN" | "OWNER" | "USER";
  joinDate: string | null;
  lastSyncTimestamp: string | null;
  avatarUrl: string | null;
  isPwaInstalled: boolean;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalAdmins: 0,
    pwaInstalls: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "OWNER") {
      router.replace("/");
      return;
    }

    async function fetchAdminData() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: profilesData,
          error: profilesError,
          count,
        } = await supabase
          .from("profiles")
          .select(
            "id, email, name, role, joinDate, lastSyncTimestamp, avatarUrl, isPwaInstalled",
            {
              count: "exact",
            }
          )
          .order("joinDate", { ascending: false });

        if (profilesError) throw profilesError;

        const data = (profilesData as Profile[]) || [];
        setProfiles(data);

        setStats({
          totalUsers: count || data.length,
          totalOwners: data.filter((p) => p.role === "OWNER").length,
          totalAdmins: data.filter((p) => p.role === "ADMIN").length,
          pwaInstalls: data.filter((p) => p.isPwaInstalled === true).length,
        });
      } catch (err: any) {
        console.error("Admin fetch error:", err);
        setError("ዳታ ማምጣት አልተሳካም። እባክዎ እንደገና ይሞክሩ።");
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, [user, authLoading, router, supabase]);

  // Live search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    const q = searchQuery.toLowerCase();
    setFilteredProfiles(
      profiles.filter(
        (p) =>
          (p.name?.toLowerCase() || "").includes(q) ||
          p.email.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, profiles]);

  const handleViewDetails = async (targetUser: Profile) => {
    setSelectedUser(targetUser);
    setLoadingProgress(true);

    const { data } = await supabase
      .from("user_progress")
      .select("*")
      .eq("userId", targetUser.id);

    setUserProgress(data || []);
    setLoadingProgress(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf1] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#9b2d30]" />
          <p className="font-serif italic text-[#9b2d30]">
            የአስተዳዳሪ መረጃ በመጫን ላይ...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fdfaf1] flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-red-200 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#3d1c1d] mb-2">ስህተት ተፈጥሯል</h2>
          <p className="text-[#3d1c1d]/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#fdfaf1] to-[#f8f0e8] p-6 md:p-10">
      <div className="right-2 top-2 z-20 fixed">
        <UserNav />
      </div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-[#9b2d30]" />
            <h1 className="text-3xl md:text-4xl font-black text-[#3d1c1d] font-serif italic tracking-tight">
              የአስተዳዳሪ ክፍል
            </h1>
          </div>

          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b2d30]/40"
              size={18}
            />
            <input
              type="text"
              placeholder="በስም ወይም ኢሜይል ፈልግ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#9b2d30]/15 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9b2d30]/30"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Users className="w-8 h-8 text-[#9b2d30]" />}
            label="ጠቅላላ ተጠቃሚዎች"
            value={stats.totalUsers}
          />
          <StatCard
            icon={<ShieldAlert className="w-8 h-8 text-amber-600" />}
            label="ባለቤቶች"
            value={stats.totalOwners}
            accent="amber"
          />
          <StatCard
            icon={<ShieldCheck className="w-8 h-8 text-[#9b2d30]" />}
            label="አስተዳዳሪዎች"
            value={stats.totalAdmins}
          />
          <StatCard
            icon={<DownloadCloud className="w-8 h-8 text-blue-600" />}
            label="ጭነቶች (PWA)"
            value={stats.pwaInstalls}
            accent="default"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white/90 backdrop-blur-md rounded-[32px] border border-[#9b2d30]/15 shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-[#9b2d30]/10 bg-linear-to-r from-[#fdfaf1] to-[#f8f0e8]">
            <h2 className="text-2xl font-black text-[#3d1c1d] font-serif italic flex items-center gap-3">
              <Users className="w-7 h-7 text-[#9b2d30]" />
              ሁሉም ተጠቃሚዎች
            </h2>
            <p className="text-sm text-[#3d1c1d]/60 mt-1">
              {stats.totalUsers} ተጠቃሚዎች ተመዝግበዋል
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-[#fdfaf1]/80 border-b border-[#9b2d30]/10">
                <tr className="text-xs font-black uppercase tracking-wider text-[#9b2d30]/70">
                  <th className="px-8 py-5">ተጠቃሚ</th>
                  <th className="px-8 py-5">ሚና</th>
                  <th className="px-8 py-5 hidden md:table-cell">የተመዘገበበት</th>
                  <th className="px-8 py-5 hidden lg:table-cell">መጨረሻ መግቢያ</th>
                  <th className="px-8 py-5 text-right">ተግባር</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9b2d30]/5">
                {filteredProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-[#fdfaf1]/60 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#9b2d30]/10 flex items-center justify-center text-[#9b2d30] font-bold overflow-hidden border border-[#9b2d30]/10 shadow-sm">
                          {profile.avatarUrl ? (
                            <img
                              src={profile.avatarUrl}
                              alt={profile.name || ""}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {profile.name?.charAt(0)?.toUpperCase() || (
                                <User className="w-5 h-5" />
                              )}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#3d1c1d]">
                            {profile.name || "ስም አልተገለጸም"}
                          </p>
                          <p className="text-xs text-[#3d1c1d]/60">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                          profile.role === "OWNER"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : profile.role === "ADMIN"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : profile.role === "USER"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-[#3d1c1d]/70 hidden md:table-cell">
                      {profile.joinDate
                        ? formatAmharicDate(new Date(profile.joinDate))
                        : "—"}
                      &nbsp; ዓ.ም
                    </td>
                    <td className="px-8 py-5 text-sm text-[#3d1c1d]/70 hidden lg:table-cell">
                      {profile.lastSyncTimestamp
                        ? formatAmharicDate(new Date(profile.lastSyncTimestamp))
                        : "—"}
                      &nbsp; ዓ.ም
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleViewDetails(profile)}
                        className="text-xs font-bold px-5 py-2.5 rounded-2xl border border-[#9b2d30]/20 hover:bg-[#9b2d30] hover:text-white transition-all">
                        ዝርዝር
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* === USER DETAIL MODAL === */}
      {selectedUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="relative p-8 text-center">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-6 right-6 p-2 text-[#9b2d30] hover:bg-[#9b2d30]/10 rounded-full transition">
                <X size={22} />
              </button>

              <div className="w-24 h-24 mx-auto rounded-full bg-[#9b2d30]/10 flex items-center justify-center text-4xl font-black text-[#9b2d30] overflow-hidden border-4 border-white shadow-md">
                {selectedUser.avatarUrl ? (
                  <img
                    src={selectedUser.avatarUrl}
                    className="w-full h-full object-cover"
                    alt="User avatar"
                  />
                ) : (
                  selectedUser.name?.charAt(0)?.toUpperCase() || <User />
                )}
              </div>

              <h3 className="mt-6 text-2xl font-black text-[#3d1c1d]">
                {selectedUser.name || "ስም አልተገለጸም"}
              </h3>
              <p className="text-sm text-[#3d1c1d]/60">{selectedUser.email}</p>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#9b2d30]/60 mb-2">
                    የተመዘገበበት ቀን
                  </p>
                  <p className="font-bold text-lg">
                    {selectedUser.joinDate
                      ? formatAmharicDate(new Date(selectedUser.joinDate))
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-[#9b2d30]/60 mb-3">
                    የትምህርት ሂደት
                  </p>
                  {loadingProgress ? (
                    <Loader2 className="animate-spin mx-auto text-[#9b2d30]" />
                  ) : userProgress.length === 0 ? (
                    <p className="text-sm italic text-[#3d1c1d]/50">
                      ገና ምንም ትምህርት አልተጀመረም
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {userProgress.map((p) => (
                        <div
                          key={p.chapterId}
                          className="flex justify-between items-center bg-white border border-[#9b2d30]/10 p-4 rounded-2xl shadow-sm">
                          <div>
                            <p className="font-bold">
                              ሳምንት {p.chapterId.replace("ch_", "")}
                            </p>
                            <p className="text-xs text-[#3d1c1d]/50">
                              {p.completedActions?.length || 0} ተግባራት
                            </p>
                          </div>
                          <div
                            className={`px-4 py-1 rounded-full text-xs font-bold ${
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
                onClick={() => setSelectedUser(null)}
                className="mt-10 w-full py-4 bg-[#3d1c1d] text-white font-bold rounded-2xl active:scale-95 transition-all">
                ተመለስ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Premium Stat Card (type-safe, no opacity)
function StatCard({
  icon,
  label,
  value,
  accent = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: "default" | "amber";
}) {
  return (
    <div
      className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl border shadow-lg hover:shadow-xl transition-all ${
        accent === "amber" ? "border-amber-400/30" : "border-[#9b2d30]/15"
      }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="p-3 bg-white rounded-2xl shadow-sm text-[#9b2d30]">
          {icon}
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-[#9b2d30]/60">
          {label}
        </span>
      </div>
      <p
        className={`text-5xl font-black mt-4 ${
          accent === "amber" ? "text-amber-700" : "text-[#3d1c1d]"
        }`}>
        {value}
      </p>
    </div>
  );
}
