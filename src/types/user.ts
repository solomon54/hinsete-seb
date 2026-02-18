export interface User {
  id: string;
  email: string;
  joinDate: string; // ISO 8601 string
  role: "STUDENT" | "ADMIN";
  lastSyncTimestamp: string;
  version: number;
}
