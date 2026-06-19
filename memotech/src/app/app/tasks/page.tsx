"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import { Calendar } from "lucide-react";

interface TaskItem {
  id: string;
  text: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string | null;
  done: boolean;
  session: { title: string };
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  High: { bg: "rgba(239,68,68,0.1)", text: "#f87171" },
  Medium: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  Low: { bg: "rgba(34,197,94,0.1)", text: "#4ade80" },
};

const FILTERS = ["All", "Today", "This Week", "Overdue"];

function buildGoogleCalendarUrl(task: string, dueDate?: string | null): string {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const title = encodeURIComponent(task);
  let dates = "";
  if (dueDate) {
    try {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => String(n).padStart(2, "0");
        const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
        dates = `&dates=${dateStr}/${dateStr}`;
      }
    } catch { /* skip */ }
  }
  return `${base}&text=${title}${dates}&details=${encodeURIComponent("Added from Memo")}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;

    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const json = await res.json();
        if (!cancelled) setTasks(json.tasks ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTasks();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async (id: string, currentDone: boolean) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !currentDone } : t)));

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, done: !currentDone }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch (err) {
      console.error(err);
      // Revert on failure
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: currentDone } : t)));
    }
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 86400000 - 1);
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 86400000);

  const filteredTasks = tasks.filter((t) => {
    if (filter === "All") return true;
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);

    if (filter === "Today") return due >= startOfToday && due <= endOfToday;
    if (filter === "This Week") return due >= startOfToday && due <= endOfWeek;
    if (filter === "Overdue") return due < startOfToday && !t.done;
    return true;
  });

  return (
    <div>
      <TopBar title="Tasks" />
      <div className="p-8 flex flex-col gap-6">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full transition-all"
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

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border"
                style={{ background: "#0b0b0b", borderColor: "#1a1a1a", height: 64, opacity: 0.4 }}
              />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div
            className="rounded-xl border flex flex-col items-center justify-center gap-3 py-20"
            style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
          >
            <p style={{ color: "#666", fontSize: 16, fontFamily: "var(--font-syne)", fontWeight: 600 }}>
              No tasks yet
            </p>
            <p style={{ color: "#444", fontSize: 13, fontFamily: "var(--font-inter)", maxWidth: 320, textAlign: "center" }}>
              Tasks extracted from your recordings will show up here automatically.
            </p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: "#333", fontFamily: "var(--font-inter)", fontSize: 14 }}>
              No tasks match this filter.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredTasks.map((task) => {
              const isDone = task.done;
              const colors = priorityColors[task.priority];
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-4 rounded-xl border px-5 py-4 transition-all"
                  style={{ background: "#0b0b0b", borderColor: "#1a1a1a", opacity: isDone ? 0.45 : 1 }}
                >
                  <button
                    onClick={() => toggle(task.id, task.done)}
                    style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      border: `1.5px solid ${isDone ? "#c96acb" : "#333"}`,
                      background: isDone ? "rgba(201,106,203,0.15)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", transition: "all 0.2s ease",
                    }}
                  >
                    {isDone && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#c96acb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p style={{
                      fontFamily: "var(--font-inter)", fontSize: 14,
                      color: isDone ? "#444" : "#ccc",
                      textDecoration: isDone ? "line-through" : "none",
                      lineHeight: 1.4, marginBottom: 3,
                    }}>
                      {task.text}
                    </p>
                    <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#444" }}>
                      {task.session.title}
                    </p>
                  </div>

                  <span style={{
                    fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600,
                    background: colors.bg, color: colors.text,
                    padding: "2px 10px", borderRadius: 20, flexShrink: 0,
                  }}>
                    {task.priority}
                  </span>

                  {task.dueDate && (
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#444", flexShrink: 0, minWidth: 80, textAlign: "right" }}>
                      {formatDate(task.dueDate)}
                    </span>
                  )}

                  <a
                    href={buildGoogleCalendarUrl(task.text, task.dueDate)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all"
                    style={{
                      border: "1px solid #1f1f1f", color: "#555",
                      background: "transparent", flexShrink: 0,
                      fontFamily: "var(--font-inter)", fontSize: 11,
                      textDecoration: "none", whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#4285f4";
                      e.currentTarget.style.color = "#4285f4";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#1f1f1f";
                      e.currentTarget.style.color = "#555";
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 4 3 4.9 3 6v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                    </svg>
                    Add to Calendar
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}