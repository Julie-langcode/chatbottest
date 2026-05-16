import { useEffect, useMemo, useRef, useState } from "react";
import { useClaudeChat } from "../hooks/useClaudeChat";
import { PRACTICE_MODES, QUICK_REPLIES } from "../data/curriculum";
import type { ModeId } from "../types";
import { MessageBubble } from "./MessageBubble";
import { ProgressBar } from "./ProgressBar";
import { FeedbackCard } from "./FeedbackCard";

const SESSION_TURNS = 5;

interface Props {
  mode: ModeId;
  onChangeMode: () => void;
}

export function Chat({ mode, onChangeMode }: Props) {
  const { messages, send, isStreaming, error, turns, retry, reset } = useClaudeChat({ mode });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const modeMeta = useMemo(() => PRACTICE_MODES.find((m) => m.id === mode)!, [mode]);
  const completed = turns >= SESSION_TURNS && !isStreaming;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [input]);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    const text = input;
    setInput("");
    await send(text);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void onSubmit();
    }
  };

  const showQuickReplies = messages.length === 1 && !isStreaming;

  const transcript = messages
    .map((m) => `${m.role === "user" ? "You" : "Coach"}: ${m.content}`)
    .join("\n\n");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/5 bg-bg/80 backdrop-blur sticky top-0 z-10">
        <button
          onClick={onChangeMode}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
          aria-label="Back to modes"
        >
          <span aria-hidden>←</span>
          <span className="hidden sm:inline">Modes</span>
        </button>
        <div className="flex-1 min-w-0 text-center">
          <div className="text-sm font-semibold text-white truncate">{modeMeta.title}</div>
          <div className="text-[11px] text-slate-400 truncate">{modeMeta.subtitle}</div>
        </div>
        <ProgressBar current={Math.min(turns, SESSION_TURNS)} total={SESSION_TURNS} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-y px-4 sm:px-6 py-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {isStreaming &&
            messages[messages.length - 1]?.role === "user" && <TypingIndicator />}

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-100 text-xs px-3 py-2 flex items-center justify-between gap-3">
              <span className="truncate">⚠️ {error}</span>
              <button
                onClick={retry}
                className="shrink-0 text-xs font-semibold px-3 py-1 rounded-md bg-red-500/30 hover:bg-red-500/40"
              >
                Retry
              </button>
            </div>
          )}

          {completed && (
            <div className="pt-4">
              <FeedbackCard
                transcript={transcript}
                onPracticeAgain={reset}
                onChangeMode={onChangeMode}
              />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      {!completed && (
        <form
          onSubmit={onSubmit}
          className="border-t border-white/5 bg-bg/80 backdrop-blur px-4 sm:px-6 py-3"
        >
          <div className="mx-auto max-w-3xl">
            {showQuickReplies && (
              <div className="flex flex-wrap gap-2 mb-2">
                {QUICK_REPLIES[mode].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setInput(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-slate-200 hover:bg-white/5 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your response in English…"
                className="flex-1 resize-none rounded-xl bg-bg-elevated border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm text-slate-100 placeholder:text-slate-500 px-3.5 py-3 min-h-[48px] max-h-[180px]"
                disabled={isStreaming}
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                className="h-[48px] px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <span>Send</span>
                <span aria-hidden>→</span>
              </button>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Tip: Use the <span className="text-accent">PITCH</span> framework — Problem,
              Impact, Traction, Competition, Hook.
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 pl-2">
      <div className="rounded-2xl bg-bg-elevated border border-white/5 px-4 py-3 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-accent/80 animate-dot-1" />
        <span className="h-2 w-2 rounded-full bg-accent/80 animate-dot-2" />
        <span className="h-2 w-2 rounded-full bg-accent/80 animate-dot-3" />
      </div>
    </div>
  );
}
