import { ChevronRight, Sparkles } from "lucide-react";
import { MODES } from "../data/curriculum";
import type { ModeId } from "../types";

interface Props {
  onSelectMode: (id: ModeId) => void;
}

export function WelcomeScreen({ onSelectMode }: Props) {
  return (
    <div
      className="pb-fade-in"
      style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--accent)",
            display: "grid",
            placeItems: "center"
          }}
        >
          <Sparkles size={16} color="#1a1500" strokeWidth={2.5} />
        </div>
        <div>
          <div
            className="pb-mono"
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase"
            }}
          >
            Leaders' Speaking Club
          </div>
          <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
            English for Decision Makers
          </div>
        </div>
      </div>

      {/* Headline */}
      <div style={{ marginBottom: 56 }}>
        <div
          className="pb-mono pb-slide-in"
          style={{
            fontSize: 12,
            color: "var(--accent)",
            letterSpacing: "0.15em",
            marginBottom: 16,
            textTransform: "uppercase"
          }}
        >
          Module 01 · 15-min Practice
        </div>
        <h1
          className="pb-display pb-slide-in"
          style={{
            fontSize: "clamp(48px, 8vw, 88px)",
            lineHeight: 0.95,
            marginBottom: 24,
            fontWeight: 500,
            animationDelay: "80ms"
          }}
        >
          Pitch &<br />
          <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>
            Negotiations
          </em>
        </h1>
        <p
          className="pb-slide-in"
          style={{
            fontSize: 17,
            color: "var(--text-muted)",
            maxWidth: 580,
            lineHeight: 1.6,
            animationDelay: "160ms"
          }}
        >
          Practice business English where it counts — in front of investors, partners, and the
          board. Choose a drill below. Talk to an AI. Get real feedback.
        </p>
      </div>

      {/* Modes grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16
        }}
      >
        {MODES.map((mode, i) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="pb-card pb-slide-in"
              style={{
                padding: 24,
                borderRadius: 12,
                textAlign: "left",
                cursor: "pointer",
                animationDelay: `${240 + i * 60}ms`,
                color: "var(--text)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minHeight: 200
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${mode.accent}1f`,
                    color: mode.accent,
                    display: "grid",
                    placeItems: "center"
                  }}
                >
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <ChevronRight size={18} color="var(--text-dim)" />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  className="pb-display"
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    marginBottom: 4,
                    letterSpacing: "-0.01em"
                  }}
                >
                  {mode.label}
                </div>
                <div
                  className="pb-mono"
                  style={{
                    fontSize: 11,
                    color: mode.accent,
                    marginBottom: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em"
                  }}
                >
                  {mode.subtitle}
                </div>
                <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55 }}>
                  {mode.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 56,
          paddingTop: 32,
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16
        }}
      >
        <div
          className="pb-mono"
          style={{
            fontSize: 11,
            color: "var(--text-dim)",
            letterSpacing: "0.1em",
            textTransform: "uppercase"
          }}
        >
          Powered by Claude · For B1–B2 speakers
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          ⌘ Yulia Balabanova · Methodology
        </div>
      </div>
    </div>
  );
}
