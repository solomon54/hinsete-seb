// src/app/components/navigation/MainNavigation.tsx
"use client";

import { Home, Info, MessageSquarePlus, User, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScrollDirection } from "@/config/useScrollDirection";

export default function Navbar() {
  const pathname = usePathname();
  const scrollDirection = useScrollDirection();

  // Hide navbar on lesson/book pages
  if (pathname.startsWith("/lessons/")) return null;

  const navItems = [
    { name: "መነሻ", icon: <Home size={22} />, path: "/" },
    { name: "ስለ እኛ", icon: <Info size={22} />, path: "/about" },
    {
      name: "አስተያየት",
      icon: <MessageSquarePlus size={22} />,
      path: "/feedback",
    },
    { name: "ምስጋና", icon: <Heart size={22} />, path: "/thanks" },
    { name: "መገለጫ", icon: <User size={22} />, path: "/profile" },
  ];

  const normalizePath = (path: string) => path.split("?")[0];

  const renderNavItem = (item: (typeof navItems)[0], isDesktop = false) => {
    const isActive = normalizePath(pathname) === normalizePath(item.path);

    const baseClasses = isDesktop
      ? `relative flex flex-col items-center group cursor-pointer transition-all duration-300 ${
          isActive ? "text-[#9b2d30]" : "text-[#3d1c1d]/30 hover:text-[#9b2d30]"
        }`
      : `flex-1 flex flex-col items-center justify-center transition-all duration-300 ${
          isActive ? "text-[#9b2d30]" : "text-[#3d1c1d]/40"
        }`;

    return (
      <Link key={item.name} href={item.path} className={baseClasses}>
        {isDesktop && isActive && (
          <div className="absolute -left-6 w-1.5 h-8 bg-[#9b2d30] rounded-r-full animate-in slide-in-from-left duration-500 z-1000" />
        )}
        <div
          className={`p-2 rounded-xl transition-all ${
            !isDesktop && isActive ? "bg-[#9b2d30]/10 scale-110" : ""
          }`}>
          {item.icon}
        </div>
        <span
          className={`${
            isDesktop
              ? "text-[10px] font-black mt-2 uppercase tracking-tighter"
              : "text-[10px] font-black mt-1 tracking-tight"
          }`}>
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* --- MOBILE: Tab Bar --- */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-1000 bg-[#fdfaf1]/95 backdrop-blur-xl border-t border-[#9b2d30]/30 ${
          scrollDirection === "down" ? "translate-y-full" : "translate-y-0"
        }`}>
        <div className="flex justify-around items-center h-[64px] pb-safe">
          {navItems.map((item) => renderNavItem(item))}
        </div>
      </nav>

      {/* --- DESKTOP: Sidebar --- */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-24 flex-col items-center py-10 z-[100] bg-[#fdfaf1] border-r border-[#9b2d30]/10">
        <div className="mb-12">
          <div className="w-12 h-12 bg-[#9b2d30] rounded-2xl flex items-center justify-center text-[#fdfaf1] font-black text-xl italic shadow-lg shadow-[#9b2d30]/20">
            H♱S
          </div>
        </div>

        <div className="flex flex-col gap-10">
          {navItems.map((item) => renderNavItem(item, true))}
        </div>
      </aside>
    </>
  );
}
