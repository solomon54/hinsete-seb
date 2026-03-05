// src/app/components/navigation/MainNavigation.tsx
"use client";

import { useState } from "react";
import { Home, Info, MessageSquarePlus, User, Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Feedback from "../feedback/FeedBackPage";
import About from "../about/AboutPage";

export default function Navbar() {
  const pathname = usePathname();
  const [activeModal, setActiveModal] = useState<"feedback" | "about" | null>(
    null
  );

  const navItems = [
    { name: "መነሻ", icon: <Home size={22} />, path: "/" },
    {
      name: "ስለ እኛ",
      icon: <Info size={22} />,
      action: () => setActiveModal("about"),
    },
    {
      name: "አስተያየት",
      icon: <MessageSquarePlus size={22} />,
      action: () => setActiveModal("feedback"),
      isCenter: true,
    },
    { name: "ምስጋና", icon: <Heart size={22} />, path: "/thanks" },
    { name: "መገለጫ", icon: <User size={22} />, path: "/profile" },
  ];

  return (
    <>
      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-[90] bg-[#fdfaf1]/90 backdrop-blur-xl border-t border-[#b99b6b]/20 px-4 pb-8 pt-3 md:hidden">
        <div className="flex justify-around items-end max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;

            if (item.isCenter) {
              return (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="flex flex-col items-center justify-center -translate-y-5 w-14 h-14 bg-[#9b5c12] rounded-2xl shadow-lg shadow-[#9b5c12]/30 text-white active:scale-95 transition-transform">
                  {item.icon}
                </button>
              );
            }

            return item.path ? (
              <Link
                key={item.name}
                href={item.path}
                className={`flex flex-col items-center gap-1 ${
                  isActive ? "text-[#9b5c12]" : "text-[#9b5c12]/40"
                }`}>
                {item.icon}
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            ) : (
              <button
                key={item.name}
                onClick={item.action}
                className="flex flex-col items-center gap-1 text-[#9b5c12]/40">
                {item.icon}
                <span className="text-[10px] font-bold">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* DESKTOP TOP NAV (Optional but good for Mid/Large) */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-[90] bg-[#fdfaf1]/80 backdrop-blur-md border-b border-[#b99b6b]/10 px-8 py-4 justify-between items-center">
        <div className="text-[#9b5c12] font-black italic font-serif">
          Hinsete Seb
        </div>
        <div className="flex gap-8">{/* Desktop Links here */}</div>
      </nav>

      {/* FULL SCREEN MODALS (No "X" - controlled by internal "Done" buttons) */}
      {activeModal === "feedback" && (
        <Feedback onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "about" && (
        <About onClose={() => setActiveModal(null)} />
      )}
    </>
  );
}
