//src/components/dashboard/TabSwitcher.tsx
"use client";

import React from "react";
import { BookOpen, Lightbulb, ListChecks } from "lucide-react";

interface TabSwitcherProps {
  activeTab: "chapters" | "concepts" | "activities";
  onTabChange: (tab: "chapters" | "concepts" | "activities") => void;
}

export default function TabSwitcher({
  activeTab,
  onTabChange,
}: TabSwitcherProps) {
  const tabs = [
    { id: "chapters", label: "ምዕራፎች", icon: BookOpen },
    { id: "concepts", label: "ሐሳቦች", icon: Lightbulb },
    { id: "activities", label: "ተግባራት", icon: ListChecks },
  ] as const;

  return (
    <div className="sticky top-0 z-30 bg-[#f4ece1]/90 backdrop-blur-md border-b border-[#9b2d30]/5">
      <div className="flex px-4 py-3 gap-2 max-w-5xl mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-[#9b2d30] text-white shadow-md"
                  : "bg-white/40 text-[#3d1c1d]/50"
              }`}>
              <Icon
                size={18}
                className={isActive ? "text-white" : "text-[#9b2d30]/40"}
              />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
