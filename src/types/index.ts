export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

export type ModeId =
  | "pitch_drill"
  | "vocab_match"
  | "objection_handling"
  | "negotiation_sim"
  | "follow_up_email";

export interface PracticeMode {
  id: ModeId;
  title: string;
  subtitle: string;
  description: string;
}

export interface VocabularyEntry {
  term: string;
  definition: string;
}
