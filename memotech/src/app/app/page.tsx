import TopBar from "@/components/app/TopBar";
import DashboardStats from "@/components/app/DashboardStats";
import RecentSessions from "@/components/app/RecentSessions";
import Link from "next/link";
import { Mic } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <TopBar title="Dashboard" />

      <div className="p-8 flex flex-col gap-8">
        <DashboardStats />
        <RecentSessions />

        {/* Start Recording banner */}
        <div
          className="rounded-xl border p-8 flex flex-col items-center gap-4 text-center"
          style={{
            background: "#0b0b0b",
            borderColor: "#1a1a1a",
            boxShadow: "0 0 0 1px rgba(201,106,203,0.15), inset 0 0 40px rgba(201,106,203,0.03)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 64,
              height: 64,
              background: "rgba(201,106,203,0.1)",
              border: "1px solid rgba(201,106,203,0.2)",
            }}
          >
            <Mic size={28} style={{ color: "#c96acb" }} />
          </div>
          <div>
            <h3
              className="font-bold text-white mb-1"
              style={{ fontFamily: "var(--font-syne)", fontSize: 18 }}
            >
              Ready to record?
            </h3>
            <p style={{ color: "#a1a1aa", fontSize: 14, fontFamily: "var(--font-inter)" }}>
              Capture your next lecture or meeting
            </p>
          </div>
          <Link
            href="/app/record"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#b85aba]"
            style={{
              background: "#c96acb",
              fontFamily: "var(--font-inter)",
              fontSize: 14,
            }}
          >
            Start Recording →
          </Link>
        </div>
      </div>
    </div>
  );
}