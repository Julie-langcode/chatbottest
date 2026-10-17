// Research settings for the hallucination-management protocol.
//
// The protocol can be switched off to collect a baseline ("without protocol") on the
// same scenarios. Every saved session records which condition and which versions it ran
// under, so pilot results stay comparable after the prompts change.

/** Bump when the protocol rules, the glossary or the checker prompt change. */
export const PROTOCOL_VERSION = "1.0";

/** Bump when the role prompts of the five modes change. */
export const PROMPT_VERSION = "2026-10-17";

const STORAGE_KEY = "pb.protocolEnabled";

function readUrlOverride(): boolean | null {
  try {
    const value = new URLSearchParams(window.location.search).get("protocol");
    if (value === "on") return true;
    if (value === "off") return false;
  } catch {
    // ignore
  }
  return null;
}

/** Protocol is ON by default. `?protocol=off` in the URL or the research panel turns it off. */
export function getProtocolEnabled(): boolean {
  const fromUrl = readUrlOverride();
  if (fromUrl !== null) return fromUrl;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "off") return false;
  } catch {
    // storage unavailable: fall back to the default
  }
  return true;
}

export function setProtocolEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // ignore: the setting just won't persist
  }
}

export const ERROR_TYPE_LABELS: Record<"factual" | "linguistic" | "pragmatic" | "other", string> = {
  factual: "Фактическая",
  linguistic: "Языковая",
  pragmatic: "Прагматическая",
  other: "Другое"
};
