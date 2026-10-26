import { IconPlus } from "./kudos-compose-icons";

interface AddButtonProps {
  label: string;
  hint: string;
  onClick?: () => void;
  expanded?: boolean;
}

/** mm:662:8911 / mm:662:9133 — outlined "+ label / Tối đa 5" button (98-116px wide, 48px tall). */
export function ComposeAddButton({ label, hint, onClick, expanded }: AddButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onClick}
      className="flex h-12 shrink-0 items-center gap-2 rounded-lg border border-[#998C5F] bg-white px-2 py-1 text-[#998C5F] transition-colors duration-200 hover:bg-[#FFF3C4]"
    >
      <IconPlus />
      <span className="flex flex-col items-start text-left">
        <span className="text-base leading-5 font-bold text-[#00101A]">{label}</span>
        <span className="text-[11px] leading-4 font-bold tracking-[0.5px] text-[#999]">{hint}</span>
      </span>
    </button>
  );
}
