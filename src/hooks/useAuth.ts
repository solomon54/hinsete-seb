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
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select('role, "joinDate", name, "avatarUrl"')
          .eq("id", sessionUser.id)
          .single();

        let fullUser = {
          ...sessionUser,
          display_name: sessionUser.email?.split("@")[0] || "User",
          avatarUrl: null,
          role: "STUDENT", // fallback
          joinDate: null,
        };

        if (profileError) {
          console.warn(
            "Profile fetch failed (likely new user or RLS):",
            profileError.message
          );
          // Continue with basic user data — don't crash
        } else if (profile) {
          fullUser = {
            ...fullUser,
            ...profile,
            display_name: profile.name || fullUser.display_name,
            avatarUrl: profile.avatarUrl,
            role: profile.role || fullUser.role,
            joinDate: profile.joinDate,
          };
        }

        if (mounted) {
          setUser(fullUser);
          setLoading(false);
        }

        const db = await getDB();
        await db.put("users", { ...fullUser, id: sessionUser.id });
      } catch (err: any) {
        console.error("Critical sync error:", err);
        // Fallback: set basic user so login doesn't break
        if (mounted) {
          setUser({
            ...sessionUser,
            display_name: sessionUser.email?.split("@")[0] || "User",
            role: "STUDENT",
          });
          setLoading(false);
        }
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
