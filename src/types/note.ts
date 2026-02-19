//src/types/note.ts
export interface Note {
  id: string;
  userId: string;
  chapterId: string;
  pageIndex: number;
  contentEncrypted: string; // AES-GCM-256 cipher text
  syncStatus: "synced" | "pending";
  updatedAt: string; // ISO 8601 for LWW resolution
}
