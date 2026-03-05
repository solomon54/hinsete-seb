//src/app/feedback/page.tsx
"use client";
import Feedback from "@/app/components/feedback/FeedBackPage";
import { useRouter } from "next/navigation";

export default function FeedbackPageRoute() {
  const router = useRouter();

  return <Feedback onClose={() => router.back()} />;
}
