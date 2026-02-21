// src/types/note.ts
export interface Note {
  id: string;
  userId: string;
  chapterId: string;
  pageIndex: number;
  contentEncrypted: string;
  title?: string;
  history?: string[];
  syncStatus: "synced" | "pending";
  createdAt?: string;
  updatedAt: string;
}
