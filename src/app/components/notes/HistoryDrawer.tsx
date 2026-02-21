//src/app/components/notes/HistoryDrawer.tsx
"use client";

import { FC } from "react";
import { ChevronLeft, List } from "lucide-react";

interface HistoryDrawerProps {
  onClose: () => void;
  notes: { id: string; title?: string; date?: string }[];
  onSelect: (noteId: string) => void;
}

const HistoryDrawer: FC<HistoryDrawerProps> = ({
  onClose,
  notes,
  onSelect,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pt-2">
        <h3 className="font-bold text-[#9b2d30] flex items-center gap-2">
          <List size={18} /> History
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#9b2d30]/10 rounded transition"
          aria-label="Close history drawer">
          <ChevronLeft size={22} />
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {/* 💡 NEW NOTE BUTTON AT TOP OF LIST */}
        <button
          onClick={() => onSelect("NEW_NOTE")}
          className="w-full mb-4 p-3 border-2 border-dashed border-[#9b2d30]/30 rounded-xl text-[#9b2d30] font-bold hover:bg-[#9b2d30]/5 transition">
          + አዲስ ማስታወሻ ይጀምሩ
        </button>
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3 bg-white/40 rounded-xl hover:bg-white/70 cursor-pointer border border-transparent hover:border-[#9b2d30]/20 transition-all"
              onClick={() => onSelect(note.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(note.id);
              }}>
              <p className="text-sm font-bold truncate">
                {note.title || "Untitled"}
              </p>
              <p className="text-[10px] text-gray-500">{note.date}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic text-center mt-10">
            No saved notes
          </p>
        )}
      </div>
    </div>
  );
};

export default HistoryDrawer;
