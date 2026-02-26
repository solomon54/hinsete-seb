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
    let lastProcessedUserId: string | null = null;

    async function syncUser(session: any) {
      const sessionUser = session?.user;

      // If no user, or it's the same user we just processed, stop.
      if (!sessionUser) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      if (sessionUser.id === lastProcessedUserId) return;
      lastProcessedUserId = sessionUser.id;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select('role, "joinDate", name, "avatarUrl"')
          .eq("id", sessionUser.id)
          .single();

        if (error) throw error;

        const fullUser = {
          ...sessionUser,
          ...profile,
          display_name: profile?.name || sessionUser.email?.split("@")[0],
          avatarUrl: profile?.avatarUrl,
        };

        if (mounted) {
          setUser(fullUser);
          setLoading(false);
        }

        const db = await getDB();
        await db.put("users", { ...fullUser, id: sessionUser.id });
      } catch (err) {
        console.error("Sync error:", err);
        if (mounted) setLoading(false);
      }
    }

    // REMOVE getSession() here.
    // onAuthStateChange with 'INITIAL_SESSION' event handles the first load automatically.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) syncUser(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
