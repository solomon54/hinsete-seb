// src/types/user.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  // Supabase specific metadata field
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    [key: string]: any;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
  hasAccessToWeek3?: boolean;
  joinDate: string;
  role: "STUDENT" | "ADMIN";
  lastSyncTimestamp: string;
  version: number;
}
