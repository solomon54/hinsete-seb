//src/lib/db/client.ts
import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "hinsete_seb_db";
const DB_VERSION = 1;

export async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 1. Users Store
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "id" });
      }

      // 2. Content (Biranna) Store
      if (!db.objectStoreNames.contains("content")) {
        db.createObjectStore("content", { keyPath: "id" });
      }

      // 3. Notes Store (Indexed by chapter for fast retrieval)
      if (!db.objectStoreNames.contains("notes")) {
        const noteStore = db.createObjectStore("notes", { keyPath: "id" });
        noteStore.createIndex("chapterId", "chapterId", { unique: false });
        noteStore.createIndex("syncStatus", "syncStatus", { unique: false });
      }

      // 4. Progress Store (Composite key for user + chapter)
      if (!db.objectStoreNames.contains("progress")) {
        db.createObjectStore("progress", { keyPath: ["userId", "chapterId"] });
      }
    },
  });
}
