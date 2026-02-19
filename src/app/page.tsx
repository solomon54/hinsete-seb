//src/app/page.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/user";

export default function Home() {
  const { user, loading, login } = useAuth();

  // Mock registration to establish JoinDate in IndexedDB
  const handleStart = async () => {
    const mockUser: User = {
      id: "user_01",
      email: "seeker@hinseteseb.org",
      joinDate: new Date().toISOString(), // This starts the 7-day clock
      role: "STUDENT",
      lastSyncTimestamp: new Date().toISOString(),
      version: 1,
    };

    await login(mockUser);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#f4ece1] flex items-center justify-center font-serif italic text-[#9b2d30]">
        Preparing the Archive...
      </div>
    );

  return (
    <main className="min-h-screen bg-[#f4ece1] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-serif text-[#9b2d30] mb-2 animate-fade-in">
        ሕንጸተ ሰብእ
      </h1>
      <p className="text-gray-600 italic mb-12 tracking-widest uppercase text-sm">
        Hinsete Seb — The Formation of Man
      </p>

      {!user ? (
        <div className="space-y-8 animate-fade-in">
          <p className="text-stone-500 font-serif italic">
            Welcome, seeker. Please begin your journey.
          </p>
          <button
            onClick={handleStart}
            className="wax-seal-button w-24 h-24 text-white text-xs font-bold flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
            START
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in max-w-md w-full">
          <div className="p-8 bg-white/30 border border-[#9b2d30]/10 rounded-sm backdrop-blur-sm shadow-inner">
            <h2 className="text-xl font-serif text-[#9b2d30] mb-4">
              Your Path is Set
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              You entered the formation on: <br />
              <span className="font-serif italic text-stone-800">
                {new Date(user.joinDate).toLocaleDateString(undefined, {
                  dateStyle: "full",
                })}
              </span>
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href="/dashboard/lesson/1"
              className="px-8 py-4 bg-[#9b2d30] text-white font-serif italic shadow-lg hover:bg-[#7a2325] transition-all">
              Enter Week 1 Manuscript
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
