// src/app/components/profile/UserNav.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/db/browser-client";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      setIsOpen(false);
      await supabase.auth.signOut();
      // Use window.location for a hard reset of the auth state
      window.location.href = "/auth";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/auth";
    }
  };

  if (!user) return null;

  const isOwner = user.role === "OWNER";
  const displayName = user.display_name || user.email?.split("@")[0] || "User";
  const initials = displayName.substring(0, 2).toUpperCase();
  const avatarUrl = user.avatarUrl;

  const roleBadge = isOwner
    ? {
        bg: "bg-gradient-to-r from-amber-600 to-amber-400",
        text: "text-amber-50",
        icon: <ShieldAlert size={10} />,
        label: "ባለቤት (Owner)",
      }
    : {
        bg: "bg-gradient-to-r from-emerald-600 to-emerald-400",
        text: "text-emerald-50",
        icon: <ShieldCheck size={10} />,
        label: "የተረጋገጠ (Verified)",
      };

  return (
    <div className="right-2 top-2 inline-block fixed z-[100]" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9b2d30]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdfaf1]"
        aria-label="User menu">
        {/* Avatar background / image */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#9b2d30] to-[#3d1c1d] shadow-md">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-semibold text-base md:text-lg tracking-tight">
              {initials}
            </div>
          )}
        </div>
      </button>

      {/* RESTORED: Live status dot */}
      <span
        className={`
          absolute bottom-px -right-px
          w-2.5 h-2.5 md:w-2.75 md:h-2.75
          rounded-full
          border-[1.5px] border-[#fdfaf1]
          shadow-[0_1px_3px_rgba(0,0,0,0.2)]
          transition-all duration-200
          z-[101]
          ${
            isOwner
              ? "bg-violet-600 ring-1 ring-violet-600"
              : "bg-emerald-600 ring-1 ring-emerald-600"
          }
        `}
        aria-hidden="true"
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl border border-[#9b2d30]/15 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right z-[120]"
          style={{ transformOrigin: "top right" }}>
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#9b2d30]/10 bg-linear-to-b from-[#fdfaf1]/80 to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#9b2d30]/10 flex items-center justify-center text-[#9b2d30] font-bold text-lg shadow-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#3d1c1d] truncate">
                  {displayName}
                </p>
                <p className="text-xs text-[#3d1c1d]/60 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide shadow-sm ${roleBadge.bg} ${roleBadge.text}`}>
              {roleBadge.icon}
              {roleBadge.label}
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {isOwner && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-amber-700 hover:bg-amber-50/70 transition-colors">
                <LayoutDashboard size={18} />
                የአስተዳዳሪ ክፍል (Admin Dashboard)
              </Link>
            )}

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-[#3d1c1d] hover:bg-[#9b2d30]/5 transition-colors">
              <UserIcon size={18} className="text-[#9b2d30]" />
              የግል መረጃ (Profile)
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-[#9b2d30]/10 mt-1 pt-3">
              <LogOut size={18} />
              ውጣ (Logout)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
