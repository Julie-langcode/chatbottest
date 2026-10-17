import { DEFAULT_MODEL, handleChatRequest } from "../server/anthropic";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const result = await handleChatRequest(
    req.body ?? {},
    process.env.ANTHROPIC_API_KEY,
    process.env.ANTHROPIC_MODEL || DEFAULT_MODEL
  );
  return res.status(result.status).json(result.body);
}
