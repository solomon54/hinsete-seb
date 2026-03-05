// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Loader2,
  Search,
  MessageSquare,
  Users,
  LayoutDashboard,
} from "lucide-react";

import { UserNav } from "../components/profile/UserNav";
import AdminStats from "../components/admin/AdminStats";
import UsersList from "../components/admin/UsersList";
import Feedback from "../components/admin/Feedback";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State for UI Toggles
  const [activeTab, setActiveTab] = useState<"users" | "feedback">("users");
  const [searchQuery, setSearchQuery] = useState("");

  // Guard Clause: Only 'OWNER' can be here
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "OWNER")) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fdfaf1] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#9b2d30]" />
          <p className="font-serif italic text-[#9b2d30]">መረጃ በመጫን ላይ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#fdfaf1] to-[#f8f0e8] p-6 md:p-10 pb-32">
      {/* Fixed User Navigation */}
      <div className="right-4 top-4 z-50 fixed">
        <UserNav />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* --- Header Section --- */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#9b2d30] rounded-2xl shadow-lg shadow-[#9b2d30]/20">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#3d1c1d] font-serif italic tracking-tight">
                የአስተዳዳሪ ክፍል
              </h1>
              <p className="text-xs text-[#9b2d30]/60 font-bold uppercase tracking-widest">
                Command Center • {activeTab === "users" ? "ተጠቃሚዎች" : "አስተያየቶች"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
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
              className="w-full pl-11 pr-4 py-4 bg-white border border-[#9b2d30]/15 rounded-[20px] text-sm focus:outline-none focus:ring-2 focus:ring-[#9b2d30]/30 shadow-sm transition-all"
            />
          </div>
        </header>

        {/* --- Stats Overview Component --- */}
        <AdminStats />

        {/* --- Navigation Tabs --- */}
        <div className="flex p-1 bg-[#9b2d30]/5 rounded-[24px] mb-8 w-fit border border-[#9b2d30]/10">
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            icon={<Users size={18} />}
            label="የተጠቃሚዎች ዝርዝር"
          />
          <TabButton
            active={activeTab === "feedback"}
            onClick={() => setActiveTab("feedback")}
            icon={<MessageSquare size={18} />}
            label="የተጠቃሚዎች አስተያየት"
          />
        </div>

        {/* --- Main Content Area --- */}
        <div className="animate-slide-up">
          {activeTab === "users" ? (
            <UsersList searchQuery={searchQuery} />
          ) : (
            <Feedback searchQuery={searchQuery} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Sub-component for Tab Navigation
 */
function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-[20px] font-bold transition-all ${
        active
          ? "bg-white text-[#9b2d30] shadow-sm"
          : "text-[#9b2d30]/60 hover:text-[#9b2d30] hover:bg-white/50"
      }`}>
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}
