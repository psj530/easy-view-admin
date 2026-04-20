"use client";

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sections: {
    title: string;
    items: { label: string; description: string }[];
  }[];
}

export default function InfoPopup({ isOpen, onClose, title, sections }: InfoPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-[#1a1a1a]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-pwc-orange mb-3">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.label} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-medium text-[#1a1a1a] min-w-[80px] flex-shrink-0">{item.label}</span>
                    <span className="text-sm text-gray-600">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="btn-primary text-sm">확인</button>
        </div>
      </div>
    </div>
  );
}
