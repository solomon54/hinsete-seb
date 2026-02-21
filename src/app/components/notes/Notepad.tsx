// src/app/components/notes/Notepad.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useMemo } from "react";
import { BookOpenText, Loader2 } from "lucide-react";

import Toolbar from "./Toolbar";
import HistoryDrawer from "./HistoryDrawer";
import { useNotes } from "@/hooks/useNotes";
import { NoteRepository } from "@/lib/db/repository";

// ─────────────────────────────────────────────
// Types & Props
// ─────────────────────────────────────────────
interface NotepadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (html: string, title?: string) => void;
  initialContent?: string;
  userId?: string;
  chapterId?: string;
  pageIndex?: number;
  password?: string;
  onGoToPage?: (pageIndex: number) => void;
}

interface HistoryNoteItem {
  id: string;
  title: string;
  date: string;
  pageIndex?: number;
  chapterId?: string;
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function Notepad({
  isOpen,
  onClose,
  onSave = () => {},
  initialContent = "",
  userId,
  chapterId,
  pageIndex,
  password,
  onGoToPage,
}: NotepadProps) {
  // ── Active Note State ───────────────────────────────
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  // ── History Drawer State ────────────────────────────
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyNotes, setHistoryNotes] = useState<HistoryNoteItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [rawNotes, setRawNotes] = useState<any[]>([]); // full note objects for jumping

  // ── Editor Setup ───────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
        link: false,
        underline: false,
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph", "listItem"] }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { class: "text-[#9b2d30] underline cursor-pointer" },
      }),
      Placeholder.configure({
        placeholder: "የሕንጸት ማስታወሻዎን እዚህ ይጀምሩ...",
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
  });

  // ── Notes Hook: Encrypted / Decrypted Content ──────
  const { content, title, setTitle, saveNote, isLoading } = useNotes({
    userId: userId || "guest_user",
    chapterId: chapterId || "unknown",
    pageIndex: pageIndex ?? 0,
    password: password || "fallback_pass",
    noteId: activeNoteId, // load specific note if selected
  });

  // ── Load Decrypted Content into Editor ─────────────
  useEffect(() => {
    if (!editor || content === undefined) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, {
        parseOptions: { preserveWhitespace: "full" },
      });
    }
  }, [content, editor]);

  // ── Debounced Auto-Save (600ms) ────────────────────
  const debouncedSave = useMemo(() => {
    let timer: NodeJS.Timeout | null = null;

    const save = (html: string, title: string) => {
      if (!html.trim() || html === "<p></p>") return;
      saveNote(html, title);
      onSave(html, title);
    };

    const debounced = (html: string, title: string) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => save(html.trim(), title), 600);
    };

    debounced.cancel = () => {
      if (timer) clearTimeout(timer);
    };

    return debounced;
  }, [saveNote, onSave]);

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => debouncedSave(editor.getHTML(), title);
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      debouncedSave.cancel();
    };
  }, [editor, debouncedSave, title]);

  // ── Note History Loading ───────────────────────────
  useEffect(() => {
    if (!isHistoryOpen || !userId) return;

    let mounted = true;
    setHistoryLoading(true);

    (async () => {
      try {
        const notes = await NoteRepository.getAllUserNotes(userId);
        if (!mounted) return;

        setRawNotes(notes);

        const formatted = notes.map((n) => ({
          id: n.id,
          pageIndex: n.pageIndex,
          chapterId: n.chapterId,
          title:
            n.title ||
            `ምዕራፍ ${n.chapterId} • ገጽ ${Number(n.pageIndex ?? 0) + 1}`,
          date: new Date(n.updatedAt).toLocaleDateString("am-ET", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setHistoryNotes(formatted);
      } catch (err) {
        console.error("Failed to load note history:", err);
      } finally {
        if (mounted) setHistoryLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isHistoryOpen, userId]);

  // ── Handle Outside Click for History Drawer ────────
  const drawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    if (isHistoryOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isHistoryOpen]);

  // ── Create New Note ───────────────────────────────
  const handleCreateNew = () => {
    setActiveNoteId(null); // reset current note
    setTitle(""); // clear title
    editor?.commands.setContent(""); // clear editor
    setIsHistoryOpen(false);
  };

  if (!editor) return null;

  // ── Render ────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
          />

          {/* Main Notepad Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 240 }}
            className="fixed inset-x-0 bottom-0 z-[9999] bg-[#fdf8f2] max-h-[94vh] rounded-t-3xl flex flex-col shadow-2xl border-t-4 border-[#9b2d30]/80">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#9b2d30]/20 bg-gradient-to-b from-[#fdfaf7] to-[#fdf8f2]">
              <h2 className="text-xs font-semibold text-[#3d1c1d] flex items-center gap-3">
                <BookOpenText size={22} className="text-[#9b2d30]" />
                የሕንጸት ማስታወሻ
              </h2>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="px-4 py-1.5 text-[0.75rem] font-medium bg-[#9b2d30]/10 hover:bg-[#9b2d30]/20 text-[#9b2d30] rounded-lg transition">
                  ማህደር
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition">
                  ዝጋው
                </button>
              </div>
            </div>

            {/* Title Input + New Note Button */}
            <div className="px-6 py-2 bg-[#fdf8f2] border-b border-[#9b2d30]/10 flex items-center gap-4">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setTitle(newTitle);
                  saveNote(editor?.getHTML() || "", newTitle);
                }}
                placeholder="ማስታወሻ ርዕስ (ለምሳሌ፡ የጠዋት ጸሎት...)"
                className="flex-1 bg-transparent border-none focus:ring-0 text-[#3d1c1d] font-bold placeholder:opacity-30 text-lg"
              />
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#9b2d30] text-white rounded-lg text-xs hover:bg-[#7f2428] transition shadow-md">
                + አዲስ ማስታወሻ
              </button>
            </div>

            {/* History Drawer */}
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 w-5/6 sm:w-96 bg-[#fdfaf7] shadow-2xl z-[10000] flex flex-col border-r border-[#9b2d30]/15 rounded-r-2xl overflow-hidden"
                  ref={drawerRef}>
                  <div className="p-5 border-b border-[#9b2d30]/10 bg-[#fdf8f2]">
                    <h3 className="text-lg font-semibold text-[#3d1c1d]">
                      ያሉ ማስታወሻዎች
                    </h3>
                  </div>

                  {historyLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#9b2d30] animate-spin" />
                    </div>
                  ) : historyNotes.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[#9b2d30]/60 text-sm">
                      ገና ምንም ማስታወሻ የለም
                    </div>
                  ) : (
                    <HistoryDrawer
                      onClose={() => setIsHistoryOpen(false)}
                      notes={historyNotes}
                      onSelect={(selectedId) => {
                        const note = rawNotes.find((n) => n.id === selectedId);
                        if (note?.pageIndex !== undefined && onGoToPage) {
                          onGoToPage(note.pageIndex);
                        }
                        setActiveNoteId(selectedId);
                        setIsHistoryOpen(false);
                      }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toolbar */}
            <Toolbar editor={editor} />

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-10 bg-[#fdf8f2] relative">
              <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('/assets/images/parchment-subtle.webp')] bg-repeat" />
              <div className="relative z-10 max-w-3xl mx-auto prose prose-[--tw-prose-body:#3d1c1d] prose-headings:text-[#3d1c1d] prose-headings:font-serif prose-p:leading-[1.85] prose-p:text-[1.08rem] prose-li:text-[1.08rem] prose-headings:tracking-tight focus:outline-none">
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[#9b2d30]/15 bg-linear-to-t from-[#fdfaf7] to-[#fdf8f2] flex justify-end gap-4">
              <button
                onClick={() => {
                  const html = editor.getHTML().trim();
                  if (html && html !== "<p></p>") {
                    // onClose(); // already auto-saved
                  } else {
                    // onClose();
                  }
                }}
                disabled={isLoading}
                className="px-8 py-3 bg-[#9b2d30] hover:bg-[#7f2428] text-white rounded-xl font-medium shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95">
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                መዝግብ
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
