//src/hooks/useAuth.ts
import { useState, useEffect } from "react";
import { getDB } from "@/lib/db/client";
import { User } from "@/types/user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const db = await getDB();
      // SRS-4.1.3: Check local storage for existing session
      const localUsers = await db.getAll("users");
      if (localUsers.length > 0) {
        setUser(localUsers[0]);
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (userData: User) => {
    const db = await getDB();
    await db.put("users", userData); // Persist for offline access
    setUser(userData);
  };

  return { user, loading, login };
}
