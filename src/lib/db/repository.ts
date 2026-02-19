//src/lib/db/repository.ts
import { getDB } from "./client";
import { Note } from "@/types/note";
import { Content } from "@/types/content";
import { Progress } from "@/types/progress";
import { User } from "@/types/user";
/**
 * NOTES REPOSITORY
 */
export const NoteRepository = {
  async saveNote(note: Note): Promise<string> {
    const db = await getDB();
    await db.put("notes", note);
    return note.id;
  },

  async getNotesByChapter(chapterId: string): Promise<Note[]> {
    const db = await getDB();
    return db.getAllFromIndex("notes", "chapterId", chapterId);
  },

  async getPendingNotes(): Promise<Note[]> {
    const db = await getDB();
    return db.getAllFromIndex("notes", "syncStatus", "pending");
  },
};

/**
 * CONTENT REPOSITORY (SRS-4.3.1)
 */
export const ContentRepository = {
  async saveChapter(content: Content): Promise<void> {
    const db = await getDB();
    await db.put("content", content);
  },

  async getChapter(id: string): Promise<Content | undefined> {
    const db = await getDB();
    return db.get("content", id);
  },
};

/**
 * PROGRESS REPOSITORY (Updated for Action Plans)
 */
export const ProgressRepository = {
  async updateProgress(progress: Progress): Promise<void> {
    const db = await getDB();
    await db.put("progress", progress);
  },

  async getProgress(
    userId: string,
    chapterId: string
  ): Promise<Progress | undefined> {
    const db = await getDB();

    return db.get("progress", [userId, chapterId]);
  },

  /**
   * PROGRESS REPOSITORY (Updated with Auto-Completion)
   */
  async toggleAction(
    userId: string,
    chapterId: string,
    actionId: string,
    totalActions: number
  ): Promise<Progress> {
    const current = await this.getProgress(userId, chapterId);

    const now = new Date().toISOString();
    const updatedProgress: Progress = current
      ? { ...current, updatedAt: now }
      : {
          userId,
          chapterId,
          lastPageRead: 0,
          completedActions: [],
          isCompleted: false,
          updatedAt: now,
        };

    // 1. የ Action ዝርዝርን ማዘመን
    const actions = updatedProgress.completedActions || [];
    if (actions.includes(actionId)) {
      updatedProgress.completedActions = actions.filter(
        (id) => id !== actionId
      );
    } else {
      updatedProgress.completedActions = [...actions, actionId];
    }

    // 2. ኦቶማቲክ የማጠናቀቂያ logic (SRS-4.2)
    // የተጨረሱት ብዛት በምዕራፉ ውስጥ ካለው ጠቅላላ ብዛት ጋር እኩል ከሆነ
    updatedProgress.isCompleted =
      updatedProgress.completedActions.length === totalActions;

    await this.updateProgress(updatedProgress);
    return updatedProgress;
  },

  async saveLastPageRead(
    userId: string,
    chapterId: string,
    page: number
  ): Promise<void> {
    const current = await this.getProgress(userId, chapterId);
    const now = new Date().toISOString();

    const updated: Progress = current
      ? { ...current, lastPageRead: page, updatedAt: now }
      : {
          userId,
          chapterId,
          lastPageRead: page,
          completedActions: [],
          isCompleted: false,
          updatedAt: now,
        };

    await this.updateProgress(updated);
  },
};
