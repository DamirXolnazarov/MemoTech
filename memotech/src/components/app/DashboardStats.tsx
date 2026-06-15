import { Brain, CheckSquare, Flame, Clock } from "lucide-react";

// TODO: Replace hardcoded values with real DB queries when database is connected
const stats = [
  {
    label: "Total Memories",
    value: "0",
    icon: Brain,
    color: "#c96acb",
  },
  {
    label: "Tasks Due Today",
    value: "0",
    icon: CheckSquare,
    color: "#f59e0b",
  },
  {
    label: "Study Streak",
    value: "0",
    icon: Flame,
    color: "#f97316",
    suffix: "days",
  },
  {
    label: "Hours Recorded",
    value: "0",
    icon: Clock,
    color: "#3b82f6",
    suffix: "hrs",
  },
];

export default function DashboardStats() {
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
                {value}
                {suffix && (
                  <span
                    className="ml-1 font-normal"
                    style={{ fontSize: 14, color: "#555" }}
                  >
                    {suffix}
                  </span>
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