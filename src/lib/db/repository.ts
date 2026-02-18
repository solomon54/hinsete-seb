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
 * PROGRESS REPOSITORY
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
};
