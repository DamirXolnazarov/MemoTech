"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <div
      className="flex items-center justify-between px-8 border-b"
      style={{
        height: 56,
        background: "rgba(8,8,8,0.9)",
        backdropFilter: "blur(12px)",
        borderColor: "#1a1a1a",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <h1
        className="font-bold text-white"
        style={{ fontFamily: "var(--font-syne)", fontSize: 15 }}
      >
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <button
          className="flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
          style={{ width: 34, height: 34 }}
        >
          <Bell size={16} style={{ color: "#555" }} />
        </button>

        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: 28, height: 28 },
            },
          }}
        />
      </div>
    </div>
  );
}