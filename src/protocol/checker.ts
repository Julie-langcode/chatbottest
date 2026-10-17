// Level 2 of the hallucination-management protocol: verification.
//
// After each coach reply, a second, deterministic call reviews ONLY the coach's language
// teaching (corrections, explanations, model phrases, term definitions) against the course
// glossary and the three error types of the typology. The result is shown under the reply
// ("checked against the course glossary" or "possible inaccuracy") and saved in the log.

import type { CheckIssue, CheckResult, ErrorType, ModeId } from "../types";
import { glossaryBlock } from "./rules";

const CHECKER_SYSTEM = `You are a strict reviewer of an AI business-English coach. You do NOT talk to the learner. You check one coach reply and return JSON only.

Check ONLY what the coach teaches: corrections of the learner's English, explanations of grammar or vocabulary, phrases offered as models, definitions of terms, and claims about the real world.
Do NOT flag: the learner's own mistakes; fictional details of the role-play (company names, scenario numbers, terms the character offers); the character's tough tone, as long as it is not presented as a model phrase.

Possible problems, by type:
- "factual": a term defined differently from the COURSE GLOSSARY; invented real-world statistics, laws or facts about real companies or people; a definitive legal or financial interpretation of a contract clause.
- "linguistic": a "correction" that turns a correct phrase into a wrong or no-better one; an ungrammatical or unnatural model phrase; a wrong grammar or usage explanation; a calque presented as correct English.
- "pragmatic": a model phrase for a pitch or negotiation that is rude, too blunt or inappropriate for an international business partner, presented as good.

Return at most 3 issues, only ones you are reasonably confident about. If you find nothing, return an empty list.
Write each "note" in Russian, one short sentence the learner can understand. "quote" is an exact short fragment (max 15 words) of the COACH reply.

Output exactly this JSON and nothing else:
{"status":"ok"|"warning","issues":[{"type":"factual"|"linguistic"|"pragmatic","quote":"...","note":"..."}]}

`;

export function buildCheckerSystem(): string {
  return CHECKER_SYSTEM + glossaryBlock();
}

export function buildCheckerInput(mode: ModeId, learnerMessage: string, coachReply: string): string {
  return [
    `PRACTICE MODE: ${mode}`,
    "",
    "LEARNER MESSAGE:",
    learnerMessage || "(none — this is the coach's opening)",
    "",
    "COACH REPLY TO CHECK:",
    coachReply
  ].join("\n");
}

const TYPES: ErrorType[] = ["factual", "linguistic", "pragmatic"];

/** Parses the checker's answer; anything malformed becomes status "error" (not a silent pass). */
export function parseCheckerOutput(text: string): CheckResult {
  const checkedAt = new Date().toISOString();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    return { status: "error", issues: [], checkedAt };
  }
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as {
      status?: unknown;
      issues?: unknown;
    };
    const rawIssues = Array.isArray(parsed.issues) ? parsed.issues : [];
    const issues: CheckIssue[] = rawIssues
      .map((i) => i as { type?: unknown; quote?: unknown; note?: unknown })
      .filter((i) => typeof i.note === "string" && i.note.trim().length > 0)
      .slice(0, 3)
      .map((i) => ({
        type: TYPES.includes(i.type as ErrorType) ? (i.type as ErrorType) : "other",
        quote: typeof i.quote === "string" ? i.quote.slice(0, 200) : "",
        note: (i.note as string).slice(0, 400)
      }));
    return { status: issues.length > 0 ? "warning" : "ok", issues, checkedAt };
  } catch {
    return { status: "error", issues: [], checkedAt };
  }
}
