import { useState } from "react";
import { VOCABULARY } from "../data/curriculum";

interface Props {
  transcript: string;
  onPracticeAgain: () => void;
  onChangeMode: () => void;
}

export function FeedbackCard({ transcript, onPracticeAgain, onChangeMode }: Props) {
  const [copied, setCopied] = useState(false);

  const lower = transcript.toLowerCase();
  const reviewTerms = VOCABULARY.filter((v) => !lower.includes(v.term.toLowerCase())).slice(0, 6);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl border border-accent/30 bg-bg-elevated p-5 sm:p-6 shadow-xl animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">Session Complete ✓</h2>
          <p className="text-xs text-slate-300/80 mt-1">
            Nice work. Review the highlights below and run it again to build muscle memory.
          </p>
        </div>
        <button
          onClick={copy}
          className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-200 hover:bg-white/5 transition-colors"
        >
          {copied ? "Copied ✓" : "Copy feedback"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3">
          <div className="text-sm font-semibold text-emerald-300">✅ What worked</div>
          <p className="text-xs text-slate-200/90 mt-1 leading-relaxed">
            See the bot's structured feedback above — quotes, strong phrases, and on-target
            answers are listed there.
          </p>
        </div>
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3">
          <div className="text-sm font-semibold text-amber-300">⚠️ Areas to improve</div>
          <p className="text-xs text-slate-200/90 mt-1 leading-relaxed">
            Pay attention to the rewritten examples. Practice them out loud before your next
            real conversation.
          </p>
        </div>
      </div>

      {reviewTerms.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-semibold text-accent">📚 Vocabulary to review</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {reviewTerms.map((t) => (
              <span
                key={t.term}
                className="vocab-term inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-accent/15 text-slate-100"
                tabIndex={0}
              >
                {t.term}
                <span className="vocab-tooltip">{t.definition}</span>
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Hover or tap a term to see the definition.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col sm:flex-row gap-2">
        <button
          onClick={onPracticeAgain}
          className="flex-1 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium py-2.5 transition-colors"
        >
          Practice Again
        </button>
        <button
          onClick={onChangeMode}
          className="flex-1 rounded-xl border border-white/15 text-slate-100 hover:bg-white/5 text-sm font-medium py-2.5 transition-colors"
        >
          Try Another Mode
        </button>
      </div>
    </div>
  );
}
