"use client";
import { useState } from "react";
import { BookPage } from "./BookPage";

interface BookProps {
  pages: { content: string }[];
}

export const Book = ({ pages }: BookProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    if (currentPage < pages.length - 1) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="relative w-full max-w-2xl aspect-[3/4] perspective-1000 mx-auto">
      {/* Book Spine/Center Shadow */}
      <div className="absolute left-0 top-0 w-1 h-full bg-black/20 z-10" />

      {pages.map((page, index) => (
        <BookPage
          key={index}
          content={page.content}
          pageNumber={index + 1}
          isFlipped={index < currentPage}
        />
      ))}

      {/* Navigation Triggers */}
      <div className="absolute bottom-[-50px] flex justify-between w-full px-4">
        <button
          onClick={prevPage}
          className="cinnabar-text font-serif italic hover:underline disabled:opacity-30"
          disabled={currentPage === 0}>
          ← Previous
        </button>
        <button
          onClick={nextPage}
          className="cinnabar-text font-serif italic hover:underline disabled:opacity-30"
          disabled={currentPage === pages.length}>
          Next →
        </button>
      </div>
    </div>
  );
};
