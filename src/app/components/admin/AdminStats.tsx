//src/app/components/admin/AdminStats.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/browser-client";
import {
  Users,
  DownloadCloud,
  ShieldAlert,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalAdmins: 0,
    pwaInstalls: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase
        .from("profiles")
        .select("role, isPwaInstalled");

      if (data) {
        setStats({
          totalUsers: data.length,
          totalOwners: data.filter((p) => p.role === "OWNER").length,
          totalAdmins: data.filter((p) => p.role === "ADMIN").length,
          pwaInstalls: data.filter((p) => p.isPwaInstalled === true).length,
        });
      }
    }
    fetchStats();
  }, [supabase]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
      <StatCard
        icon={<Users size={28} />}
        label="ጠቅላላ ተጠቃሚዎች"
        value={stats.totalUsers}
        accent="red"
      />
      <StatCard
        icon={<ShieldAlert size={28} />}
        label="ባለቤቶች"
        value={stats.totalOwners}
        accent="amber"
      />
      <StatCard
        icon={<ShieldCheck size={28} />}
        label="አስተዳዳሪዎች"
        value={stats.totalAdmins}
        accent="blue"
      />
      <StatCard
        icon={<DownloadCloud size={28} />}
        label="የጫኑ (PWA)"
        value={stats.pwaInstalls}
        accent="green"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: "red" | "amber" | "blue" | "green";
}) {
  const themes = {
    red: {
      border: "border-[#9b2d30]/10",
      bg: "bg-[#9b2d30]/5",
      text: "text-[#9b2d30]",
      glow: "group-hover:shadow-[#9b2d30]/10",
    },
    amber: {
      border: "border-amber-500/10",
      bg: "bg-amber-500/5",
      text: "text-amber-600",
      glow: "group-hover:shadow-amber-500/10",
    },
    blue: {
      border: "border-blue-500/10",
      bg: "bg-blue-500/5",
      text: "text-blue-600",
      glow: "group-hover:shadow-blue-500/10",
    },
    green: {
      border: "border-green-500/10",
      bg: "bg-green-500/5",
      text: "text-green-600",
      glow: "group-hover:shadow-green-500/10",
    },
  };

  const style = themes[accent];

  return (
    <div
      className={`group relative bg-white/90 backdrop-blur-xl p-6 rounded-[32px] border ${style.border} shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${style.glow}`}>
      {/* Decorative background flare */}
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${style.bg}`}
      />

      <div className="flex justify-between items-start relative z-10">
        <div
          className={`p-3 rounded-2xl shadow-inner transition-colors duration-300 ${style.bg} ${style.text}`}>
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#3d1c1d]/40">
            {label}
          </span>
          <div
            className={`flex items-center gap-1 mt-1 font-black text-[10px] ${style.text}`}>
            <ArrowUpRight size={12} />
            <span>LIVE</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-baseline gap-2 relative z-10">
        <p
          className={`text-5xl font-black font-serif tracking-tight ${style.text}`}>
          {value.toLocaleString()}
        </p>
        <span className="text-xs font-bold text-[#3d1c1d]/30 lowercase">
          Active users
        </span>
      </div>
    </div>
  );
}
