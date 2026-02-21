// src/hooks/useNotes.ts
import { useEffect, useState, useRef, useCallback } from "react";
import { NoteRepository } from "@/lib/db/repository";
import { Note } from "@/types/note";
import { encryptData, decryptData, deriveKey } from "@/lib/utils/encryption";

interface UseNotesProps {
  userId: string;
  chapterId: string;
  pageIndex: number;
  password: string;
  noteId?: string | null; // ← allows switching to specific historical note
  maxHistory?: number;
}

interface UseNotesReturn {
  content: string;
  saveNote: (html: string) => void;
  isSaving: boolean;
  isLoading: boolean;
  undo: () => void;
  redo: () => void;
  currentNoteId: string | null;
}

/**
 * useNotes – Encrypted, local-first note persistence hook
 *
 * Features / Roadmap alignment:
 * • AES-GCM-256 encryption of all note content (Step 2 & 5)
 * • Real-time optimistic updates + debounced persistence (Step 5)
 * • In-memory undo/redo stack (zero-latency UX)
 * • One-time migration of legacy plaintext → encrypted notes
 * • Switchable note loading via noteId (supports history / dashboard jump)
 * • Fallback to chapterId + pageIndex when no specific noteId is provided
 */
export function useNotes({
  userId,
  chapterId,
  pageIndex,
  password,
  noteId,
  maxHistory = 20,
}: UseNotesProps): UseNotesReturn {
  const [content, setContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Undo/redo stacks (plaintext only – never persisted)
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const currentNoteId = useRef<string | null>(null);
  const keyRef = useRef<CryptoKey | null>(null);
  const hasMigrated = useRef(false);

  // Derive encryption key once per credentials change
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        keyRef.current = await deriveKey(password, userId);

        // One-time migration of legacy (unencrypted) notes
        if (!hasMigrated.current) {
          await migrateLegacyNotes();
          hasMigrated.current = true;
        }

        if (mounted) await loadCurrentNote();
      } catch (err) {
        console.error("Key derivation / migration failed:", err);
        if (mounted) setIsLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [password, userId]);

  // One-time migration: encrypt legacy plaintext notes
  const migrateLegacyNotes = async () => {
    if (!keyRef.current) return;

    try {
      const allNotes = await NoteRepository.getAllUserNotes(userId);

      for (const note of allNotes) {
        // Already encrypted? → skip
        if (note.contentEncrypted && looksLikeBase64(note.contentEncrypted)) {
          continue;
        }

        if (note.contentEncrypted?.trim()) {
          console.log(`Migrating legacy note ${note.id}`);
          const encrypted = await encryptData(
            note.contentEncrypted,
            keyRef.current
          );

          await NoteRepository.saveNote({
            ...note,
            contentEncrypted: encrypted,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.warn("Migration failed – continuing without migration", err);
    }
  };

  const looksLikeBase64 = (str: string) =>
    /^[A-Za-z0-9+/=]+$/.test(str) && str.length % 4 === 0;

  // Core load logic – supports both coordinate-based and ID-based loading
  const loadCurrentNote = useCallback(async () => {
    if (!keyRef.current) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      let targetNote: Note | undefined;

      // 1. If specific noteId is provided → load exactly that note
      if (noteId) {
        targetNote = await NoteRepository.getNoteById(noteId);
      }
      // 2. Otherwise fallback to current chapter + page coordinates
      else {
        const pageNotes = await NoteRepository.getNotesByChapter(chapterId);
        targetNote = pageNotes.find(
          (n) => n.userId === userId && n.pageIndex === pageIndex
        );
      }

      if (targetNote) {
        currentNoteId.current = targetNote.id;
        const decrypted = await decryptData(
          targetNote.contentEncrypted,
          keyRef.current
        );
        setContent(decrypted);
        setHistoryStack([decrypted]);
        setRedoStack([]);
      } else {
        currentNoteId.current = null;
        setContent("");
        setHistoryStack([]);
        setRedoStack([]);
      }
    } catch (err) {
      console.error("Note load / decrypt failed:", err);
      setContent("");
    } finally {
      setIsLoading(false);
    }
  }, [userId, chapterId, pageIndex, noteId]);

  // Reload when chapter/page or specific noteId changes
  useEffect(() => {
    loadCurrentNote();
  }, [loadCurrentNote]);

  // Debounced encrypted save
  const saveNote = useCallback(
    (html: string) => {
      setContent(html); // optimistic UI update

      if (saveTimeout.current) clearTimeout(saveTimeout.current);

      saveTimeout.current = setTimeout(async () => {
        if (!keyRef.current || !html.trim() || html === "<p></p>") return;

        setIsSaving(true);

        try {
          const encrypted = await encryptData(html, keyRef.current);

          const note: Note = {
            id: currentNoteId.current ?? crypto.randomUUID(),
            userId,
            chapterId,
            pageIndex,
            contentEncrypted: encrypted,
            syncStatus: "pending",
            updatedAt: new Date().toISOString(),
          };

          await NoteRepository.saveNote(note);
          currentNoteId.current = note.id;

          // Update undo stack
          setHistoryStack((prev) => [...prev.slice(-maxHistory + 1), html]);
          setRedoStack([]);
        } catch (err) {
          console.error("Encrypted save failed:", err);
        } finally {
          setIsSaving(false);
        }
      }, 800);
    },
    [userId, chapterId, pageIndex, maxHistory]
  );

  const undo = () => {
    if (historyStack.length <= 1) return;
    const previous = historyStack[historyStack.length - 2];
    setRedoStack((r) => [content, ...r]);
    setHistoryStack((h) => h.slice(0, -1));
    setContent(previous);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setContent(next);
    setRedoStack((r) => r.slice(1));
    setHistoryStack((h) => [...h, content]);
  };

  return {
    content,
    saveNote,
    isSaving,
    isLoading,
    undo,
    redo,
    currentNoteId: currentNoteId.current,
  };
}
