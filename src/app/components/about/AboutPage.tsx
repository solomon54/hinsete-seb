// src/app/components/about/AboutPage.tsx
"use client";

import React from "react";
import {
  Code2,
  Target,
  ShieldAlert,
  Smartphone,
  ArrowLeft,
  Mail,
  GraduationCap,
  Heart,
  Compass,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fdfaf1] text-[#3d1c1d] font-serif pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#fdfaf1]/90 backdrop-blur-md border-b border-[#9b2d30]/10 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-[#9b2d30]/5 text-[#9b2d30] transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-black italic">ስለ መተግበሪያው</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-12">
        {/* 1. The Vision & Purpose */}
        <section className="space-y-4 pt-4 text-center">
          <div className="w-16 h-16 bg-[#9b2d30]/10 rounded-3xl flex items-center justify-center mx-auto text-[#9b2d30]">
            <Compass size={32} />
          </div>
          <h2 className="text-2xl font-black italic">ራእይና ዓላማ</h2>
          <p className="leading-relaxed text-[#3d1c1d]/80 text-sm md:text-base italic">
            "ሳይንስና ኅይማኖት በሥርዓት ከተያዙ እንደማይጋጩ፣ ይልቁንም አንዱ ለሌላው ጥንካሬ እንደሚሆን ለማሳየት
            የታለመ ነው።" ይህ መተግበሪያ በዩኒቨርሲቲ ግቢ ውስጥ የሚገኙ ተማሪዎች በዲጂታል ጫጫታ ሳይወሰዱ፣ ሥርዓታዊ
            በሆነ መንገድ በመንፈሳዊና ስነ-ምግባራዊ ግንባታ (Humanity Building) እንዲበለጽጉ እና ለራሳቸውና
            ለፈጣሪያቸው በቂ ጊዜ እንዲኖራቸው ለማስገንዘብ የታሰበ "Offline-First" መተግበሪያ ነው።
          </p>
        </section>

        {/* 2. Directions & Features Grid */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9b2d30] text-center">
            አጠቃቀምና መመሪያ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-white rounded-3xl border border-[#9b2d30]/10 shadow-sm space-y-3">
              <Zap className="text-[#9b2d30]" size={22} />
              <h4 className="font-bold text-sm">ሳምንታዊ ጉዞ (Drip-Feed)</h4>
              <p className="text-xs text-[#3d1c1d]/60 leading-relaxed">
                ምዕራፎች በየ፯ ቀኑ የሚከፈቱ ሲሆን፤ ይህም ሃሳቡን በሚገባ ለማሰላሰልና በተግባር ለመለማመድ በቂ ጊዜ
                እንዲኖርዎት በማሰብ ነው።
              </p>
            </div>
            <div className="p-6 bg-white rounded-3xl border border-[#9b2d30]/10 shadow-sm space-y-3">
              <Smartphone className="text-[#9b2d30]" size={22} />
              <h4 className="font-bold text-sm">ያለ ኢንተርኔት (Offline-First)</h4>
              <p className="text-xs text-[#3d1c1d]/60 leading-relaxed">
                መተግበሪያው አንድ ጊዜ ከተጫነ በኋላ ያለ ኢንተርኔት(offline) እንዲሠራ ተደርጎ የተገነባ ነው።
              </p>
            </div>
          </div>
        </section>

        {/* 3. Developer Bio */}
        <section className="bg-white rounded-4xl p-6 border border-[#9b2d30]/10 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-7">
            <GraduationCap size={80} />
          </div>
          <div className="flex items-center gap-3 text-[#9b2d30]">
            <Code2 size={24} />
            <h2 className="text-base font-black uppercase tracking-wider">
              አልሚ (Developer)
            </h2>
          </div>
          <div className="space-y-4 text-[#3d1c1d]/80">
            <p className="text-sm leading-relaxed">
              እኔ በ<span className="font-bold">ዋቸሞ ዩኒቨርሲቲ(WCU)</span> የ፬ኛ ዓመት
              የሶፍትዌር ኢንጂነሪንግ ተማሪ እና የግቢ ጉባኤ አባል ስሆን፤ ይህን መተግበሪያ ያበለጸግሁት ቴክኖሎጂን
              ለቤተክርስቲያን አገልግሎት እና ለወንድሞቼ የስብአዊነት ግንባታ እንዲውል ካለኝ ጽኑ ፍላጎት ተነሥቼ ነው።
            </p>
            <div className="flex flex-wrap gap-6 pt-2">
              <a
                href="mailto:solomontsehay50@gmail.com"
                className="flex items-center gap-2 text-xs font-bold text-[#9b2d30] hover:underline transition-all">
                <Mail size={16} /> solomontsehay50@gmail.com
              </a>
            </div>
          </div>
        </section>

        {/* 4. Disclaimer - Caution */}
        <section className="p-6 bg-red-50/50 rounded-3xl border border-red-100 space-y-3">
          <div className="flex items-center gap-2 text-red-700">
            <ShieldAlert size={20} />
            <h2 className="text-sm font-black uppercase tracking-wider">
              ማሳሰቢያ (Disclaimer)
            </h2>
          </div>
          <p className="text-xs text-red-900/70 leading-relaxed italic">
            • በዚህ መተግበሪያ ውስጥ የሚገኙ ይዘቶች የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን አስተምህሮን የተከተሉ
            ናቸው። <br />• የግል ማስታወሻዎችዎ በስልክዎ ላይ ብቻ የሚቀመጡ በመሆኑ፤ መተግበሪያውን ሲያጠፉ
            (Uninstall) አብረው ሊጠፉ ስለሚችሉ ጥንቃቄ ያድርጉ።
          </p>
        </section>

        {/* 5. Humble Prayer Request */}
        <footer className="pt-8 text-center space-y-6">
          <div className="max-w-xs mx-auto p-5 bg-[#9b2d30]/3 rounded-2xl border border-[#9b2d30]/10 relative">
            <Heart
              size={18}
              className="mx-auto text-[#9b2d30] mb-3 animate-pulse"
            />
            <p className="text-[9px] leading-relaxed text-[#3d1c1d]/70 italic">
              "ከሁሉም በታች ታናሽ የሆንሁ ወንድማችሁን{" "}
              <span className="font-bold text-[#9b2d30]">(ወልደ-ሰንበት)</span> እያላችሁ
              ለጸሎት በቆማችሁ ጊዜ ሁሉ እንዳልጠፋ አስቡኝ! 🙏🏿"
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#3d1c1d]/30">
              Hinsete Seb Framework • v1.0.0
            </p>
            <p className="text-[12px] text-[#3d1c1d]/12 uppercase font-semibold tracking-tighter">
              Built for the Glory of God • 2018 E.C
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
