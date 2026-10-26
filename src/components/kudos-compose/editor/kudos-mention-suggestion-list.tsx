export interface MentionItem {
  id: string;
  label: string;
}

interface Props {
  items: MentionItem[];
  selectedIndex: number;
  emptyText: string;
  onSelect: (item: MentionItem) => void;
}

export function KudosMentionSuggestionList({ items, selectedIndex, emptyText, onSelect }: Props) {
  return (
    <ul
      role="listbox"
      className="absolute right-0 bottom-full left-0 z-10 mb-1 max-h-48 overflow-y-auto rounded-lg border border-[#998C5F] bg-white py-1 shadow-lg"
    >
      {items.length === 0 ? (
        <li className="px-4 py-2 text-base text-[#999]">{emptyText}</li>
      ) : (
        items.map((item, i) => (
          <li
            key={item.id}
            role="option"
            aria-selected={i === selectedIndex}
            // mouseDown (not click) keeps editor focus so the suggestion session survives.
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(item);
            }}
            className={`cursor-pointer px-4 py-2 text-base font-bold text-[#00101A] ${i === selectedIndex ? "bg-[#FFEA9E]" : ""}`}
          >
            {item.label}
          </li>
        ))
      )}
    </ul>
  );
}
