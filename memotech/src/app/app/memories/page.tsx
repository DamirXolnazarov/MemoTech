"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import { Search } from "lucide-react";

interface SessionItem {
  id: string;
  title: string;
  createdAt: string;
  duration: number;
  shortSummary: string;
  hasTasks: boolean;
  hasFlashcards: boolean;
}

const tagColors: Record<string, string> = {
  Summary: "rgba(201,106,203,0.12)",
  Tasks: "rgba(245,158,11,0.12)",
  Flashcards: "rgba(59,130,246,0.12)",
};
const tagText: Record<string, string> = {
  Summary: "#c96acb",
  Tasks: "#f59e0b",
  Flashcards: "#60a5fa",
};

const FILTERS = ["All", "This Week", "This Month"];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

export default function MemoriesPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;

    async function fetchSessions() {
      try {
        const res = await fetch("/api/sessions");
        if (!res.ok) throw new Error("Failed to fetch sessions");
        const json = await res.json();
        if (!cancelled) {
          const mapped: SessionItem[] = (json.sessions ?? []).map(
            (s: {
              id: string;
              title: string;
              createdAt: string;
              duration: number;
              shortSummary: string;
              tasks: unknown[];
              flashcards: unknown[];
            }) => ({
              id: s.id,
              title: s.title,
              createdAt: s.createdAt,
              duration: s.duration,
              shortSummary: s.shortSummary,
              hasTasks: s.tasks.length > 0,
              hasFlashcards: s.flashcards.length > 0,
            })
          );
          setSessions(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSessions();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();
  const filtered = sessions.filter((s) => {
    const matchesQuery =
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.shortSummary.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;

    if (filter === "All") return true;
    const created = new Date(s.createdAt);
    const diffDays = (now.getTime() - created.getTime()) / 86400000;
    if (filter === "This Week") return diffDays <= 7;
    if (filter === "This Month") return diffDays <= 30;
    return true;
  });

  return (
    <div>
      <TopBar title="Memories" />
      <div className="p-8 flex flex-col gap-6">
        {/* Search + filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div
            className="flex items-center gap-3 flex-1 rounded-xl border px-4"
            style={{ background: "#0b0b0b", borderColor: "#1a1a1a", minWidth: 240, height: 42 }}
          >
            <Search size={14} style={{ color: "#555", flexShrink: 0 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search memories…"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontFamily: "var(--font-inter)", fontSize: 14, color: "#ccc",
              }}
            />
          </div>

          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-sm transition-all"
                style={{
                  fontFamily: "var(--font-inter)", fontSize: 13,
                  background: filter === f ? "rgba(201,106,203,0.12)" : "transparent",
                  border: `1px solid ${filter === f ? "rgba(201,106,203,0.3)" : "#1a1a1a"}`,
                  color: filter === f ? "#c96acb" : "#555",
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border"
                style={{ background: "#0b0b0b", borderColor: "#1a1a1a", height: 160, opacity: 0.4 }}
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div
            className="rounded-xl border flex flex-col items-center justify-center gap-3 py-20"
            style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
          >
            <p style={{ color: "#666", fontSize: 16, fontFamily: "var(--font-syne)", fontWeight: 600 }}>
              No memories yet
            </p>
            <p style={{ color: "#444", fontSize: 13, fontFamily: "var(--font-inter)", maxWidth: 320, textAlign: "center" }}>
              Record your first lecture or meeting and it&apos;ll show up here automatically.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: "#333", fontFamily: "var(--font-inter)", fontSize: 14 }}>
              No memories match your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {filtered.map((s) => (
              <div
                key={s.id}
                className="group rounded-xl border p-5 flex flex-col gap-3 relative overflow-hidden cursor-pointer transition-all hover:border-[#2a2a2a]"
                style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-xl"
                  style={{ background: "rgba(5,5,5,0.85)" }}
                >
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#c96acb" }}>
                    Open Session →
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white mb-1 leading-snug" style={{ fontFamily: "var(--font-syne)", fontSize: 14 }}>
                    {s.title}
                  </h3>
                  <p style={{ color: "#555", fontSize: 12, fontFamily: "var(--font-inter)" }}>
                    {formatDate(s.createdAt)} · {formatDuration(s.duration)}
                  </p>
                </div>

                <p
                  style={{
                    color: "#666", fontSize: 13, fontFamily: "var(--font-inter)", lineHeight: 1.6,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}
                >
                  {s.shortSummary}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto pt-1">
                  <span
                    className="rounded-full px-2.5 py-0.5"
                    style={{ background: tagColors.Summary, color: tagText.Summary, fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 500 }}
                  >
                    Summary ✓
                  </span>
                  {s.hasTasks && (
                    <span
                      className="rounded-full px-2.5 py-0.5"
                      style={{ background: tagColors.Tasks, color: tagText.Tasks, fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 500 }}
                    >
                      Tasks ✓
                    </span>
                  )}
                  {s.hasFlashcards && (
                    <span
                      className="rounded-full px-2.5 py-0.5"
                      style={{ background: tagColors.Flashcards, color: tagText.Flashcards, fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 500 }}
                    >
                      Flashcards ✓
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}