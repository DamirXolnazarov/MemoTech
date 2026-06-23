"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Mic,
  Brain,
  CheckSquare,
  CreditCard,
  Search,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Record", href: "/app/record", icon: Mic },
  { label: "Memories", href: "/app/memories", icon: Brain },
  { label: "Tasks", href: "/app/tasks", icon: CheckSquare },
  { label: "Flashcards", href: "/app/flashcards", icon: CreditCard },
  { label: "Search", href: "/app/search", icon: Search },
  { label: "Notifications", href: "/app/notifications", icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col border-r z-40"
      style={{ width: 240, background: "#080808", borderColor: "#1a1a1a" }}
    >
      {/* Logo + User */}
      <div className="p-5 border-b" style={{ borderColor: "#1a1a1a" }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#c96acb" }} />
          <span className="font-bold text-white" style={{ fontFamily: "var(--font-syne)", fontSize: 18 }}>
            Memo
          </span>
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded"
            style={{ background: "rgba(201,106,203,0.15)", color: "#c96acb", fontSize: 10 }}
          >
            BETA
          </span>
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <img src={user.imageUrl} alt={user.fullName || "User"} className="w-6 h-6 rounded-full flex-shrink-0" />
            <span className="text-xs truncate" style={{ color: "#a1a1aa", maxWidth: 160 }}>
              {user.fullName || user.emailAddresses[0]?.emailAddress}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 border-l-2 group"
              style={{
                background: active ? "rgba(201,106,203,0.12)" : "transparent",
                borderLeftColor: active ? "#c96acb" : "transparent",
                color: active ? "#c96acb" : "#a1a1aa",
              }}
            >
              <Icon
                size={16}
                style={{ color: active ? "#c96acb" : "#a1a1aa" }}
                className="group-hover:text-white transition-colors flex-shrink-0"
              />
              <span
                className="text-sm font-medium"
                style={{ fontFamily: "var(--font-inter)", color: active ? "#c96acb" : "#a1a1aa" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t space-y-0.5" style={{ borderColor: "#1a1a1a" }}>
        <Link
          href="/app/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group"
          style={{
            color: pathname === "/app/settings" ? "#c96acb" : "#a1a1aa",
            background: pathname === "/app/settings" ? "rgba(201,106,203,0.12)" : "transparent",
          }}
        >
          <Settings size={16} style={{ color: "inherit" }} />
          <span className="text-sm font-medium" style={{ fontFamily: "var(--font-inter)" }}>Settings</span>
        </Link>
        <SignOutButton>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 w-full text-left hover:bg-white/5">
            <LogOut size={16} style={{ color: "#a1a1aa" }} />
            <span className="text-sm font-medium" style={{ color: "#a1a1aa", fontFamily: "var(--font-inter)" }}>
              Sign out
            </span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}