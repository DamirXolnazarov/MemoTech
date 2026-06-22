"use client";

import { useState } from "react";

interface Task {
  text: string;
  priority: "High" | "Medium" | "Low";
  dueDate?: string;
}

interface TasksTabProps {
  tasks: Task[];
}

const priorityColors: Record<string, string> = {
  High: "#f87171",
  Medium: "#fbbf24",
  Low: "#34d399",
};

function buildGoogleCalendarUrl(task: string, dueDate?: string): string {
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

export default function TasksTab({ tasks }: TasksTabProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight: 200 }}>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#52525b" }}>
          No tasks were extracted from this recording.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 md:gap-6">
      <h2
        className="md:block hidden"
        style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 600, color: "#f0f0f0" }}
      >
        Action items
      </h2>
      <h2
        className="md:hidden"
        style={{ fontFamily: "var(--font-syne)", fontSize: 17, fontWeight: 700, color: "#fff" }}
      >
        Action items
      </h2>

      <div className="flex flex-col gap-2.5">
        {tasks.map((task, i) => {
          const isDone = checked.has(i);
          return (
            <div
              key={i}
              className="rounded-2xl md:rounded-[10px] border flex items-center gap-3.5 transition-opacity duration-200"
              style={{
                background: "#0e0a10",
                borderColor: "#1c1620",
                padding: "16px 18px",
                opacity: isDone ? 0.5 : 1,
              }}
            >
              <button
                onClick={() => toggle(i)}
                className="flex-shrink-0 flex items-center justify-center transition-colors"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  border: `1.5px solid ${isDone ? "#c96acb" : "#3a2f3f"}`,
                  background: isDone ? "#c96acb" : "transparent",
                }}
              >
                {isDone && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 15,
                    color: isDone ? "#52525b" : "#e4e4e7",
                    textDecoration: isDone ? "line-through" : "none",
                    lineHeight: 1.4,
                  }}
                >
                  {task.text}
                </p>
              </div>

              {task.dueDate && (
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: priorityColors[task.priority],
                    flexShrink: 0,
                  }}
                >
                  {task.dueDate}
                </span>
              )}

              <a
                href={buildGoogleCalendarUrl(task.text, task.dueDate)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center flex-shrink-0"
                style={{
                  fontFamily: "var(--font-inter)", fontSize: 11, color: "#888",
                  border: "1px solid #1f1f1f", borderRadius: 6, padding: "3px 10px",
                  whiteSpace: "nowrap", textDecoration: "none",
                }}
              >
                Add to Calendar
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}