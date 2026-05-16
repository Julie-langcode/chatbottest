interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const dots = Array.from({ length: total }, (_, i) => i < current);
  return (
    <div className="flex items-center gap-1.5" aria-label={`Progress ${current}/${total}`}>
      {dots.map((filled, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            filled ? "bg-accent" : "bg-white/15"
          }`}
        />
      ))}
    </div>
  );
}
