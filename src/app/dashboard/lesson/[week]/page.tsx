//src/app/dashboard/lesson/[week]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useReader } from "@/hooks/useReader";
import { WaxSeal } from "@/app/components/dashboard/WaxSeal";
import { Book } from "@/app/components/reader/Book";

// Temporary mock data for the week's content
const MOCK_PAGES = [
  {
    content:
      "In the beginning of the formation, the mind is like an unwritten parchment...",
  },
  {
    content:
      "Silence is the ink of the soul. Deepen your breath as you read these words.",
  },
  { content: "The third pillar of Hinsete Seb is consistency over intensity." },
];

export default function LessonPage() {
  const params = useParams();
  const weekNumber = parseInt(params.week as string);
  const { status, unlockDate } = useReader(weekNumber);

  if (status === "loading")
    return <div className="p-10 text-center">Opening Manuscript...</div>;

  if (status === "locked" && unlockDate) {
    return <WaxSeal unlockDate={unlockDate.toISOString()} />;
  }

  return (
    <div className="biranna-container flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-4xl p-12">
        <Book pages={MOCK_PAGES} />
      </div>
    </div>
  );
}
