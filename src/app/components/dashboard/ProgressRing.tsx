// src/app/components/dashboard/ProgressRing.tsx
import React from "react";

interface ProgressRingProps {
  percentage: number;
  size?: number; // optional, default 48px
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
}

const ProgressRing = ({
  percentage,
  size = 48,
  strokeWidth = 4,
  color = "#9b2d30",
  bgColor = "rgba(155,45,48,0.1)",
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <span
        className="absolute font-bold text-[10px] md:text-xs"
        style={{ color }}>
        {Math.round(percentage)}%
      </span>
    </div>
  );
};

export default ProgressRing;
