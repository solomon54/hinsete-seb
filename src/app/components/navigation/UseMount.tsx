// src/app/components/navigation/UseMount.tsx
"use client";

import { useEffect, useState } from "react";

export default function UseMount({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}
