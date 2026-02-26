//src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/db/browser-client";
import { Users, Download, TrendingUp, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, pwaInstalls: 0 });
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== "OWNER") {
      router.push("/"); // Boot non-owners out
      return;
    }

    async function fetchStats() {
      // 1. Get total registered users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // 2. Assuming you have a table for install events
      // const { count: installCount } = await supabase.from('analytics').select(...)

      setStats({ totalUsers: userCount || 0, pwaInstalls: 0 });
    }

    if (user?.role === "OWNER") fetchStats();
  }, [user, loading]);

  if (loading) return <div>Checking credentials...</div>;

  return (
    <div className="p-8 bg-[#fdfaf1] min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="text-[#9b2d30]" size={32} />
        <h1 className="text-3xl font-black text-[#3d1c1d] italic font-serif">
          የአስተዳዳሪ ክፍል (Admin)
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Registered Users */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#9b2d30]/10">
          <div className="flex items-center justify-between mb-4">
            <Users className="text-[#9b2d30]" />
            <span className="text-[10px] font-black uppercase text-[#9b2d30]/50 tracking-widest">
              Total Users
            </span>
          </div>
          <p className="text-4xl font-black text-[#3d1c1d]">
            {stats.totalUsers}
          </p>
          <p className="text-sm text-[#3d1c1d]/60 mt-2 font-medium">
            በመተግበሪያው ላይ የተመዘገቡ ተጠቃሚዎች
          </p>
        </div>

        {/* PWA Installs (Downloads) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#9b2d30]/10 opacity-60">
          <div className="flex items-center justify-between mb-4">
            <Download className="text-[#9b2d30]" />
            <span className="text-[10px] font-black uppercase text-[#9b2d30]/50 tracking-widest">
              Downloads
            </span>
          </div>
          <p className="text-4xl font-black text-[#3d1c1d]">TBD</p>
          <p className="text-sm text-[#3d1c1d]/60 mt-2 font-medium">
            መተግበሪያውን ወደ ስልካቸው የጫኑ (PWA)
          </p>
        </div>
      </div>
    </div>
  );
}
