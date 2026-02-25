// src/app/components/profile/UserNav.tsx
// src/app/components/profile/UserNav.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { User as UserIcon, LogOut, Settings } from "lucide-react";
import { supabase } from "@/lib/db/supabase";

export function UserNav() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
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
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  if (!user) return null;

  const initials = user.email?.substring(0, 2).toUpperCase() || "??";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#9b2d30] border-2 border-[#fdfaf1] shadow-lg flex items-center justify-center text-[#fdfaf1] font-bold active:scale-90 transition-transform overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm md:text-base">{initials}</span>
        )}
      </button>

      {/* Mini-Menu - Now controlled by isOpen state */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-[#fdfaf1] border border-[#9b2d30]/20 rounded-2xl shadow-2xl p-2 z-[110] animate-in fade-in zoom-in duration-200">
          <div className="px-4 py-3 border-b border-[#9b2d30]/10 mb-2">
            <p className="text-[10px] font-bold text-[#9b2d30]/50 uppercase tracking-widest">
              ተማሪ (Student)
            </p>
            <p className="text-xs font-bold truncate text-[#3d1c1d]">
              {user.email}
            </p>
          </div>

          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#3d1c1d] hover:bg-[#9b2d30]/5 rounded-xl transition-colors">
            <UserIcon size={16} className="text-[#9b2d30]" /> የግል መረጃ (Profile)
          </Link>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1">
            <LogOut size={16} /> ውጣ (Logout)
          </button>
        </div>
      )}
    </div>
  );
}
