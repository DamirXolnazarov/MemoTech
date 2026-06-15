"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const DIGEST_KEY = "memo_digest_enabled";
const PLAN_KEY = "memo_plan";

export default function DigestSettings() {
  const { user } = useUser();
  const [enabled, setEnabled] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [sendState, setSendState] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    setEnabled(localStorage.getItem(DIGEST_KEY) === "true");
    setIsPro(localStorage.getItem(PLAN_KEY) === "pro");
  }, []);

  function handleToggle() {
    if (!isPro) return;
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(DIGEST_KEY, String(next));
  }

  async function handleSendNow() {
    if (!user?.id) return;
    setSendState("loading");
    try {
      const res = await fetch("/api/digest/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSendState("success");
      setTimeout(() => setSendState("idle"), 4000);
    } catch {
      setSendState("error");
      setTimeout(() => setSendState("idle"), 4000);
    }
  }

  const previewItems = [
    { icon: "📊", label: "Your weekly stats" },
    { icon: "🧠", label: "Concepts you learned" },
    { icon: "✅", label: "Pending tasks" },
    { icon: "🃏", label: "Flashcards due for review" },
    { icon: "✨", label: "AI focus suggestion for next week" },
  ];

  return (
    <div className="relative rounded-2xl border border-[#1a1a1a] bg-[#0b0b0b] p-8">
      {/* Pro gate overlay */}
      {!isPro && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl"
          style={{ backdropFilter: "blur(2px)", backgroundColor: "rgba(5,5,5,0.6)" }}
        >
          <div
            className="flex flex-col items-center gap-3 rounded-xl px-6 py-4 text-center"
            style={{ backgroundColor: "#c96acb" }}
          >
            <span className="text-sm font-semibold text-white">Pro Feature</span>
            <a
              href="/pricing"
              className="text-xs font-medium text-white underline underline-offset-2 opacity-90 hover:opacity-100"
            >
              Upgrade to Pro →
            </a>
          </div>
        </div>
      )}

      {/* Blurred content when not Pro */}
      <div style={{ filter: isPro ? "none" : "blur(2px)", pointerEvents: isPro ? "auto" : "none" }}>
        {/* Card header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1 pr-8">
            <p
              className="mb-1 font-bold text-white"
              style={{ fontFamily: "var(--font-syne)", fontSize: "16px" }}
            >
              Weekly Brain Digest
            </p>
            <p className="text-sm leading-relaxed text-[#6b7280]">
              Every Sunday at 9am, receive a personalised summary of everything you learned,
              created, and still need to do.
            </p>
          </div>

          {/* Toggle */}
          <button
            onClick={handleToggle}
            disabled={!isPro}
            aria-label={enabled ? "Disable digest" : "Enable digest"}
            className="relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c96acb] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0b]"
            style={{ backgroundColor: enabled ? "#c96acb" : "#2a2a2a" }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
              style={{ left: "2px", transform: enabled ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
        </div>

        {/* Expanded state */}
        {enabled && (
          <>
            <div className="my-5 h-px bg-[#1a1a1a]" />

            {/* Preview list */}
            <div className="mb-5 space-y-2">
              {previewItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-lg bg-[#111111] px-3 py-2.5">
                  <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#c96acb]" />
                  <span className="mr-1 text-sm">{item.icon}</span>
                  <span className="text-sm text-[#9ca3af]">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Send now button + feedback */}
            <div className="space-y-3">
              <button
                onClick={handleSendNow}
                disabled={sendState === "loading"}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-[#1a1a1a] px-4 py-2.5 text-sm font-medium transition-colors",
                  sendState === "loading"
                    ? "cursor-not-allowed text-[#6b7280]"
                    : "text-[#e5e7eb] hover:border-[#c96acb] hover:text-[#c96acb]"
                )}
              >
                <Mail size={15} />
                {sendState === "loading" ? "Sending..." : "Send me this week's digest now"}
              </button>

              {sendState === "success" && (
                <p className="text-sm font-medium text-emerald-400">
                  ✓ Digest sent! Check your inbox.
                </p>
              )}
              {sendState === "error" && (
                <p className="text-sm font-medium text-red-400">
                  Something went wrong. Try again.
                </p>
              )}

              <p className="text-xs text-[#4b5563]">
                You'll receive your first digest this Sunday. Sent from{" "}
                <span className="text-[#6b7280]">digest@memotech.ai</span>
              </p>
            </div>
          </>
        )}

        {/* Collapsed state */}
        {!enabled && (
          <p className="mt-3 text-xs text-[#4b5563]">Enable to receive weekly digests.</p>
        )}
      </div>
    </div>
  );
}