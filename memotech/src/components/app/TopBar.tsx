"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";

interface TopBarProps {
  title: string;
  unreadCount?: number;
}

export default function TopBar({ title, unreadCount = 0 }: TopBarProps) {
  const pathname = usePathname();
  const isNotifications = pathname === "/app/notifications";

  return (
    <div
      className="flex items-center justify-between px-5 sm:px-8 border-b"
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
      <div className="flex items-center gap-3">
        <Link
          href="/app/notifications"
          className="relative flex items-center justify-center rounded-xl transition-colors"
          style={{
            width: 34,
            height: 34,
            background: isNotifications ? "rgba(201,106,203,0.12)" : "transparent",
          }}
          aria-label="Notifications"
        >
          <Bell
            size={16}
            strokeWidth={isNotifications ? 2.2 : 1.8}
            style={{ color: isNotifications ? "#c96acb" : "#555" }}
          />
          {unreadCount > 0 && (
            <span
              className="absolute flex items-center justify-center text-white font-bold rounded-full"
              style={{
                top: 4,
                right: 4,
                width: 14,
                height: 14,
                fontSize: 8,
                background: "#c96acb",
                fontFamily: "var(--font-inter)",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <UserButton
          appearance={{
            elements: { avatarBox: { width: 28, height: 28 } },
          }}
        />
      </div>
    </div>
  );
}