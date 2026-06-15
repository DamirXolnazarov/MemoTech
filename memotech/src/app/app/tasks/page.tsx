"use client";

import { useState } from "react";
import TopBar from "@/components/app/TopBar";
import { Calendar } from "lucide-react";

// TODO: Replace with real DB fetch — aggregate tasks from all sessions by userId
const ALL_TASKS = [
  { id: 1, text: "Submit lab report on photosynthesis experiment", priority: "High" as const, dueDate: "Jun 14, 2025", session: "Biology 201 — Photosynthesis" },
  { id: 2, text: "Review slides on light-dependent reactions before next lecture", priority: "Medium" as const, dueDate: "Jun 15, 2025", session: "Biology 201 — Photosynthesis" },
  { id: 3, text: "Set up weekly async update format with manager", priority: "High" as const, dueDate: "Jun 14, 2025", session: "1:1 with Manager" },
  { id: 4, text: "Draft Q4 roadmap doc and share with product team", priority: "High" as const, dueDate: "Jun 16, 2025", session: "Product Strategy — Q4 Planning" },
  { id: 5, text: "Follow up with infrastructure team on blocker status", priority: "Medium" as const, dueDate: "Jun 17, 2025", session: "1:1 with Manager" },
  { id: 6, text: "Write up experiment error analysis for chemistry report", priority: "High" as const, dueDate: "Jun 13, 2025", session: "Chemistry Lab Debrief" },
  { id: 7, text: "Assign sprint owners for Q3 feature work", priority: "Medium" as const, dueDate: "Jun 18, 2025", session: "Project Kickoff Meeting" },
  { id: 8, text: "Complete neural network implementation exercise", priority: "Low" as const, dueDate: "Jun 20, 2025", session: "Machine Learning — Neural Networks" },
  { id: 9, text: "Synthesize user study findings into insight doc", priority: "High" as const, dueDate: "Jun 15, 2025", session: "Research Interview — User Study #3" },
  { id: 10, text: "Review supply and demand problem sets", priority: "Low" as const, dueDate: "Jun 21, 2025", session: "Economics Lecture — Supply & Demand" },
];

const priorityColors: Record<string, { bg: string; text: string }> = {
  High: { bg: "rgba(239,68,68,0.1)", text: "#f87171" },
  Medium: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  Low: { bg: "rgba(34,197,94,0.1)", text: "#4ade80" },
};

const FILTERS = ["All", "Today", "This Week", "Overdue"];

export default function TasksPage() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState("All");

  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const tasks = ALL_TASKS;

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

        {/* Task list */}
        <div className="flex flex-col gap-2">
          {tasks.map((task) => {
            const isDone = checked.has(task.id);
            const colors = priorityColors[task.priority];
            return (
              <div
                key={task.id}
                className="flex items-center gap-4 rounded-xl border px-5 py-4 transition-all"
                style={{
                  background: "#0b0b0b",
                  borderColor: "#1a1a1a",
                  opacity: isDone ? 0.45 : 1,
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggle(task.id)}
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

                {/* Task info */}
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
                    {task.session}
                  </p>
                </div>

                {/* Priority */}
                <span style={{
                  fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 600,
                  background: colors.bg, color: colors.text,
                  padding: "2px 10px", borderRadius: 20, flexShrink: 0,
                }}>
                  {task.priority}
                </span>

                {/* Due date */}
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#444", flexShrink: 0, minWidth: 80, textAlign: "right" }}>
                  {task.dueDate}
                </span>

                {/* Calendar button */}
                <button
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors hover:border-[#c96acb]/50 hover:text-[#c96acb]"
                  style={{ border: "1px solid #1f1f1f", color: "#444", background: "transparent", cursor: "pointer", flexShrink: 0 }}
                >
                  <Calendar size={12} />
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, whiteSpace: "nowrap" }}>Add</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}