import React from "react";

interface WaxSealProps {
  unlockDate: string;
}

export const WaxSeal = ({ unlockDate }: WaxSealProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-6">
      {/* The Skeuomorphic Wax Seal Circle */}
      <div className="wax-seal-button w-32 h-32 flex items-center justify-center text-white font-serif text-3xl shadow-xl">
        H.S
      </div>

      <div className="space-y-2">
        <h2 className="cinnabar-text text-2xl font-serif italic">
          This Biranna is Sealed
        </h2>
        <p className="text-gray-600 max-w-xs">
          Your formation continues. This chapter will be revealed on: <br />
          <span className="font-bold">
            {new Date(unlockDate).toLocaleDateString()}
          </span>
        </p>
      </div>
    </div>
  );
};
