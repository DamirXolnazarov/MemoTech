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
    { label: "Total Memories", value: totalMemories, icon: Brain, color: "#c96acb" },
    { label: "Tasks Due Today", value: tasksDueToday, icon: CheckSquare, color: "#f59e0b" },
    { label: "Study Streak", value: studyStreak, icon: Flame, color: "#f97316", suffix: "days" },
    { label: "Hours Recorded", value: hoursRecorded, icon: Clock, color: "#3b82f6", suffix: "hrs" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map(({ label, value, icon: Icon, color, suffix }) => (
        <div
          key={label}
          className="rounded-xl border p-5 flex flex-col gap-4"
          style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p
                className="font-bold text-white"
                style={{ fontFamily: "var(--font-syne)", fontSize: 32, lineHeight: 1 }}
              >
                {loading ? (
                  <span style={{ opacity: 0.3 }}>—</span>
                ) : (
                  <>
                    {value}
                    {suffix && (
                      <span className="ml-1 font-normal" style={{ fontSize: 14, color: "#555" }}>
                        {suffix}
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
            <Icon size={22} style={{ color }} />
          </div>
          <p style={{ color: "#a1a1aa", fontSize: 13, fontFamily: "var(--font-inter)" }}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}