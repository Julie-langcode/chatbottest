import { PRACTICE_MODES } from "../data/curriculum";
import type { ModeId } from "../types";

interface Props {
  selected: ModeId | null;
  onSelect: (id: ModeId) => void;
}

export function ModeSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:overflow-visible">
      {PRACTICE_MODES.map((mode) => {
        const isActive = selected === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelect(mode.id)}
            className={`shrink-0 md:shrink w-[260px] md:w-auto text-left rounded-2xl border p-4 transition-all ${
              isActive
                ? "border-accent bg-accent/10 ring-2 ring-accent/60"
                : "border-white/10 bg-bg-elevated hover:border-white/20 hover:bg-bg-surface"
            }`}
          >
            <div className="text-base font-semibold text-white">{mode.title}</div>
            <div className="text-xs text-accent/90 mt-1">{mode.subtitle}</div>
            <p className="text-xs text-slate-300/80 mt-2 leading-relaxed">{mode.description}</p>
          </button>
        );
      })}
    </div>
  );
}
