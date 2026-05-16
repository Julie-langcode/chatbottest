import { RefreshCw } from "lucide-react";
import { MODES, VOCABULARY } from "../data/curriculum";
import type { SessionData } from "../types";
import { renderMessage } from "./messageRenderer";

interface Props {
  session: SessionData;
  onRestart: () => void;
  onNewMode: () => void;
}

export function FeedbackScreen({ session, onRestart, onNewMode }: Props) {
  const modeData = MODES.find((m) => m.id === session.mode)!;
  const lastBotMessage =
    [...session.messages].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const usedVocab = VOCABULARY.filter((v) =>
    session.messages.some((m) => m.content.toLowerCase().includes(v.term.toLowerCase()))
  ).slice(0, 6);

  return (
    <div
      className="pb-fade-in"
      style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}
    >
      <div
        className="pb-mono"
        style={{
          fontSize: 11,
          color: "var(--accent)",
          letterSpacing: "0.15em",
          marginBottom: 16,
          textTransform: "uppercase"
        }}
      >
        Session Complete · {modeData.label}
      </div>
      <h1
        className="pb-display"
        style={{
          fontSize: "clamp(40px, 6vw, 56px)",
          fontWeight: 500,
          marginBottom: 32,
          lineHeight: 1,
          letterSpacing: "-0.02em"
        }}
      >
        Nice work.
      </h1>

      <div className="pb-card" style={{ padding: 28, borderRadius: 14, marginBottom: 16 }}>
        <div
          className="pb-mono"
          style={{
            fontSize: 10,
            color: "var(--text-muted)",
            marginBottom: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase"
          }}
        >
          AI Coach Final Feedback
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.65, color: "var(--text)" }}>
          {renderMessage(lastBotMessage)}
        </div>
      </div>

      {usedVocab.length > 0 && (
        <div className="pb-card" style={{ padding: 24, borderRadius: 14, marginBottom: 32 }}>
          <div
            className="pb-mono"
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              marginBottom: 14,
              letterSpacing: "0.12em",
              textTransform: "uppercase"
            }}
          >
            📚 Vocabulary you practiced
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {usedVocab.map((v) => (
              <span
                key={v.term}
                className="pb-vocab"
                data-def={v.def}
                tabIndex={0}
                style={{
                  padding: "6px 12px",
                  background: "var(--accent-soft)",
                  borderRadius: 20,
                  fontSize: 13,
                  borderBottom: "1px dashed var(--accent)"
                }}
              >
                {v.term}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={onRestart}
          className="pb-btn-primary"
          style={{
            padding: "14px 22px",
            borderRadius: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14
          }}
        >
          <RefreshCw size={15} /> Practice Again
        </button>
        <button
          onClick={onNewMode}
          className="pb-btn-ghost"
          style={{
            padding: "14px 22px",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          Try Another Drill
        </button>
      </div>
    </div>
  );
}
