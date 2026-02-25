// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { createClient } from "@/lib/db/browser-client";
import { getDB } from "@/lib/db/client";

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getInitialSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // ── NEW: Fetch profile data (role, joinDate) ──
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, joinDate")
            .eq("id", session.user.id)
            .single();

          // Merge auth user with profile data
          const fullUser = { ...session.user, ...profile };

          setUser(fullUser);
          const db = await getDB();
          await db.put("users", { ...fullUser, id: session.user.id });
        }
      } catch (err) {
        console.error("Auth sync error:", err);
      } finally {
        setLoading(false);
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          // ── NEW: Fetch profile data on state change ──
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role, joinDate")
            .eq("id", session.user.id)
            .single();

          const fullUser = { ...session.user, ...profile };

          setUser(fullUser);
          const db = await getDB();
          await db.put("users", { ...fullUser, id: session.user.id });
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
