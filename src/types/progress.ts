// src/types/progress.ts
export interface Progress {
  userId: string;
  chapterId: string;
  lastPageRead: number;
  completedActions: string[];
  isCompleted: boolean;
  updatedAt: string;
}
