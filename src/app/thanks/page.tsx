//src/app/thanks/page.tsx
"use client";
import Thanks from "@/app/components/thanks/ThanksPage";
import { useRouter } from "next/navigation";

export default function ThanksPageRoute() {
  const router = useRouter();

  return <Thanks />;
}
