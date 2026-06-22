"use client";

import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AskMemoTabProps {
  transcript: string;
}

const SUGGESTED = [
  "What were the main topics covered?",
  "What should I focus on for the exam?",
  "Summarize the key conclusions.",
];

export default function AskMemoTab({ transcript }: AskMemoTabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    setError(null);

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ask-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          transcript,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const updated = [...m];
          updated[updated.length - 1] = { role: "assistant", content: full };
          return updated;
        });
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch {
      setError("Failed to get a response. Please try again.");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
      <h2
        className="hidden md:block"
        style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 600, color: "#f0f0f0", marginBottom: 20 }}
      >
        Ask Memo
      </h2>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4" style={{ opacity: 0.5 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c96acb" strokeWidth="1.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#71717a", textAlign: "center" }}>
              Ask anything about your recording
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                maxWidth: "85%",
                padding: "11px 16px",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user" ? "#c96acb" : "#0e0a10",
                border: m.role === "user" ? "none" : "1px solid #1c1620",
                fontFamily: "var(--font-inter)",
                fontSize: 14.5,
                color: m.role === "user" ? "#0a0a0a" : "#d4d4d8",
                fontWeight: m.role === "user" ? 500 : 400,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content || (m.role === "assistant" && streaming ? <span style={{ opacity: 0.4 }}>●●●</span> : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#f87171", marginBottom: 8 }}>{error}</p>
      )}

      {messages.length === 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {SUGGESTED.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-left rounded-2xl transition-colors"
              style={{
                fontFamily: "var(--font-inter)", fontSize: 14, color: "#a1a1aa",
                background: "#0e0a10", border: "1px solid #1c1620",
                padding: "12px 16px",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex", gap: 10, background: "#0e0a10", border: "1px solid #1c1620",
          borderRadius: 28, padding: "6px 6px 6px 18px", alignItems: "center",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send(input))}
          placeholder="Ask anything about your memories…"
          disabled={streaming}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            fontFamily: "var(--font-inter)", fontSize: 14.5, color: "#d4d4d8",
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={streaming || !input.trim()}
          className="flex items-center justify-center transition-transform active:scale-90"
          style={{
            width: 38, height: 38, borderRadius: "50%",
            background: input.trim() && !streaming ? "#c96acb" : "#1c1620",
            border: "none", flexShrink: 0,
          }}
        >
          <ArrowRight size={16} color="#0a0a0a" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}