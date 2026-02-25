// src/app/components/dashboard/WaxSeal.tsx
import React from "react";
import {
  convertToEthiopian,
  ETHIOPIAN_MONTHS,
  ETHIOPIAN_WEEKDAYS,
} from "@/lib/utils/ethiopianCalendar";

interface WaxSealProps {
  unlockDate: string;
}

export const WaxSeal = ({ unlockDate }: WaxSealProps) => {
  // Always treat ISO as UTC
  const dateObj = new Date(unlockDate);

  const { year, month, day } = convertToEthiopian(dateObj);

  const weekday = ETHIOPIAN_WEEKDAYS[dateObj.getUTCDay()];
  const monthName = ETHIOPIAN_MONTHS[month - 1];

  const formattedDate = `${day} ${monthName} ${year}`;

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-[#fdfaf1]">
      <div className="relative w-32 h-32 group">
        <div className="absolute inset-0 rounded-full bg-[#9b2d30] shadow-[0_12px_30px_rgba(155,45,48,0.4),inset_0_2px_8px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="text-[#fdfaf1] font-serif text-5xl font-black tracking-tighter drop-shadow-2xl">
            HS
          </span>
        </div>
        <div className="absolute inset-2.5 rounded-full border-[1.5px] border-[#f4ece1]/30" />
      </div>

      <div className="mt-8 space-y-5 max-w-[300px]">
        <div className="space-y-1">
          <h2 className="text-[#3d1c1d] text-2xl font-serif font-black tracking-tight uppercase">
            ይህ ምዕራፍ ተቆልፏል🔒
          </h2>
          <div className="w-10 h-0.5 bg-[#9b2d30] mx-auto rounded-full opacity-40" />
        </div>

        <p className="text-[#3d1c1d]/80 text-[15px] italic font-serif leading-relaxed px-2">
          "ትዕግሥት የሰላም ወደብ ናት፤ በትዕግሥት ውስጥ የሚኖር ሰው ማዕበል አይናውጠውም።"
        </p>

        <div className="space-y-3 pt-2">
          <div className="inline-block px-6 py-2 rounded-xl bg-[#9b2d30]/5 border border-[#9b2d30]/15">
            <p className="text-[#9b2d30] font-black text-lg">
              {weekday}, {formattedDate}{" "}
              <span className="text-[10px]">ዓ.ም</span>
            </p>
          </div>

          <p className="text-[#3d1c1d]/70 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1">
            ይከፈታል ⏱
          </p>
        </div>
      </div>
    </div>
  );
};
