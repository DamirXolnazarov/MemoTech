"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import TopBar from "@/components/app/TopBar";
import DashboardStats from "@/components/app/DashboardStats";
import RecentSessions from "@/components/app/RecentSessions";
import Link from "next/link";
import { Mic, Circle } from "lucide-react";

interface SessionSummary {
  id: string;
  title: string;
  date: string;
  durationSeconds: number;
  tags: string[];
}

interface DashboardData {
  stats: {
    totalMemories: number;
    tasksDueToday: number;
    studyStreak: number;
    hoursRecorded: number;
  };
  recentSessions: SessionSummary[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Compute greeting/date only after mount to avoid SSR/CSR clock mismatch
  // (server render time and client render time can land on different hours,
  // causing a hydration error if computed during the render itself)
  const [greeting, setGreeting] = useState<string | null>(null);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(getGreeting());
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard");
        const json: DashboardData = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = data?.stats ?? {
    totalMemories: 0,
    tasksDueToday: 0,
    studyStreak: 0,
    hoursRecorded: 0,
  };
  const recentSessions = data?.recentSessions ?? [];
  const firstName = user?.firstName || "there";

  return (
    <div>
      {/* Desktop top bar */}
      <div className="hidden md:block">
        <TopBar title="Dashboard" />
      </div>

      {/* Mobile greeting header */}
      <div className="md:hidden flex items-center justify-between" style={{ padding: "20px 20px 4px" }}>
        <div>
          <h1
            className="font-bold"
            style={{ fontFamily: "var(--font-syne)", fontSize: 26, color: "#fff", lineHeight: 1.15 }}
          >
            {greeting ? `${greeting}, ${firstName}` : `Hi, ${firstName}`}
          </h1>
          <p style={{ color: "#71717a", fontSize: 14, fontFamily: "var(--font-inter)", marginTop: 2 }}>
            {today ?? ""}
          </p>
        </div>
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0 overflow-hidden"
          style={{ width: 40, height: 40, border: "1.5px solid rgba(201,106,203,0.4)" }}
        >
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={firstName} className="w-full h-full object-cover" />
          ) : (
            <Circle size={18} style={{ color: "#c96acb" }} />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 md:gap-8" style={{ padding: "20px" }}>
        <DashboardStats {...stats} loading={loading} />

        {/* Start Recording — mobile pill */}
        <Link
          href="/app/record"
          className="md:hidden flex items-center gap-3 rounded-full transition-transform active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #d97fdb, #c96acb)",
            padding: "16px 24px",
            boxShadow: "0 4px 20px rgba(201,106,203,0.3)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 28, height: 28, background: "rgba(0,0,0,0.15)" }}
          >
            <Circle size={12} fill="#0a0a0a" color="#0a0a0a" />
          </div>
          <span style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 16, color: "#0a0a0a" }}>
            Start recording
          </span>
        </Link>

        {/* Desktop card */}
        <div
          className="hidden md:flex rounded-xl border p-8 flex-col items-center gap-4 text-center"
          style={{
            background: "#0b0b0b",
            borderColor: "#1a1a1a",
            boxShadow: "0 0 0 1px rgba(201,106,203,0.15), inset 0 0 40px rgba(201,106,203,0.03)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 64, height: 64, background: "rgba(201,106,203,0.1)", border: "1px solid rgba(201,106,203,0.2)" }}
          >
            <Mic size={28} style={{ color: "#c96acb" }} />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1" style={{ fontFamily: "var(--font-syne)", fontSize: 18 }}>
              Ready to record?
            </h3>
            <p style={{ color: "#a1a1aa", fontSize: 14, fontFamily: "var(--font-inter)" }}>
              Capture your next lecture or meeting
            </p>
          </div>
          <Link
            href="/app/record"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#b85aba]"
            style={{ background: "#c96acb", fontFamily: "var(--font-inter)", fontSize: 14 }}
          >
            Start Recording →
          </Link>
        </div>

        <RecentSessions sessions={recentSessions} loading={loading} />
      </div>
    </div>
  );
}