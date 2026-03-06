//src/app/about/page.tsx
"use client";
import About from "@/app/components/about/AboutPage";
import { useRouter } from "next/navigation";

export default function AboutPageRoute() {
  const router = useRouter();

  return <About />;
}
