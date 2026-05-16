import { useState } from "react";
import { ChatScreen } from "./components/ChatScreen";
import { FeedbackScreen } from "./components/FeedbackScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";
import type { ModeId, Screen, SessionData } from "./types";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedMode, setSelectedMode] = useState<ModeId | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  return (
    <div className="pb-root">
      <div className="pb-grain" />
      <div style={{ position: "relative", zIndex: 2 }}>
        {screen === "welcome" && (
          <WelcomeScreen
            onSelectMode={(id) => {
              setSelectedMode(id);
              setScreen("chat");
              setSessionKey((k) => k + 1);
            }}
          />
        )}
        {screen === "chat" && selectedMode && (
          <ChatScreen
            key={sessionKey}
            mode={selectedMode}
            onBack={() => setScreen("welcome")}
            onComplete={(s) => {
              setSession(s);
              setScreen("feedback");
            }}
          />
        )}
        {screen === "feedback" && session && (
          <FeedbackScreen
            session={session}
            onRestart={() => {
              setScreen("chat");
              setSessionKey((k) => k + 1);
            }}
            onNewMode={() => {
              setSession(null);
              setSelectedMode(null);
              setScreen("welcome");
            }}
          />
        )}
      </div>
    </div>
  );
}
