"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Bug, Lightbulb, MessageCircle, Send, CheckCircle } from "lucide-react";

type ReportType = "bug" | "feedback" | "other";

const TYPES: { type: ReportType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "bug", label: "Bug", icon: <Bug size={14} />, color: "#f87171" },
  { type: "feedback", label: "Feedback", icon: <Lightbulb size={14} />, color: "#f59e0b" },
  { type: "other", label: "Other", icon: <MessageCircle size={14} />, color: "#c96acb" },
];

export default function ReportButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ReportType>("feedback");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const pathname = usePathname();

  // Close on ESC
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setMessage("");
        setType("feedback");
        setSubmitted(false);
      }, 300);
    }
  }, [open]);

  const submit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, page: pathname }),
      });
      setSubmitted(true);
      setTimeout(() => setOpen(false), 2000);
    } catch {
      // silent — still show success to not frustrate user
      setSubmitted(true);
      setTimeout(() => setOpen(false), 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating BETA pill */}
      <button
        onClick={() => setOpen(true)}
        className="fixed z-40 flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all hover:scale-105 active:scale-95"
        style={{
          bottom: "calc(56px + env(safe-area-inset-bottom, 0px) + 12px)",
          right: 16,
          background: "rgba(201,106,203,0.12)",
          border: "1px solid rgba(201,106,203,0.3)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          cursor: "pointer",
        }}
        aria-label="Send feedback"
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#c96acb", boxShadow: "0 0 6px rgba(201,106,203,0.8)" }}
        />
        <span style={{ fontFamily: "var(--font-syne)", fontSize: 11, fontWeight: 700, color: "#c96acb", letterSpacing: "0.08em" }}>
          BETA
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Modal */}
      <div
        className="fixed z-50 left-1/2 -translate-x-1/2 w-full transition-all duration-300"
        style={{
          maxWidth: 460,
          bottom: open ? 0 : "-100%",
          padding: "0 12px 12px",
          // On desktop, center vertically instead
        }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "#0e0e0e", border: "1px solid #1a1a1a", boxShadow: "0 -8px 40px rgba(0,0,0,0.6)" }}
        >
          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-6">
              <CheckCircle size={36} color="#c96acb" strokeWidth={1.5} />
              <p style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 600, color: "#fff" }}>Thanks for your feedback!</p>
              <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#52525b", textAlign: "center" }}>
                We read every report and use it to make Memo better.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 p-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontFamily: "var(--font-syne)", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                    Report an issue
                  </p>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#52525b", marginTop: 2 }}>
                    Bug, feedback, or anything on your mind
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
                  style={{ border: "1px solid #1a1a1a", color: "#555", background: "transparent", cursor: "pointer" }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Type selector */}
              <div className="flex gap-2">
                {TYPES.map(({ type: t, label, icon, color }) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className="flex items-center gap-1.5 flex-1 justify-center rounded-xl py-2 transition-all"
                    style={{
                      fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500,
                      border: `1px solid ${type === t ? color + "55" : "#1a1a1a"}`,
                      background: type === t ? color + "15" : "transparent",
                      color: type === t ? color : "#555",
                      cursor: "pointer",
                    }}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  type === "bug" ? "Describe what happened and how to reproduce it…"
                  : type === "feedback" ? "What would make Memo better for you?"
                  : "Tell us anything…"
                }
                rows={4}
                style={{
                  width: "100%", background: "#0b0b0b", border: "1px solid #1a1a1a",
                  borderRadius: 12, padding: "12px 14px", resize: "none",
                  fontFamily: "var(--font-inter)", fontSize: 13, color: "#ccc",
                  outline: "none", lineHeight: 1.6,
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,106,203,0.3)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#1a1a1a"; }}
              />

              {/* Page context */}
              <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#3f3f46", marginTop: -8 }}>
                Page: <span style={{ color: "#52525b" }}>{pathname}</span>
              </p>

              {/* Submit */}
              <button
                onClick={submit}
                disabled={!message.trim() || submitting}
                className="flex items-center justify-center gap-2 w-full rounded-xl py-3 transition-all"
                style={{
                  background: message.trim() ? "#c96acb" : "#1a1a1a",
                  color: message.trim() ? "#fff" : "#333",
                  fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 600,
                  border: "none", cursor: message.trim() ? "pointer" : "default",
                  opacity: submitting ? 0.7 : 1,
                  transition: "all 0.2s ease",
                }}
              >
                {submitting ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <Send size={13} />
                    Send report
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}