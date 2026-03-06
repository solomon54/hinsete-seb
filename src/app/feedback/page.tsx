// src/app/feedback/page.tsx
"use client";

import Feedback from "@/app/components/feedback/FeedBackPage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function FeedbackPageRoute() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (!user) return null;

  return <Feedback onClose={() => router.back()} />;
}
