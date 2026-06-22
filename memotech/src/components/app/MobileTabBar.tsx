"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Mic, Brain, CheckSquare, Search } from "lucide-react";

const TABS = [
  { label: "Home", href: "/app", icon: LayoutDashboard },
  { label: "Memories", href: "/app/memories", icon: Brain },
  { label: "Record", href: "/app/record", icon: Mic, isPrimary: true },
  { label: "Tasks", href: "/app/tasks", icon: CheckSquare },
  { label: "Search", href: "/app/search", icon: Search },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(8,8,8,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-around" style={{ height: 56 }}>
        {TABS.map(({ label, href, icon: Icon, isPrimary }) => {
          const active = isActive(href);

          if (isPrimary) {
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-center"
                style={{ marginTop: -22 }}
                aria-label={label}
              >
                <div
                  className="flex items-center justify-center rounded-full transition-transform active:scale-95"
                  style={{
                    width: 52,
                    height: 52,
                    background: active
                      ? "linear-gradient(145deg, #d97fdb, #c96acb)"
                      : "linear-gradient(145deg, #c96acb, #b85aba)",
                    boxShadow: "0 4px 16px rgba(201,106,203,0.45), 0 0 0 4px #080808",
                  }}
                >
                  <Icon size={22} color="#0a0a0a" strokeWidth={2.4} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
              aria-label={label}
            >
              <Icon
                size={21}
                strokeWidth={active ? 2.4 : 1.8}
                style={{ color: active ? "#c96acb" : "#5a5a5e" }}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
