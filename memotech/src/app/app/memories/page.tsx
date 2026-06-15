"use client";

import { useState } from "react";
import TopBar from "@/components/app/TopBar";
import { Search } from "lucide-react";

// TODO: Replace with real DB fetch — query sessions by userId ordered by createdAt desc
const ALL_SESSIONS = [
  { id: "1", title: "Biology 201 — Photosynthesis", date: "Jun 12, 2025", duration: "47 min", summary: "Covered the light-dependent and light-independent reactions of photosynthesis, including the role of chlorophyll and ATP synthesis in chloroplasts.", tags: ["Summary", "Tasks", "Flashcards"] },
  { id: "2", title: "Project Kickoff Meeting", date: "Jun 10, 2025", duration: "31 min", summary: "Aligned the team on Q3 product goals, assigned ownership for key features, and set sprint cadence for the next six weeks.", tags: ["Summary", "Tasks"] },
  { id: "3", title: "Economics Lecture — Supply & Demand", date: "Jun 8, 2025", duration: "52 min", summary: "Explored price elasticity, market equilibrium, and how external shocks shift supply and demand curves in real-world markets.", tags: ["Summary", "Flashcards"] },
  { id: "4", title: "Research Interview — User Study #3", date: "Jun 7, 2025", duration: "28 min", summary: "User expressed pain points around note retrieval and search. Highlighted the need for cross-session memory and tagging.", tags: ["Summary", "Tasks"] },
  { id: "5", title: "Machine Learning — Neural Networks", date: "Jun 5, 2025", duration: "61 min", summary: "Deep dive into backpropagation, gradient descent, and activation functions. Covered ReLU vs sigmoid trade-offs.", tags: ["Summary", "Flashcards"] },
  { id: "6", title: "1:1 with Manager", date: "Jun 3, 2025", duration: "22 min", summary: "Discussed performance goals for H2, flagged blockers on the infrastructure team dependency, agreed on weekly async updates.", tags: ["Summary", "Tasks"] },
  { id: "7", title: "Chemistry Lab Debrief", date: "Jun 1, 2025", duration: "38 min", summary: "Post-lab discussion on titration experiment results, sources of error, and how to interpret the pH curve data for the report.", tags: ["Summary", "Flashcards"] },
  { id: "8", title: "Product Strategy — Q4 Planning", date: "May 29, 2025", duration: "74 min", summary: "Reviewed roadmap priorities, debated build vs buy for the analytics layer, and aligned on the key bets for the next quarter.", tags: ["Summary", "Tasks", "Flashcards"] },
];

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

export default function MemoriesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = ALL_SESSIONS.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.summary.toLowerCase().includes(query.toLowerCase())
  );

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
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-inter)", fontSize: 14, color: "#ccc" }}
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

        {/* Grid */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {filtered.map((s) => (
            <div
              key={s.id}
              className="group rounded-xl border p-5 flex flex-col gap-3 relative overflow-hidden cursor-pointer transition-all hover:border-[#2a2a2a]"
              style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
            >
              {/* Hover overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-xl"
                style={{ background: "rgba(5,5,5,0.85)" }}
              >
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#c96acb" }}>Open Session →</span>
              </div>

              <div>
                <h3 className="font-bold text-white mb-1 leading-snug" style={{ fontFamily: "var(--font-syne)", fontSize: 14 }}>
                  {s.title}
                </h3>
                <p style={{ color: "#555", fontSize: 12, fontFamily: "var(--font-inter)" }}>
                  {s.date} · {s.duration}
                </p>
              </div>

              <p style={{ color: "#666", fontSize: 13, fontFamily: "var(--font-inter)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {s.summary}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto pt-1">
                {s.tags.map((tag) => (
                  <span key={tag} className="rounded-full px-2.5 py-0.5" style={{ background: tagColors[tag], color: tagText[tag], fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 500 }}>
                    {tag} ✓
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: "#333", fontFamily: "var(--font-inter)", fontSize: 14 }}>No memories match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}