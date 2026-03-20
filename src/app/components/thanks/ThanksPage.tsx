//src/app/components/thanks/ThanksPage.tsx
"use client";

import React from "react";
import {
  Heart,
  ArrowLeft,
  Users,
  Sparkles,
  BookOpen,
  Quote,
  GraduationCap,
  Church,
  ScrollText,
  Clock,
  HandHeart,
  Stars,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ThanksPage() {
  // Theme Color: Deep Burnt Orange / Terracotta (#d35400 or #e67e22)
  const themeColor = "#d35400";

  return (
    <div className="min-h-screen bg-[#fefaf6] text-[#2c1a11] font-serif pb-10 selection:bg-[#d35400]/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#fefaf6]/95 backdrop-blur-md border-b border-[#d35400]/10 p-4 md:p-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-[#d35400]/5 text-[#d35400] transition-colors">
            <ArrowLeft size={26} />
          </Link>
          <h1 className="text-lg md:text-3xl font-black italic tracking-tight text-[#d35400]">
            ልዩ ምስጋና
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-3 md:p-10 space-y-24 md:space-y-32">
        {/* ፩. የክብር ማኅተም */}
        <section className="space-y-10 pt-5">
          <div className="text-center space-y-3">
            <span className="text-[#d35400] font-black text-4xl italic">
              ፩.{" "}
            </span>
            <h2 className="text-lg md:text-2xl font-black text-[#d35400] border-b-4 border-[#d35400]/10 pb-2 inline-block">
              የክብር ማኅተም
            </h2>
          </div>

          <div className="bg-white p-5 md:p-16 rounded-[2rem] md:rounded-[4rem] border border-[#d35400]/10 space-y-8 shadow-xl shadow-[#d35400]/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-12">
              <Stars size={60} color={themeColor} />
            </div>

            <div className="relative space-y-8 italic leading-relaxed text-sm md:text-base text-justify md:text-left">
              <p className="first-letter:text-3xl md:first-letter:text-5xl first-letter:font-black first-letter:text-[#d35400] first-letter:mr-1 first-letter:float-left">
                ከምስጋና ሁሉ ከፍ ያለ ምስጋና፤ ዓለምን ካለመኖር ወደመኖር ያመጣ፤ ፍጥረታትን በልዩ ጥበቡ የፈጠረ፣
                የሁሉ ነገር አስገኝ፣ ፈጣሪ፣ መጋቢ፣ ጠባቂ እና አስተዳዳሪ የሆነ... ዕለት ዕለት እሱን ለማሳዘን
                የተፈጠርሁ እስኪመስል ድረስ ያለማቋረጥ ስበድልና ሳጠፋ፣ "ነገ ይመለስ ይሆናል" እያለ በጥፋቴ
                ያላጠፋኝ፤
              </p>
              <p>
                ...አዲስ ቀንን በተስፋ የሚያሳየኝ፤ እስክመለስ በትዕግስት የሚጠብቅኝ፤ ይህንንም ሃሳብ ያሳሰበኝ፣
                ያስጀመረኝ እና በቸርነቱ ያስፈጸመኝ፣ የዓለማት ንጉሥ፣ የፍጥረታት ገዢ፣ ልዑለ ባሕርይ ቅዱስ
                እግዚአብሔር ስሙ በፍጥረታት ሁሉ አንደበት ለዘለዓለም ይክበር ይመስገን!
              </p>
              <div className="pt-3 md:pt-5 border-t-2 border-[#d35400]/15 space-y-6">
                <p>
                  የሕይወት ፍሬን ያስገኘችልን፣ የጭንቅ ቀን ከመከራ ማለፊያዬ መርከቤ፣ የችግሬ መፍትሔ፣ የሕመሜ
                  ፈዋሽ መድኃኒቴ፣ የሐዘኔ መርሻ፣ የመጽናኛዬ ወደብ፣ የደስታዬ ምንጭ፣ እመብርሃን — እመብዙኃን፣
                  እናቴ እመቤቴ፤
                </p>
                <p>
                  ...ለእርሷ የሚበቃ የምስጋና ቃል ባይኖረኝም፤ በኮልታፋ አንደበቴ፡ ልጇ በፈጠራቸው ሥነ-ፍጥረታት
                  ሁሉ አንደበት ስሟ ከፍ ከፍ ያለ፣ የከበረና የተመሰገነ ይሁንልኝ!
                </p>
              </div>
            </div>
            <div className="text-center font-black text-[#d35400] text-sm md:text-lg pt-6 border-t border-[#d35400]/10">
              "በአርያውና በአምሳሉ ለፈጠረኝ አምላክ ክብርና ምስጋና ይሁን!"
            </div>
          </div>
        </section>

        {/* ፪. የሕይወት መሠረቶች */}
        <section className="space-y-7">
          <div className="text-center space-y-3">
            <span className="text-[#d35400] font-black text-3xl underline">
              ፪.
            </span>
            <h2 className="text-lg md:text-2xl font-black block tracking-tight text-[#d35400]">
              የሕይወት መሠረቶች
            </h2>
            <p className="text-xs md:text-lg text-[#2c1a11]/60 italic max-w-2xl mx-auto">
              በሕይወቴ ሕንጻ ውስጥ ሦስት ታላላቅ ምሰሶዎችን አቆመውልኛልና ከልብ አመሰግናለሁ!
            </p>
          </div>

          <div className="grid gap-5 md:gap-12">
            {/* Family */}
            <div className="group flex flex-col md:flex-row gap-5 p-8 md:p-12 bg-white rounded-[3rem] border border-[#d35400]/10 shadow-lg hover:shadow-[#d35400]/10 transition-all">
              <div className="shrink-0 w-12 h-12 md:w-21 md:h-21 bg-[#d35400]/10 rounded-[2rem] flex items-center justify-center text-[#d35400] group-hover:scale-110 transition-transform">
                <Heart size={40} fill="currentColor" />
              </div>
              <div className="space-y-4">
                <h3 className="font-black text-lg text-[#492b1d]">
                  ቤተሰብ (ወላጆቼ)
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-[#2c1a11]/80 italic">
                  የእናቴ መከራ የሚጀምረው እኔ በማህጸኗ ካደርሁ ጊዜ ጀምሮ ነው! ቤተሰቦቼ የራሳቸውን ሕይወት ለእኔ
                  አሳልፈው ሰጥተው፣ ለእኔ እየኖሩ እኔን እዚህ አደረሱኝ። በእነሱ ስቃይ እና መከራ የእኔን ደስታ
                  ለመግዛት ወደር የሌለው መሥዋዕትነትን ለከፈሉልኝ ወላጆቼ፤ እግዚአብሔር አምላክ ረጅም ዕድሜ ከጤና
                  ጋር ያድልልኝ!
                </p>

                <p>...ብቻ የድካማቸውን ፍሬ ለማየት፣ የዘሩትንም ዘር ዕሸቱን ለመብላት ያብቃልኝ!</p>
              </div>
            </div>

            {/* Teachers - Using many icons as requested */}
            <div className="group flex flex-col md:flex-row gap-8 p-8 md:p-12 bg-white rounded-[3rem] border border-[#d35400]/10 shadow-lg hover:shadow-[#d35400]/10 transition-all">
              <div className="shrink-0 w-12 h-12 md:w-21 md:h-21 bg-[#2c1a11]/5 rounded-[2rem] flex items-center justify-center text-[#2c1a11] relative group-hover:scale-110 transition-transform">
                <Users size={40} />
                <Sparkles
                  size={16}
                  className="absolute -top-1 -right-1 text-[#d35400]"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-black text-lg text-[#2c1a11]">
                  መምህራንና ማኅበረሰብ
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-[#2c1a11]/80">
                  እጄን ይዘው ፊደል ላስቆጠሩኝ፣ መንገድም ላሳዩኝ መምህራኖቼ፤ በፍቅር ላሳደገኝ ማኅበረሰብና እኔ
                  በዚህ መንገድ እንድጓዝ ጠጠር ላዋጡ በዙሪያዬ ላሉ ሰዎች ሁሉ እግዚአብሔር ይስጥልኝ።
                </p>
              </div>
            </div>

            {/* Spiritual Leaders */}
            <div className="group flex flex-col md:flex-row gap-8 p-8 md:p-12 bg-white rounded-[3rem] border border-[#d35400]/10 shadow-lg hover:shadow-[#d35400]/10 transition-all">
              <div className="shrink-0 w-12 h-12 md:w-21 md:h-21 bg-[#d35400]/10 rounded-[2rem] flex items-center justify-center text-[#d35400] group-hover:scale-110 transition-transform">
                <Church size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="font-black text-lg text-[#2c1a11]">
                  የሃይማኖት አባቶችና ሊቃውንት
                </h3>
                <p className="text-sm md:text-base leading-relaxed text-[#2c1a11]/80">
                  ሕይወቴን መስመር ላስያዙልኝ የቤተክርስቲያን አባቶቼ፤ ለነፍስ ስንቅ፣ ለመንገዳችን መብራት የሚሆን
                  የሕይወት መጽሐፍን ጽፈው እና አቆይተው እዚህ ላደረሱልን ሊቃውንት አባቶቻችን ልባዊ ምስጋና አለኝ።
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ፫. የዘመን ባለአሻራዎች - Dark Orange/Terracotta Background */}
        <section className="text-center p-12 md:p-20 bg-[#d35400] rounded-[2rem] text-white space-y-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none flex flex-wrap gap-12 p-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <Sparkles key={i} size={32} />
            ))}
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex justify-center gap-3 items-center">
              <span className="text-3xl font-black italic">፫</span>
              <BookOpen size={32} />
            </div>
            <h2 className="text-lg md:text-3xl font-black italic tracking-widest uppercase">
              የዘመን ባለአሻራዎች
            </h2>
            <p className="text-sm md:text-base opacity-90 leading-relaxed max-w-5xl md:max-w-2xl mx-auto font-medium">
              ሳይንስን፣ ፈጠራን እና ቴክኖሎጂን በየረድፉ አሰናስለው ከዘመን ጋር አብረን እንድንሄድ ላደረጉ የጥበብ
              ሰዎችም ምስጋና ይገባቸዋል።
            </p>
          </div>
        </section>

        {/* ፬. ልዩ ምስጋና - የሕይወት ትምህርት ቤት */}
        <section className="space-y-16 relative py-4">
          <div className="text-center space-y-4">
            <span className="text-[#d35400] font-black text-3xl italic underline">
              ፬.
            </span>
            <h2 className="text-lg md:text-3xl font-black block tracking-tight">
              ልዩ ምስጋና ለሕይወት ትምህርት ቤቴ
            </h2>
          </div>

          <div className="relative max-w-lg mx-auto">
            {/* Image Frame - Terracotta border */}
            <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto rounded-full p-3 border-[12px] border-[#d35400]/20 shadow-xl overflow-hidden bg-white ring-4 ring-[#d35400]">
              <Image
                src="/assets/images/emma.jpg"
                alt="Emma"
                fill
                className="object-cover rounded-full transition-all duration-1000 md:grayscale md:hover:grayscale-0 scale-105"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center md:opacity-30 hover:opacity-80 transition-all duration-300">
                <span className="text-white text-5xl md:text-7xl font-black drop-shadow-xl tracking-[0.2em] pl-4 opacity-80 ">
                  እናት
                </span>
              </div>
            </div>

            {/* Floating Badge */}
            <div className="absolute bottom-3 -right-3 md:right-4 bg-[#d35400] text-white px-3 py-3 rounded-[2rem] shadow-xl flex items-center gap-3 border-4 border-[#fefaf6]">
              <GraduationCap size={24} />
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                  ተመራቂ
                </span>
                <span className="text-sm md:text-base font-black">
                  ፳፻፲፰ ዓ.ም
                </span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-10">
            <div className="space-y-3">
              <h3 className="text-base md:text-xl font-black italic text-[#d35400] drop-shadow-sm">
                "ምክንያቴ / መጽናኛዬ"
              </h3>
              <p className="text-lg md:text-xl text-[#2c1a11]/60 font-medium leading-relaxed max-w-2xl mx-auto italic">
                ሰውን በሚገባ ጠፍጥፎ መስራት የምትችል፣ ድካምን በብርታት የምታሸንፍ፣ ሁልጊዜ የደስታችን ምንጭ
                የሆነች እህታችን...
              </p>
            </div>

            <div className="bg-white p-8 md:p-20 rounded-[4rem] md:rounded-[6rem] border border-[#d35400]/10 shadow-xl relative text-justify">
              <Quote
                className="absolute -top-6 left-12 md:top-[-16] md:left-20 text-[#d35400] bg-[#fefaf6] p-2 rounded-full shadow-lg"
                size={48}
              />
              <div className="space-y-8 text-[#2c1a11]/90 text-sm md:text-base italic leading-relaxed">
                <p>
                  እንዴት ሰውን ከወደቀበት ማንሳት እንደሚቻል በሕይወቷ በተግባር ያረጋገጠችልን እህታችን ናት። በግቢ
                  ጉባኤያችን ውስጥ የጥቂት ሰዎች "ጊዜያዊ እናት" ሆና ብትሰጠንም፤ ለእኔ ግን እውነተኛዋ የሕይወት
                  ትምህርት ቤቴ ነበረች። ለዚህም ነው አብዛኞቻችን ከሙሉ ስሟ ይልቅ “እማ” ወይም &nbsp;
                  “እናት” በማለት የምንጠራት።
                </p>
                <p>
                  የዓመታት ልፋቷን የመጀመሪያውን ምዕራፍ ጉዞ በዚህ ዓመት በዚህ ወር ትቋጫለች (ተመራቂ ናት)።
                  እግዚአብሔር አምላክ ዘመኗን ሁሉ ይባርክልን።
                </p>

                <div className="py-10 space-y-6">
                  <p className="font-black text-[#d35400] text-center text-base md:text-xl not-italic tracking-tighter uppercase underline decoration-double decoration-[#d35400]/20 underline-offset-8">
                    ራሴን ለማየት ድንቅ መስታወት የሆንሽኝ እህቴ...
                  </p>

                  {/* Her Special Quote Section */}
                  <div className="bg-[#d35400]/5 p-3 md:p-8 rounded-2xl md:rounded-[3rem] border-l-3 md:border-l-8 border-[#d35400] space-y-4">
                    <div className="flex items-center gap-2 text-[#d35400]">
                      <HandHeart size={24} />
                      <span className="text-sm font-black uppercase tracking-widest">
                        እሷ ዘወትር እንዲህ ትለኛለች:
                      </span>
                    </div>
                    <p className="text-xs md:text-xl font-black text-[#2c1a11] not-italic tracking-tighter leading-tight">
                      "ጊዜህ አሁን ነው፤ ዛሬ ላይ ሆነህ ነገህን ስራ!"
                    </p>
                  </div>
                </div>

                <p>
                  በድክመቴ ሳትስቂ ጉድለቴን ለመሙላት ፊት ለፊት የምታስተምሪኝ፤ የሃሳቤ ማራጋፊያ ወደብ፣ የድክመቴ
                  ማጣሪያ፣ የመሠረቴ ማጠናከሪያ የሆንሽኝ እህቴ ሆይ፤ የዘመኑ ነፋስ እንዳይጥለኝ ምርኩዜ ነሽ።
                </p>
                <p>
                  <span className="text-[#d35400] font-black">እማ</span>... ዘወትር
                  በልብሽ የምትመኝው የከበረ ሕይወት ከምኞት ወደ እውነት እንዲቀየርልሽ ብቻ ነው ምኞቴ! ሌላ ምንም
                  ልልሽ አልችልም። ይህ መተግበሪያ ለእርሷ አርዓያነትና ፍቅር መታሰቢያ ይሁን።
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ፭. የወንድማዊ ጥሪ */}
        <section className="pt-12">
          <div className="bg-[#d35400]/5 p-5 md:p-12  rounded-[3rem] md:rounded-[8rem] text-center space-y-12 border-2 border-white shadow-inner">
            <div className="space-y-6">
              <div className="flex justify-center gap-2 text-[#d35400]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Heart
                    key={i}
                    size={24}
                    fill="currentColor"
                    className="animate-pulse"
                  />
                ))}
              </div>
              <h2 className="text-xl md:text-2xl font-black italic tracking-tighter">
                ወንድማዊ ጥሪ
              </h2>
              <p className="text-sm md:text-base text-[#2c1a11]/80 max-w-3xl mx-auto leading-relaxed italic">
                ውድ ወንድሜና እህቴ ሆይ፤ ከጀርባህ የብዙዎች ውለታና ጸሎት እንዳለ አትዘንጋ። ይህ መተግበሪያ
                አንተንም ለሌሎች መጽናኛና ተስፋ እንድትሆን ያነሳሳህ ዘንድ ምኞቴ ነው።
              </p>
            </div>

            <div className="bg-white p-5 md:p-16 rounded-4xl space-y-8 max-w-3xl mx-auto border border-[#d35400]/10 shadow-xl">
              {[
                "እኔስ ለምን ተፈጠርኩ?",
                "የማን መጽናኛ ነኝ?",
                "ለማንስ መኖር ምክንያት እየሆንኩ ነው?",
              ].map((q, i) => (
                <div
                  key={i}
                  className="flex items-center gap-6 justify-start text-[#d35400] hover:translate-x-2 transition-transform cursor-default">
                  <ScrollText size={32} className="shrink-0 opacity-40" />
                  <span className="font-black text-sm md:text-lg italic text-left tracking-tight">
                    {q}
                  </span>
                </div>
              ))}
              <span className="ml-96 text-[#d35400]"> ብለህ እራስህን ጠይቅ!</span>
            </div>

            <div className="space-y-12 pt-10">
              <Link
                href="/"
                className="group relative inline-flex items-center justify-center px-7 py-3 md:px-12 md:py-5 bg-[#2c1a11] text-white rounded-3xl font-black text-base md:text-xl active:scale-95 transition-all shadow-xl hover:bg-[#d35400] overflow-hidden">
                <span className="relative z-10">ወደ መነሻ ገጽ ተመለስ</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>

              <div className="flex flex-col items-center gap-4">
                <Clock size={40} className="text-[#d35400] opacity-30" />
                <p className="text-lg md:text-2xl font-black italic text-[#d35400] tracking-tighter drop-shadow-sm">
                  "ጥበብ ለሚወዷት ትገለጣለች!"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Meta */}
        <footer className="text-center opacity-40 pb-10">
          <p className=" text-xs md:text-sm font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] text-[#d35400] opacity-65">
            Hinsete Seb • Gratitude Portal • 2018 E.C Edition
          </p>
        </footer>
      </main>
    </div>
  );
}
