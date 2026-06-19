"use client";

import Link from "next/link";

interface SessionSummary {
  id: string;
  title: string;
  date: string;
  durationSeconds: number;
  tags: string[];
}

interface RecentSessionsProps {
  sessions: SessionSummary[];
  loading: boolean;
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

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  if (weeks === 1) return "1 week ago";
  return `${weeks} weeks ago`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}

export default function RecentSessions({ sessions, loading }: RecentSessionsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-syne)", fontSize: 16 }}>
          Recent Sessions
        </h2>
        <Link
          href="/app/memories"
          style={{ color: "#a1a1aa", fontSize: 13, fontFamily: "var(--font-inter)" }}
          className="hover:text-white transition-colors"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-xl border p-5"
              style={{ background: "#0b0b0b", borderColor: "#1a1a1a", height: 130, opacity: 0.4 }}
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div
          className="rounded-xl border flex flex-col items-center justify-center gap-2 py-12"
          style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
        >
          <p style={{ color: "#555", fontSize: 14, fontFamily: "var(--font-inter)" }}>
            No recordings yet
          </p>
          <p style={{ color: "#333", fontSize: 12, fontFamily: "var(--font-inter)" }}>
            Your sessions will show up here once you record something
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border p-5 flex flex-col gap-3 group"
              style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
            >
              <div className="flex flex-col gap-1">
                <h3
                  className="font-bold text-white leading-snug"
                  style={{ fontFamily: "var(--font-syne)", fontSize: 14 }}
                >
                  {s.title}
                </h3>
                <p style={{ color: "#555", fontSize: 12, fontFamily: "var(--font-inter)" }}>
                  {formatRelativeDate(s.date)} · {formatDuration(s.durationSeconds)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {s.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      background: tagColors[tag],
                      color: tagText[tag],
                      fontFamily: "var(--font-inter)",
                      fontSize: 11,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-end mt-auto pt-1">
                <Link
                  href="/app/memories"
                  className="text-xs border rounded-lg px-3 py-1.5 transition-colors hover:border-[#c96acb] hover:text-[#c96acb]"
                  style={{ borderColor: "#1f1f1f", color: "#555", fontFamily: "var(--font-inter)" }}
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}