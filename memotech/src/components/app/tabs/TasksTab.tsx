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

const priorityColors: Record<string, { bg: string; text: string }> = {
  High: { bg: "rgba(239,68,68,0.1)", text: "#f87171" },
  Medium: { bg: "rgba(234,179,8,0.1)", text: "#facc15" },
  Low: { bg: "rgba(34,197,94,0.1)", text: "#4ade80" },
};

function buildGoogleCalendarUrl(task: string, dueDate?: string): string {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const title = encodeURIComponent(task);

  // Parse due date into YYYYMMDD format for Google Calendar
  let dates = "";
  if (dueDate) {
    try {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => String(n).padStart(2, "0");
        const y = d.getFullYear();
        const m = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const dateStr = `${y}${m}${day}`;
        dates = `&dates=${dateStr}/${dateStr}`;
      }
    } catch { /* skip date */ }
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
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#444" }}>
          No tasks were extracted from this recording.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 600, color: "#f0f0f0" }}>
        Action Items
      </h2>
      <div className="flex flex-col gap-3">
        {tasks.map((task, i) => {
          const colors = priorityColors[task.priority];
          const isDone = checked.has(i);
          return (
            <div
              key={i}
              style={{
                background: "#0b0b0b", border: "1px solid #1a1a1a",
                borderRadius: 10, padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 14,
                opacity: isDone ? 0.5 : 1, transition: "opacity 0.2s ease",
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggle(i)}
                style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  border: `1.5px solid ${isDone ? "#c96acb" : "#333"}`,
                  background: isDone ? "rgba(201,106,203,0.15)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
              >
                {isDone && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#c96acb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Task text */}
              <div className="flex-1 min-w-0">
                <p style={{
                  fontFamily: "var(--font-inter)", fontSize: 14,
                  color: isDone ? "#444" : "#ccc",
                  textDecoration: isDone ? "line-through" : "none",
                  lineHeight: 1.5, margin: 0,
                }}>
                  {task.text}
                </p>
                {task.dueDate && (
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#555", margin: "4px 0 0" }}>
                    Due: {task.dueDate}
                  </p>
                )}
              </div>

              {/* Priority badge */}
              <span style={{
                fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600,
                background: colors.bg, color: colors.text,
                padding: "3px 10px", borderRadius: 20, flexShrink: 0, letterSpacing: "0.04em",
              }}>
                {task.priority}
              </span>

              {/* Google Calendar button */}
              <a
                href={buildGoogleCalendarUrl(task.text, task.dueDate)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-inter)", fontSize: 11,
                  color: "#888", background: "transparent",
                  border: "1px solid #1f1f1f", borderRadius: 6,
                  padding: "3px 10px", cursor: "pointer", flexShrink: 0,
                  whiteSpace: "nowrap", textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 5,
                  transition: "border-color 0.2s ease, color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#4285f4";
                  e.currentTarget.style.color = "#4285f4";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1f1f1f";
                  e.currentTarget.style.color = "#888";
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 4 3 4.9 3 6v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
                Add to Calendar
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}