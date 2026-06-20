"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import { Search } from "lucide-react";

const SUGGESTED_QUERIES = [
  "What did I learn this week?",
  "What tasks are due soon?",
  "Summarize my most recent recording",
  "What topics have I covered the most?",
];

interface SessionLite {
  id: string;
  title: string;
  shortSummary: string;
  detailedSummary: string;
  keyConcepts: string[];
  createdAt: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [sources, setSources] = useState<string[]>([]);

  const [sessions, setSessions] = useState<SessionLite[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSessions() {
      try {
        const res = await fetch("/api/sessions");
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const json = await res.json();
        if (!cancelled) {
          const mapped: SessionLite[] = (json.sessions ?? []).map(
            (s: {
              id: string;
              title: string;
              shortSummary: string;
              detailedSummary: string;
              keyConcepts: string[];
              createdAt: string;
            }) => ({
              id: s.id,
              title: s.title,
              shortSummary: s.shortSummary,
              detailedSummary: s.detailedSummary,
              keyConcepts: s.keyConcepts,
              createdAt: s.createdAt,
            })
          );
          setSessions(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    }

    fetchSessions();
    return () => {
      cancelled = true;
    };
  }, []);

  const buildContext = (): string => {
    if (sessions.length === 0) return "";
    return sessions
      .map(
        (s) =>
          `Session: ${s.title}\nDate: ${new Date(s.createdAt).toLocaleDateString()}\nSummary: ${s.shortSummary}\nDetails: ${s.detailedSummary}\nKey concepts: ${s.keyConcepts.join(", ")}`
      )
      .join("\n\n");
  };

  const handleSearch = async (q: string) => {
    if (!q.trim() || streaming) return;
    setQuery(q);
    setSubmitted(true);
    setAnswer("");
    setStreaming(true);

    const context = buildContext();

    if (!context) {
      setAnswer(
        "You haven't recorded any sessions yet, so there's nothing for me to search through. Record your first session and come back!"
      );
      setStreaming(false);
      setSources([]);
      return;
    }

    try {
      const res = await fetch("/api/ask-memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
          transcript: context,
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

      // Simple relevance heuristic: sessions whose title or concepts appear
      // referenced in the answer, falling back to most recent sessions
      const lowerAnswer = full.toLowerCase();
      const relevant = sessions.filter(
        (s) =>
          lowerAnswer.includes(s.title.toLowerCase()) ||
          s.keyConcepts.some((c) => lowerAnswer.includes(c.toLowerCase()))
      );
      setSources(
        (relevant.length > 0 ? relevant : sessions.slice(0, 3)).map((s) => s.title)
      );
    } catch {
      setAnswer("Sorry, something went wrong. Please try again.");
      setSources([]);
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
            placeholder={
              sessionsLoading
                ? "Loading your recordings..."
                : sessions.length === 0
                ? "Record a session first to search your recordings..."
                : "Ask Memo anything about your recordings…"
            }
            disabled={sessionsLoading}
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
        {!submitted && sessions.length > 0 && (
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

        {/* Empty state — no sessions at all */}
        {!submitted && !sessionsLoading && sessions.length === 0 && (
          <div
            className="rounded-xl border flex flex-col items-center justify-center gap-3 py-20"
            style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
          >
            <p style={{ color: "#666", fontSize: 16, fontFamily: "var(--font-syne)", fontWeight: 600 }}>
              Nothing to search yet
            </p>
            <p style={{ color: "#444", fontSize: 13, fontFamily: "var(--font-inter)", maxWidth: 320, textAlign: "center" }}>
              Once you record a session, you can ask Memo questions about it here.
            </p>
          </div>
        )}

        {/* Answer */}
        {submitted && (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-xl border p-6"
              style={{ background: "#0b0b0b", borderColor: "rgba(201,106,203,0.25)", borderLeft: "3px solid #c96acb" }}
            >
              <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#ccc", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {answer || (streaming ? <span style={{ opacity: 0.4 }}>●●●</span> : "")}
              </p>
            </div>

            {!streaming && answer && sources.length > 0 && (
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

            <button
              onClick={() => { setSubmitted(false); setQuery(""); setAnswer(""); setSources([]); }}
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