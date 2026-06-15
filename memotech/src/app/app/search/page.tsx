"use client";

import { useState } from "react";
import TopBar from "@/components/app/TopBar";
import { Search } from "lucide-react";

const SUGGESTED_QUERIES = [
  "What did I learn about photosynthesis?",
  "What tasks are due this week?",
  "Summarize my meeting notes",
  "What is RuBisCO?",
  "Key points from my economics lecture",
];

// TODO: Replace with real session context from DB — fetch all user sessions for RAG
const MOCK_SESSION_CONTEXT = `
Session: Biology 201 — Photosynthesis
Summary: Covered the light-dependent and light-independent reactions of photosynthesis, including the role of chlorophyll and ATP synthesis in chloroplasts.

Session: Machine Learning — Neural Networks
Summary: Deep dive into backpropagation, gradient descent, and activation functions. Covered ReLU vs sigmoid trade-offs.

Session: Economics Lecture — Supply & Demand
Summary: Explored price elasticity, market equilibrium, and how external shocks shift supply and demand curves in real-world markets.

Session: Project Kickoff Meeting
Summary: Aligned the team on Q3 product goals, assigned ownership for key features, and set sprint cadence.
`;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sources] = useState(["Biology 201 — Photosynthesis", "Machine Learning — Neural Networks"]);

  const handleSearch = async (q: string) => {
    if (!q.trim() || streaming) return;
    setQuery(q);
    setSubmitted(true);
    setAnswer("");
    setStreaming(true);

    try {
      const res = await fetch("/api/ask-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
          transcript: MOCK_SESSION_CONTEXT,
        }),
      });

      if (!res.ok) throw new Error("Search failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setAnswer(full);
      }
    } catch {
      setAnswer("Sorry, something went wrong. Please try again.");
    } finally {
      setStreaming(false);
    }
  };

  const handleSubmit = () => handleSearch(query);

  return (
    <div>
      <TopBar title="Search" />
      <div className="p-8 flex flex-col gap-8" style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Search bar */}
        <div
          className="flex items-center gap-3 rounded-2xl border px-5"
          style={{ background: "#0b0b0b", borderColor: "#1a1a1a", height: 56 }}
        >
          <Search size={16} style={{ color: "#555", flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (submitted) setSubmitted(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Ask Memo anything about your recordings…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-inter)", fontSize: 15, color: "#ccc" }}
            autoFocus
          />
          {query && (
            <button
              onClick={handleSubmit}
              className="flex-shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium text-white transition-colors"
              style={{ background: "#c96acb", fontFamily: "var(--font-inter)", cursor: "pointer", border: "none" }}
            >
              Search
            </button>
          )}
        </div>

        {/* Suggested searches */}
        {!submitted && (
          <div className="flex flex-col gap-4">
            <p style={{ fontFamily: "var(--font-syne)", fontSize: 12, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Suggested
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSearch(q)}
                  className="rounded-full border px-4 py-1.5 text-sm transition-all hover:border-[#c96acb]/50 hover:text-[#c96acb]"
                  style={{ borderColor: "#1a1a1a", color: "#555", background: "transparent", cursor: "pointer", fontFamily: "var(--font-inter)", fontSize: 13 }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Answer */}
        {submitted && (
          <div className="flex flex-col gap-4">
            {/* Result card */}
            <div
              className="rounded-xl border p-6"
              style={{ background: "#0b0b0b", borderColor: "rgba(201,106,203,0.25)", borderLeft: "3px solid #c96acb" }}
            >
              <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#ccc", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {answer || (streaming ? <span style={{ opacity: 0.4 }}>●●●</span> : "")}
              </p>
            </div>

            {/* Sources */}
            {!streaming && answer && (
              <div className="flex flex-col gap-2">
                <p style={{ fontFamily: "var(--font-syne)", fontSize: 11, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Sources
                </p>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border px-3 py-1"
                      style={{ borderColor: "#1a1a1a", color: "#666", fontFamily: "var(--font-inter)", fontSize: 12 }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* New search */}
            <button
              onClick={() => { setSubmitted(false); setQuery(""); setAnswer(""); }}
              style={{ color: "#444", fontFamily: "var(--font-inter)", fontSize: 13, background: "transparent", border: "none", cursor: "pointer", alignSelf: "flex-start" }}
            >
              ← New search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}