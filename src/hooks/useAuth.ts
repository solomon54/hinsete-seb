// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { createClient } from "@/lib/db/browser-client";
import { getDB } from "@/lib/db/client";

// Move client creation outside to ensure a single instance/lock
const supabase = createClient();

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function syncUser(session: any) {
      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        // Fetch profile with double quotes for camelCase
        const { data: profile } = await supabase
          .from("profiles")
          .select('role, "joinDate", name, "avatarUrl"')
          .eq("id", session.user.id)
          .single();

        const fullUser = {
          ...session.user,
          ...profile,
          display_name: profile?.name || session.user.email?.split("@")[0],
          avatarUrl: profile?.avatarUrl, // Match your schema
        };

        if (mounted) {
          setUser(fullUser);
          setLoading(false);
        }

        // Persist to local DB
        const db = await getDB();
        await db.put("users", { ...fullUser, id: session.user.id });
      } catch (err) {
        console.error("Sync error:", err);
        if (mounted) setLoading(false);
      }
    }

    // 1. Get initial session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) syncUser(session);
      else if (mounted && !session) setLoading(false);
    });

    // 2. Listen for changes (this handles logins/logouts)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) syncUser(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
