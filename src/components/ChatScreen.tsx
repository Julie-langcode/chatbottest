import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Send } from "lucide-react";
import { MAX_TURNS, MODES } from "../data/curriculum";
import { useClaudeChat } from "../hooks/useClaudeChat";
import type { ModeId, SessionData } from "../types";
import { renderMessage } from "./messageRenderer";

interface Props {
  mode: ModeId;
  onBack: () => void;
  onComplete: (session: SessionData) => void;
}

export function ChatScreen({ mode, onBack, onComplete }: Props) {
  const modeData = useMemo(() => MODES.find((m) => m.id === mode)!, [mode]);
  const { messages, send, isStreaming, error, retry } = useClaudeChat({ mode });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const completedRef = useRef(false);

  const userTurns = messages.filter((m) => m.role === "user").length;
  const progress = Math.min(userTurns, MAX_TURNS);
  const sessionDone = progress >= MAX_TURNS;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (sessionDone && !isStreaming && !completedRef.current) {
      completedRef.current = true;
      const t = setTimeout(() => onComplete({ mode, messages }), 1200);
      return () => clearTimeout(t);
    }
  }, [sessionDone, isStreaming, mode, messages, onComplete]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming || sessionDone) return;
    const text = input;
    setInput("");
    await send(text);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div
      className="pb-fade-in"
      style={{
        maxWidth: 820,
        margin: "0 auto",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          paddingBottom: 20,
          borderBottom: "1px solid var(--border)"
        }}
      >
        <button
          onClick={onBack}
          className="pb-btn-ghost"
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ textAlign: "center", minWidth: 0, flex: 1, padding: "0 12px" }}>
          <div
            className="pb-mono"
            style={{
              fontSize: 10,
              color: modeData.accent,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {modeData.subtitle}
          </div>
          <div
            className="pb-display"
            style={{ fontSize: 18, marginTop: 2, fontWeight: 500 }}
          >
            {modeData.label}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {Array.from({ length: MAX_TURNS }).map((_, i) => (
            <div
              key={i}
              className={`pb-progress-dot ${i < progress ? "active" : ""}`}
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="pb-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "8px 0"
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="pb-fade-in"
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
            }}
          >
            <div
              className={msg.role === "user" ? "pb-bubble-user" : "pb-bubble-bot"}
              style={{
                maxWidth: "85%",
                padding: "14px 18px",
                borderRadius: 14,
                fontSize: 15,
                lineHeight: 1.6,
                borderTopRightRadius: msg.role === "user" ? 4 : 14,
                borderTopLeftRadius: msg.role === "user" ? 14 : 4
              }}
            >
              {msg.role === "assistant" && (
                <div
                  className="pb-mono"
                  style={{
                    fontSize: 10,
                    color: "var(--accent)",
                    marginBottom: 8,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase"
                  }}
                >
                  AI Coach
                </div>
              )}
              <div>{renderMessage(msg.content)}</div>
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role === "user" && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              className="pb-bubble-bot"
              style={{
                padding: "14px 18px",
                borderRadius: 14,
                borderTopLeftRadius: 4,
                display: "flex",
                gap: 6,
                alignItems: "center"
              }}
            >
              <div
                className="pb-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--text-muted)"
                }}
              />
              <div
                className="pb-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--text-muted)"
                }}
              />
              <div
                className="pb-dot"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--text-muted)"
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                background: "rgba(217, 119, 87, 0.1)",
                border: "1px solid rgba(217, 119, 87, 0.3)",
                padding: "10px 16px",
                borderRadius: 8,
                color: "var(--danger)",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 12,
                maxWidth: "95%"
              }}
            >
              <AlertCircle size={14} />
              <span style={{ flex: 1 }}>{error}</span>
              <button
                onClick={retry}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(217, 119, 87, 0.5)",
                  color: "var(--danger)",
                  padding: "4px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your response in English..."
            className="pb-textarea"
            rows={1}
            disabled={isStreaming || sessionDone}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: 10,
              fontSize: 15,
              resize: "none",
              lineHeight: 1.5
            }}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isStreaming || sessionDone}
            className="pb-btn-primary"
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14
            }}
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        </div>
        <div
          className="pb-mono"
          style={{
            fontSize: 10,
            color: "var(--text-dim)",
            marginTop: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase"
          }}
        >
          {sessionDone
            ? "Session complete"
            : `Turn ${progress + 1} of ${MAX_TURNS} · Enter to send · Shift+Enter for new line`}
        </div>
      </div>
    </div>
  );
}
