//src/app/components/thanks/ThanksPage.tsx
export default function Thanks({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-150 bg-[#fdfaf1] overflow-y-auto animate-slideUp">
      <div className="sticky top-0 bg-[#fdfaf1]/80 backdrop-blur-md p-6 flex items-center border-b border-[#b99b6b]/10">
        <button onClick={onClose} className="text-[#9b5c12] font-bold">
          ተመለስ
        </button>
        <h2 className="flex-1 text-center font-serif italic text-xl">
          ልዩ ምስጋና
        </h2>
      </div>

      <div className="p-8 max-w-2xl mx-auto space-y-12">
        <section>
          <ul className="space-y-2 text-[#3d1c1d]/70">
            <li>• ለቅዱሳን አባቶቻችን</li>
            <li>• ለቴክኒክ ድጋፍ ላደረጉልን...</li>
          </ul>
        </section>

        <button
          onClick={onClose}
          className="w-full py-4 bg-[#9b5c12] text-white rounded-2xl font-bold mt-10">
          ተረድቻለሁ
        </button>
      </div>
    </div>
  );
}
