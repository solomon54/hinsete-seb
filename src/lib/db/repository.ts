// src/lib/db/repository.ts
import { getDB } from "./client";
import type { Note } from "@/types/note";
import type { Content } from "@/types/content";
import type { Progress } from "@/types/progress";
import type { User } from "@/types/user";

/* ───────────────────────────────────────────────
   NOTE REPOSITORY
─────────────────────────────────────────────── */

export const NoteRepository = {
  /**
   * Save or update a single note
   */
  async saveNote(note: Note): Promise<string> {
    const db = await getDB();
    await db.put("notes", note);
    return note.id;
  },

  /**
   * Get all notes belonging to a specific chapter
   */
  async getNotesByChapter(chapterId: string): Promise<Note[]> {
    const db = await getDB();
    return db.getAllFromIndex("notes", "chapterId", chapterId);
  },

  /**
   * Retrieve a single note by its unique ID
   */
  async getNoteById(id: string): Promise<Note | undefined> {
    const db = await getDB();
    return db.get("notes", id);
  },

  /**
   * Get notes that are waiting to be synced to server
   */
  async getPendingNotes(): Promise<Note[]> {
    const db = await getDB();
    return db.getAllFromIndex("notes", "syncStatus", "pending");
  },

  /**
   * Get ALL notes for the current user, sorted by last update (newest first)
   */
  async getAllUserNotes(userId: string): Promise<Note[]> {
    const db = await getDB();
    const allNotes = await db.getAll("notes");

    return allNotes
      .filter((note) => note.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  },

  /**
   * Get every note in the database — mostly useful for debugging / admin
   */
  async getAllNotes(): Promise<Note[]> {
    const db = await getDB();
    const notes = await db.getAll("notes");

    return notes.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  /**
   * Permanently delete a note by ID
   */
  async deleteNote(id: string): Promise<void> {
    const db = await getDB();
    await db.delete("notes", id);
  },
};

/* ───────────────────────────────────────────────
   CONTENT REPOSITORY
─────────────────────────────────────────────── */

export const ContentRepository = {
  /**
   * Save or update a chapter/content fragment
   */
  async saveChapter(content: Content): Promise<void> {
    const db = await getDB();
    await db.put("content", content);
  },

  /**
   * Retrieve a single chapter by its ID
   */
  async getChapter(id: string): Promise<Content | undefined> {
    const db = await getDB();
    return db.get("content", id);
  },
};

/* ───────────────────────────────────────────────
   PROGRESS REPOSITORY
─────────────────────────────────────────────── */

export const ProgressRepository = {
  /**
   * Save or update progress record
   */
  async updateProgress(progress: Progress): Promise<void> {
    const db = await getDB();
    await db.put("progress", progress);
  },

  /**
   * Get progress for a specific user + chapter combination
   */
  async getProgress(
    userId: string,
    chapterId: string
  ): Promise<Progress | undefined> {
    const db = await getDB();
    return db.get("progress", [userId, chapterId]);
  },

  /**
   * Toggle completion of a single action item
   * Automatically updates chapter completion status
   */
  async toggleAction(
    userId: string,
    chapterId: string,
    actionId: string,
    totalActionsInChapter: number
  ): Promise<Progress> {
    const current = (await this.getProgress(userId, chapterId)) ?? {
      userId,
      chapterId,
      lastPageRead: 0,
      completedActions: [],
      isCompleted: false,
      updatedAt: new Date().toISOString(),
    };

    const now = new Date().toISOString();
    const updated: Progress = { ...current, updatedAt: now };

    const actions = updated.completedActions ?? [];
    if (actions.includes(actionId)) {
      updated.completedActions = actions.filter((id) => id !== actionId);
    } else {
      updated.completedActions = [...actions, actionId];
    }

    // Auto-complete chapter when all actions are done
    updated.isCompleted =
      updated.completedActions.length === totalActionsInChapter;

    await this.updateProgress(updated);
    return updated;
  },

  /**
   * Record the last page the user has read
   */
  async saveLastPageRead(
    userId: string,
    chapterId: string,
    page: number
  ): Promise<void> {
    const current = (await this.getProgress(userId, chapterId)) ?? {
      userId,
      chapterId,
      lastPageRead: 0,
      completedActions: [],
      isCompleted: false,
      updatedAt: new Date().toISOString(),
    };

    const updated: Progress = {
      ...current,
      lastPageRead: page,
      updatedAt: new Date().toISOString(),
    };

    await this.updateProgress(updated);
  },
};
