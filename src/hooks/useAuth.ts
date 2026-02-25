// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { createClient } from "@/lib/db/browser-client"; // Use the SSR-compatible browser client
import { getDB } from "@/lib/db/client";

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient(); // Initialize the browser-based SSR client

  useEffect(() => {
    async function getInitialSession() {
      try {
        // 1. Get current session (will check cookies automatically)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          const db = await getDB();
          await db.put("users", { ...session.user, id: session.user.id });
        }
      } catch (err) {
        console.error("Auth sync error:", err);
      } finally {
        setLoading(false);
      }

      // 2. Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const db = await getDB();
          await db.put("users", { ...session.user, id: session.user.id });
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          const db = await getDB();
          await db.clear("users");
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }

    getInitialSession();
  }, []);

  return { user, loading };
}
