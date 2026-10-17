import { useState } from "react";
import { Download, FlaskConical, Trash2 } from "lucide-react";
import { PROMPT_VERSION, PROTOCOL_VERSION } from "../protocol/config";
import { clearSessions, exportCsv, exportJson, listSessions } from "../research/sessionLog";

interface Props {
  protocolEnabled: boolean;
  onProtocolChange: (enabled: boolean) => void;
}

const small: React.CSSProperties = { fontSize: 13, lineHeight: 1.5 };

/**
 * Research panel for the pilot and for the teacher (level 3):
 * switch the protocol on/off for comparison, and export the session log.
 */
export function ResearchPanel({ protocolEnabled, onProtocolChange }: Props) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(() => listSessions().length);

  return (
    <div className="pb-card" style={{ marginTop: 40, padding: 20, borderRadius: 12 }}>
      <button
        type="button"
        onClick={() => {
          setCount(listSessions().length);
          setOpen((o) => !o);
        }}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          gap: 8,
          alignItems: "center",
          padding: 0,
          fontSize: 13
        }}
        aria-expanded={open}
      >
        <FlaskConical size={14} /> Исследование и журнал сессий
      </button>

      {open && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ ...small, color: "var(--text-muted)" }}>
            Диалоги сохраняются только в этом браузере и никуда не отправляются. Выгрузку
            передаёт преподавателю или исследователю сам пользователь. Сохранено сессий: {count}.
          </div>

          <label style={{ ...small, display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={protocolEnabled}
              onChange={(e) => onProtocolChange(e.target.checked)}
            />
            Протокол управления ошибками ИИ включён (v{PROTOCOL_VERSION}, промпты {PROMPT_VERSION})
          </label>
          <div style={{ ...small, color: "var(--text-dim)" }}>
            Выключи протокол, чтобы записать базовые сессии для сравнения. Действует на новые
            сессии. Можно также открыть ссылку с ?protocol=off.
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button
              type="button"
              className="pb-btn-ghost"
              onClick={exportCsv}
              style={{ ...small, padding: "8px 14px", borderRadius: 8, cursor: "pointer", display: "flex", gap: 6, alignItems: "center" }}
            >
              <Download size={14} /> CSV для разметки
            </button>
            <button
              type="button"
              className="pb-btn-ghost"
              onClick={exportJson}
              style={{ ...small, padding: "8px 14px", borderRadius: 8, cursor: "pointer", display: "flex", gap: 6, alignItems: "center" }}
            >
              <Download size={14} /> Полный журнал (JSON)
            </button>
            <button
              type="button"
              className="pb-btn-ghost"
              onClick={() => {
                if (window.confirm("Удалить все сохранённые сессии из этого браузера? Сначала сделай выгрузку.")) {
                  clearSessions();
                  setCount(0);
                }
              }}
              style={{ ...small, padding: "8px 14px", borderRadius: 8, cursor: "pointer", display: "flex", gap: 6, alignItems: "center", color: "var(--danger)" }}
            >
              <Trash2 size={14} /> Очистить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
