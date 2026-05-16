import { useState } from "react";
import { ModeSelector } from "./components/ModeSelector";
import { Chat } from "./components/Chat";
import type { ModeId } from "./types";

export default function App() {
  const [mode, setMode] = useState<ModeId | null>(null);
  const [pendingMode, setPendingMode] = useState<ModeId | null>(null);

  if (mode) {
    return (
      <div className="h-full bg-bg">
        <Chat key={mode} mode={mode} onChangeMode={() => setMode(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent font-bold">
              LSC
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-accent/80 font-semibold">
                Leaders' Speaking Club
              </div>
              <div className="text-[11px] text-slate-400">Module 1</div>
            </div>
          </div>
          <div className="hidden sm:block text-xs text-slate-400">B2B English · A2–B2</div>
        </header>

        <section className="mt-10 sm:mt-14">
          <h1 className="text-3xl sm:text-5xl font-semibold text-white tracking-tight">
            Pitch & Negotiations
          </h1>
          <p className="mt-3 text-slate-300/90 text-sm sm:text-base max-w-2xl">
            Module 1 Practice — a focused <span className="text-accent">15-minute session</span>{" "}
            to rehearse pitches, handle objections, and negotiate deals in English. Safe space,
            no judgement, instant feedback.
          </p>
        </section>

        <section className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-200">Choose a practice mode</h2>
            <span className="text-[11px] text-slate-400 hidden sm:block">
              5 exchanges per session
            </span>
          </div>
          <ModeSelector selected={pendingMode} onSelect={setPendingMode} />
        </section>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => pendingMode && setMode(pendingMode)}
            disabled={!pendingMode}
            className="rounded-xl bg-accent hover:bg-accent-hover text-white font-medium px-5 py-3 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Practice →
          </button>
        </div>

        <footer className="mt-12 sm:mt-16 border-t border-white/5 pt-5 text-[11px] text-slate-500">
          Leaders' Speaking Club · Module 1: Pitch & Negotiations
        </footer>
      </div>
    </div>
  );
}
