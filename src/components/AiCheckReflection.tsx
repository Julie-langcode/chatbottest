import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ERROR_TYPE_LABELS } from "../protocol/config";
import { updateSession } from "../research/sessionLog";
import type { Reflection, SessionData } from "../types";

interface Props {
  session: SessionData;
}

const small: React.CSSProperties = { fontSize: 14, lineHeight: 1.6 };

const ANSWERS: { value: Reflection["noticed"]; label: string }[] = [
  { value: "yes", label: "Да" },
  { value: "no", label: "Нет" },
  { value: "unsure", label: "Не уверена / не уверен" }
];

/**
 * Level 4 of the protocol: the learner reflects on the AI's accuracy after the session.
 * Shows what the checker (level 2) and the learner (level 3 flags) marked, asks one
 * question, and saves the answer to the session log.
 */
export function AiCheckReflection({ session }: Props) {
  const [noticed, setNoticed] = useState<Reflection["noticed"] | null>(null);
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);

  const warnings = session.messages.flatMap((m) =>
    m.check?.status === "warning" ? m.check.issues : []
  );

  return (
    <div className="pb-card" style={{ padding: 24, borderRadius: 14, marginBottom: 16 }}>
      <div
        className="pb-mono"
        style={{
          fontSize: 10,
          color: "var(--text-muted)",
          marginBottom: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          display: "flex",
          gap: 8,
          alignItems: "center"
        }}
      >
        <ShieldCheck size={12} /> Проверь ИИ
      </div>

      {session.protocolEnabled && (
        <div style={{ ...small, color: "var(--text-muted)", marginBottom: 8 }}>
          Автоматическая проверка отметила возможных неточностей: {warnings.length}.
        </div>
      )}
      {warnings.slice(0, 5).map((w, i) => (
        <div key={i} style={{ ...small, fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: "var(--warn)" }}>
            {ERROR_TYPE_LABELS[w.type]}
            {w.quote ? ` · «${w.quote}»` : ""}
          </span>
          <span style={{ color: "var(--text-muted)" }}> — {w.note}</span>
        </div>
      ))}
      {session.flags.length > 0 && (
        <div style={{ ...small, color: "var(--text-muted)", marginBottom: 8 }}>
          Ты отметил(а) ответов как возможную ошибку ИИ: {session.flags.length}.
        </div>
      )}

      <div style={{ ...small, marginTop: 12, marginBottom: 10 }}>
        Было ли в ответах ИИ что-то неверное или сомнительное: объяснение, исправление, фраза?
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {ANSWERS.map((a) => (
          <button
            key={a.value}
            type="button"
            className="pb-btn-ghost"
            disabled={saved}
            onClick={() => setNoticed(a.value)}
            style={{
              fontSize: 13,
              padding: "6px 14px",
              borderRadius: 999,
              cursor: saved ? "default" : "pointer",
              borderColor: noticed === a.value ? "var(--accent)" : undefined,
              color: noticed === a.value ? "var(--accent)" : undefined
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={saved}
        placeholder="Что именно и как ты это проверил(а)? (необязательно)"
        className="pb-textarea"
        rows={2}
        style={{ width: "100%", fontSize: 13, padding: "8px 12px", borderRadius: 8, resize: "vertical" }}
      />
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10 }}>
        <button
          type="button"
          className="pb-btn-primary"
          disabled={!noticed || saved}
          onClick={() => {
            if (!noticed) return;
            updateSession(session.sessionId, {
              reflection: { noticed, comment: comment.trim(), ts: new Date().toISOString() }
            });
            setSaved(true);
          }}
          style={{ fontSize: 13, padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}
        >
          {saved ? "Сохранено" : "Сохранить ответ"}
        </button>
      </div>

      <details style={{ marginTop: 16 }}>
        <summary style={{ ...small, fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
          Как распознать ошибку ИИ
        </summary>
        <ul style={{ ...small, fontSize: 13, color: "var(--text-muted)", paddingLeft: 18, marginTop: 8 }}>
          <li>Объяснение термина расходится с подсказкой из словаря курса.</li>
          <li>«Исправление» заменило твою фразу на другую, но не назвало причину.</li>
          <li>Уверенные цифры, законы или факты о реальных компаниях: ИИ их не проверяет.</li>
          <li>Предложенная фраза для переговоров звучит резко — уточни у преподавателя.</li>
        </ul>
      </details>
    </div>
  );
}
