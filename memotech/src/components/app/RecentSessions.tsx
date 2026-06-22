"use client";

import Link from "next/link";
import { AudioLines } from "lucide-react";

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

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  const weeks = Math.floor(diffDays / 7);
  if (weeks === 1) return "1 week ago";
  return `${weeks} weeks ago`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

export default function RecentSessions({ sessions, loading }: RecentSessionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2
          className="font-bold"
          style={{ fontFamily: "var(--font-syne)", fontSize: 17, color: "#fff" }}
        >
          Recent memories
        </h2>
        <Link
          href="/app/memories"
          style={{ color: "#c96acb", fontSize: 13, fontFamily: "var(--font-inter)", fontWeight: 500 }}
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl animate-pulse"
              style={{ background: "#0e0a10", height: 72 }}
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div
          className="rounded-2xl border flex flex-col items-center justify-center gap-2 text-center"
          style={{ background: "#0e0a10", borderColor: "#1c1620", padding: "40px 24px" }}
        >
          <AudioLines size={28} style={{ color: "#3a2f3f" }} strokeWidth={1.5} />
          <p style={{ color: "#888", fontSize: 14, fontFamily: "var(--font-inter)", fontWeight: 500 }}>
            No memories yet
          </p>
          <p style={{ color: "#52525b", fontSize: 12, fontFamily: "var(--font-inter)" }}>
            Record your first session to get started
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href="/app/memories"
              className="rounded-2xl border flex items-center gap-3 transition-colors active:scale-[0.98]"
              style={{
                background: "#0e0a10",
                borderColor: "#1c1620",
                padding: "14px 16px",
                transition: "transform 0.15s ease",
              }}
            >
              <div
                className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: 44, height: 44, background: "rgba(201,106,203,0.1)" }}
              >
                <AudioLines size={18} style={{ color: "#c96acb" }} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold truncate"
                  style={{ fontFamily: "var(--font-syne)", fontSize: 15, color: "#fff" }}
                >
                  {s.title}
                </p>
                <p style={{ color: "#71717a", fontSize: 13, fontFamily: "var(--font-inter)" }}>
                  {formatDuration(s.durationSeconds)} · {formatRelativeDate(s.date)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}