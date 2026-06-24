"use client";

import { useEffect, useState, useCallback } from "react";
import TopBar from "@/components/app/TopBar";
import {
  Bell, CheckCheck, Mic, CheckSquare, Zap,
  Gift, Info, Handshake, ChevronDown, Trash2, ExternalLink,
} from "lucide-react";

const ORCHID = "#c96acb";

type NotifType = "welcome" | "recording" | "task" | "system" | "pro" | "partnership" | "digest";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const ICON_MAP: Record<NotifType, React.ReactNode> = {
  welcome:     <Bell size={16} color={ORCHID} strokeWidth={1.8} />,
  recording:   <Mic size={16} color={ORCHID} strokeWidth={1.8} />,
  task:        <CheckSquare size={16} color="#60a5fa" strokeWidth={1.8} />,
  system:      <Zap size={16} color="#facc15" strokeWidth={1.8} />,
  pro:         <Gift size={16} color={ORCHID} strokeWidth={1.8} />,
  partnership: <Handshake size={16} color="#34d399" strokeWidth={1.8} />,
  digest:      <Info size={16} color="#a1a1aa" strokeWidth={1.8} />,
};

const BG_MAP: Record<NotifType, string> = {
  welcome:     "rgba(201,106,203,0.12)",
  recording:   "rgba(201,106,203,0.1)",
  task:        "rgba(96,165,250,0.1)",
  system:      "rgba(250,204,21,0.1)",
  pro:         "rgba(201,106,203,0.1)",
  partnership: "rgba(52,211,153,0.1)",
  digest:      "rgba(161,161,170,0.08)",
};

const CTA_MAP: Record<NotifType, { label: string; href: string } | null> = {
  welcome:     { label: "Start recording →", href: "/app/record" },
  recording:   { label: "View session →", href: "/app/memories" },
  task:        { label: "Go to tasks →", href: "/app/tasks" },
  system:      null,
  pro:         { label: "Upgrade to Pro →", href: "/app/settings" },
  partnership: { label: "Fill out the form →", href: "mailto:damirbekx@tashschool.org?subject=Partnership Interest" },
  digest:      null,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchNotifs = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setNotifs(data.notifications);
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markRead = async (id: string) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  };

  const markAllRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
  };

  const dismiss = async (id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const toggle = (id: string, read: boolean) => {
    setExpandedId((prev) => (prev === id ? null : id));
    if (!read) markRead(id);
  };

  const unreadCount = notifs.filter((n) => !n.read).length;
  const unread = notifs.filter((n) => !n.read);
  const read = notifs.filter((n) => n.read);

  return (
    <div className="min-h-screen" style={{ background: "#050505" }}>
      <TopBar title="Notifications" unreadCount={unreadCount} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>
              Inbox
            </h2>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: ORCHID, fontFamily: "var(--font-inter)" }}>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-white"
              style={{ color: "#52525b", fontFamily: "var(--font-inter)" }}
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="rounded-2xl border border-[#1a1a1a] bg-[#0b0b0b] p-4 animate-pulse" style={{ height: 76 }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && notifs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(201,106,203,0.08)", border: "1px solid rgba(201,106,203,0.15)" }}>
              <Bell size={28} color={ORCHID} strokeWidth={1.5} />
            </div>
            <p className="text-sm text-[#52525b]" style={{ fontFamily: "var(--font-inter)" }}>You&apos;re all caught up</p>
          </div>
        )}

        {/* Unread */}
        {!loading && unread.length > 0 && (
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#52525b] mb-3" style={{ fontFamily: "var(--font-syne)" }}>New</p>
            <div className="space-y-2">
              {unread.map((n) => (
                <NotifRow
                  key={n.id}
                  n={n}
                  expanded={expandedId === n.id}
                  onToggle={() => toggle(n.id, n.read)}
                  onDismiss={() => dismiss(n.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Read */}
        {!loading && read.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#52525b] mb-3" style={{ fontFamily: "var(--font-syne)" }}>Earlier</p>
            <div className="space-y-2">
              {read.map((n) => (
                <NotifRow
                  key={n.id}
                  n={n}
                  expanded={expandedId === n.id}
                  onToggle={() => toggle(n.id, n.read)}
                  onDismiss={() => dismiss(n.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NotifRow({
  n,
  expanded,
  onToggle,
  onDismiss,
}: {
  n: Notification;
  expanded: boolean;
  onToggle: () => void;
  onDismiss: () => void;
}) {
  const cta = CTA_MAP[n.type];

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-200"
      style={{
        background: n.read ? "rgba(255,255,255,0.02)" : "rgba(201,106,203,0.04)",
        borderColor: expanded
          ? "rgba(201,106,203,0.3)"
          : n.read
          ? "#1a1a1a"
          : "rgba(201,106,203,0.15)",
      }}
    >
      {/* Row — always visible, click to expand */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* Icon */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: BG_MAP[n.type] }}
        >
          {ICON_MAP[n.type]}
        </div>

        {/* Title + time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {!n.read && (
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ORCHID }} />
            )}
            <p
              className="text-sm font-semibold truncate"
              style={{ fontFamily: "var(--font-syne)", color: n.read ? "#71717a" : "#fff" }}
            >
              {n.title}
            </p>
          </div>
          {!expanded && (
            <p className="text-xs truncate mt-0.5" style={{ color: "#52525b", fontFamily: "var(--font-inter)" }}>
              {n.body}
            </p>
          )}
        </div>

        {/* Time + chevron */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-1">
          <span className="text-[11px]" style={{ color: "#3f3f46", fontFamily: "var(--font-inter)" }}>
            {timeAgo(n.createdAt)}
          </span>
          <ChevronDown
            size={14}
            style={{
              color: "#52525b",
              transition: "transform 0.2s ease",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4">
          {/* Divider */}
          <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.05)" }} />

          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: "#a1a1aa", fontFamily: "var(--font-inter)" }}
          >
            {n.body}
          </p>

          <div className="flex items-center justify-between gap-3">
            {/* CTA */}
            {cta ? (
              <a
                href={cta.href}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:brightness-110"
                style={{ background: "rgba(201,106,203,0.15)", color: ORCHID, fontFamily: "var(--font-inter)" }}
              >
                <ExternalLink size={12} />
                {cta.label}
              </a>
            ) : <div />}

            {/* Dismiss */}
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(); }}
              className="flex items-center gap-1.5 text-xs transition-colors hover:text-red-400"
              style={{ color: "#3f3f46", fontFamily: "var(--font-inter)" }}
            >
              <Trash2 size={12} />
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}