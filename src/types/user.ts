// src/types/user.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  hasAccessToWeek3?: boolean;
  joinDate: string;
  role: "STUDENT" | "ADMIN";
  lastSyncTimestamp: string;
  version: number;
}
