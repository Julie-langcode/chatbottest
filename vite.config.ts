import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { DEFAULT_MODEL, handleChatRequest } from "./server/anthropic";

// Serves POST /api/chat during `npm run dev`, the same way the Vercel function does in
// production, so the bot (and the research pilot) can run locally with the key in .env.
function devApi(env: Record<string, string>): Plugin {
  return {
    name: "dev-api-chat",
    configureServer(server) {
      server.middlewares.use("/api/chat", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        let raw = "";
        req.on("data", (chunk) => {
          raw += chunk;
        });
        req.on("end", async () => {
          let body = {};
          try {
            body = raw ? JSON.parse(raw) : {};
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid JSON" }));
            return;
          }
          const result = await handleChatRequest(
            body,
            env.ANTHROPIC_API_KEY,
            env.ANTHROPIC_MODEL || DEFAULT_MODEL
          );
          res.statusCode = result.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result.body));
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  // Load every variable from .env (not only VITE_*); none of them reaches the browser bundle.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), devApi(env)],
    server: {
      port: 5173,
      host: true
    }
  };
});
