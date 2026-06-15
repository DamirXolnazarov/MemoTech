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
                background: "#0b0b0b",
                border: "1px solid #1a1a1a",
                borderRadius: 10,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                opacity: isDone ? 0.5 : 1,
                transition: "opacity 0.2s ease",
              }}
            >
              <button
                onClick={() => toggle(i)}
                style={{
                  width: 20, height: 20, borderRadius: 5,
                  border: `1.5px solid ${isDone ? "#c96acb" : "#333"}`,
                  background: isDone ? "rgba(201,106,203,0.15)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, cursor: "pointer", transition: "all 0.2s ease",
                }}
              >
                {isDone && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#c96acb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

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

              <span style={{
                fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600,
                background: colors.bg, color: colors.text,
                padding: "3px 10px", borderRadius: 20, flexShrink: 0, letterSpacing: "0.04em",
              }}>
                {task.priority}
              </span>

              <button style={{
                fontFamily: "var(--font-inter)", fontSize: 11, color: "#444",
                background: "transparent", border: "1px solid #1f1f1f",
                borderRadius: 6, padding: "3px 10px", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
              }}>
                Add to calendar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}