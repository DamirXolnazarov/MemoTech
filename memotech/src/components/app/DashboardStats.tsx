"use client";

import { Brain, CheckSquare, Flame, Clock } from "lucide-react";

interface DashboardStatsProps {
  totalMemories: number;
  tasksDueToday: number;
  studyStreak: number;
  hoursRecorded: number;
  loading: boolean;
}

export default function DashboardStats({
  totalMemories,
  tasksDueToday,
  studyStreak,
  hoursRecorded,
  loading,
}: DashboardStatsProps) {
  const stats = [
    { label: "Memories", value: totalMemories, icon: Brain, color: "#c96acb" },
    { label: "Hours Recorded", value: hoursRecorded, icon: Clock, color: "#60a5fa", suffix: "h" },
    { label: "Tasks due", value: tasksDueToday, icon: CheckSquare, color: "#c96acb" },
    { label: "Streak", value: studyStreak, icon: Flame, color: "#34d399", suffix: studyStreak === 1 ? "day" : "days", highlight: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {stats.map(({ label, value, icon: Icon, color, suffix, highlight }) => (
        <div
          key={label}
          className="rounded-2xl border flex flex-col justify-between"
          style={{
            background: "#0e0a10",
            borderColor: "#1c1620",
            padding: "18px 16px",
            minHeight: 104,
          }}
        >
          <div className="flex items-start justify-between mb-2 md:hidden">
            {/* mobile: icon hidden per mockup, numbers do the talking */}
          </div>
          <div className="hidden md:flex items-start justify-between mb-3">
            <Icon size={20} style={{ color }} />
          </div>

          {loading ? (
            <div
              style={{ width: 56, height: 30, borderRadius: 8, background: "#1c1620" }}
              className="animate-pulse"
            />
          ) : (
            <p
              className="font-bold leading-none"
              style={{
                fontFamily: "var(--font-syne)",
                fontSize: 30,
                color: highlight ? "#34d399" : "#fff",
              }}
            >
              {value}
              {suffix && (
                <span style={{ fontSize: 16, fontWeight: 700, marginLeft: 3 }}>{suffix}</span>
              )}
            </p>
          )}

          <p
            className="mt-1"
            style={{ color: "#71717a", fontSize: 13, fontFamily: "var(--font-inter)" }}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}