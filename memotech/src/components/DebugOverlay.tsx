"use client";

import { useEffect, useState } from "react";

interface LogEntry {
  type: "error" | "warn" | "log";
  message: string;
  timestamp: number;
}

export default function DebugOverlay() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    const push = (type: LogEntry["type"], args: unknown[]) => {
      const message = args
        .map((a) => {
          if (a instanceof Error) return `${a.name}: ${a.message}\n${a.stack ?? ""}`;
          if (typeof a === "object") {
            try { return JSON.stringify(a); } catch { return String(a); }
          }
          return String(a);
        })
        .join(" ");
      setLogs((prev) => [...prev.slice(-19), { type, message, timestamp: Date.now() }]);
    };

    console.error = (...args: unknown[]) => {
      push("error", args);
      originalError(...args);
    };
    console.warn = (...args: unknown[]) => {
      push("warn", args);
      originalWarn(...args);
    };

    const handleWindowError = (e: ErrorEvent) => {
      push("error", [`Uncaught: ${e.message} (${e.filename}:${e.lineno}:${e.colno})`]);
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      push("error", [`Unhandled rejection: ${e.reason}`]);
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 64, right: 12, zIndex: 99999,
          background: logs.some((l) => l.type === "error") ? "#ef4444" : "#27272a",
          color: "#fff", border: "none", borderRadius: 20,
          padding: "6px 12px", fontSize: 11, fontFamily: "monospace",
        }}
      >
        Debug ({logs.length})
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed", bottom: 64, left: 8, right: 8, zIndex: 99999,
        maxHeight: "45vh", overflowY: "auto",
        background: "rgba(10,10,10,0.97)", border: "1px solid #333",
        borderRadius: 12, padding: 10, fontFamily: "monospace", fontSize: 10.5,
        color: "#ccc", boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "#888" }}>Debug console ({logs.length})</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setLogs([])} style={{ color: "#888", background: "none", border: "none" }}>clear</button>
          <button onClick={() => setOpen(false)} style={{ color: "#888", background: "none", border: "none" }}>×</button>
        </div>
      </div>
      {logs.length === 0 && <p style={{ color: "#555" }}>No errors logged yet. Navigate around the app.</p>}
      {logs.map((log, i) => (
        <div
          key={i}
          style={{
            color: log.type === "error" ? "#f87171" : log.type === "warn" ? "#fbbf24" : "#888",
            marginBottom: 6,
            paddingBottom: 6,
            borderBottom: "1px solid #1a1a1a",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          [{log.type}] {log.message}
        </div>
      ))}
    </div>
  );
}
