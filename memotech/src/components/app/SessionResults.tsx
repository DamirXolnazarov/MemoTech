"use client";

import { useState } from "react";
import SummaryTab from "./tabs/SummaryTab";
import TranscriptTab from "./tabs/TranscriptTab";
import TasksTab from "./tabs/TasksTab";
import FlashcardsTab from "./tabs/FlashcardsTab";
import KeyMomentsTab from "./tabs/KeyMomentsTab";
import AskMemoTab from "./tabs/AskMemoTab";
import { ArrowLeft, Loader2, Check } from "lucide-react";

type Tab = "summary" | "transcript" | "tasks" | "flashcards" | "keyMoments" | "askMemo";

interface ProcessedData {
  title: string;
  shortSummary: string;
  detailedSummary: string;
  keyConcepts: string[];
  tasks: Array<{ text: string; priority: "High" | "Medium" | "Low"; dueDate?: string }>;
  flashcards: Array<{ question: string; answer: string }>;
  keyMoments: Array<{ timestamp: string; quote: string; why: string }>;
}

interface SessionResultsProps {
  data: ProcessedData;
  transcript: string;
  duration: number;
  onReset: () => void;
  /** "fresh" = just-recorded, shows Save button. "saved" = viewing an
   *  existing session from Memories, hides Save (already persisted). */
  mode?: "fresh" | "saved";
  /** Required when mode="saved" — the existing session's id, in case
   *  future features (e.g. share/delete from this view) need it. */
  sessionId?: string;
  /** Required when mode="saved" — real creation date instead of "today". */
  createdAt?: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const TABS: { id: Tab; label: string; mobileLabel: string }[] = [
  { id: "summary", label: "Summary", mobileLabel: "Summary" },
  { id: "transcript", label: "Transcript", mobileLabel: "Transcript" },
  { id: "tasks", label: "Tasks", mobileLabel: "Tasks" },
  { id: "flashcards", label: "Flashcards", mobileLabel: "Flashcards" },
  { id: "keyMoments", label: "Key Moments", mobileLabel: "Key Points" },
  { id: "askMemo", label: "Ask Memo", mobileLabel: "Ask Memo" },
];

export default function SessionResults({
  data,
  transcript,
  duration,
  onReset,
  mode = "fresh",
  createdAt,
}: SessionResultsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [tabVisible, setTabVisible] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isSaved = mode === "saved";

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    setTabVisible(false);
    setTimeout(() => { setActiveTab(tab); setTabVisible(true); }, 150);
  };

  const handleSave = async () => {
    if (saveState === "saving" || isSaved) return;
    setSaveState("saving");
    setErrorMsg("");
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          shortSummary: data.shortSummary,
          detailedSummary: data.detailedSummary,
          keyConcepts: data.keyConcepts,
          transcript,
          duration,
          tasks: data.tasks,
          flashcards: data.flashcards,
          keyMoments: data.keyMoments,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to save session");
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const saveLabel =
    saveState === "saving" ? "Saving..." :
    saveState === "saved" ? "Saved" :
    saveState === "error" ? "Retry" :
    "Save";

  return (
    <div>
      {/* Mobile header */}
      <div className="md:hidden" style={{ padding: "20px 20px 0" }}>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 mb-4"
          style={{ color: "#71717a", fontFamily: "var(--font-inter)", fontSize: 13, background: "none", border: "none" }}
        >
          <ArrowLeft size={15} />
          {isSaved ? "Back to Memories" : "New recording"}
        </button>

        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex-1 min-w-0">
            <h1
              className="font-bold"
              style={{ fontFamily: "var(--font-syne)", fontSize: 24, color: "#fff", lineHeight: 1.2 }}
            >
              {data.title}
            </h1>
            <p style={{ color: "#71717a", fontSize: 13, fontFamily: "var(--font-inter)", marginTop: 4 }}>
              {date} · {duration < 60 ? `${duration}s` : `${Math.floor(duration / 60)} min`}
            </p>
          </div>

          {!isSaved && (
            <button
              onClick={handleSave}
              disabled={saveState === "saving"}
              className="flex items-center gap-1.5 rounded-full flex-shrink-0 transition-transform active:scale-95"
              style={{
                padding: "9px 16px",
                background: saveState === "saved" ? "rgba(52,211,153,0.12)" : "rgba(201,106,203,0.12)",
                border: `1px solid ${saveState === "saved" ? "rgba(52,211,153,0.3)" : "rgba(201,106,203,0.3)"}`,
              }}
            >
              {saveState === "saving" && <Loader2 size={13} className="animate-spin" style={{ color: "#c96acb" }} />}
              {saveState === "saved" && <Check size={13} style={{ color: "#34d399" }} />}
              <span
                style={{
                  fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 600,
                  color: saveState === "saved" ? "#34d399" : "#c96acb",
                }}
              >
                {saveLabel}
              </span>
            </button>
          )}
        </div>

        {errorMsg && saveState === "error" && (
          <p style={{ color: "#f87171", fontSize: 12, fontFamily: "var(--font-inter)", marginBottom: 12 }}>
            {errorMsg}
          </p>
        )}

        <div
          className="flex gap-2 overflow-x-auto no-scrollbar"
          style={{ paddingBottom: 16, marginBottom: 4 }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className="flex-shrink-0 rounded-full transition-colors"
                style={{
                  padding: "9px 18px",
                  background: isActive ? "#c96acb" : "#161018",
                  border: isActive ? "none" : "1px solid #221a26",
                  fontFamily: "var(--font-inter)",
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: isActive ? "#0a0a0a" : "#a1a1aa",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.mobileLabel}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <div
          className="hidden md:flex"
          style={{
            width: 200, flexShrink: 0, borderRight: "1px solid #111",
            flexDirection: "column", paddingTop: 24, position: "sticky", top: 56,
            height: "calc(100vh - 56px)", overflowY: "auto", background: "#080808",
          }}
        >
          <div style={{ padding: "0 16px 20px", borderBottom: "1px solid #111" }}>
            <p style={{ fontFamily: "var(--font-syne)", fontSize: 12, fontWeight: 600, color: "#f0f0f0", lineHeight: 1.4, marginBottom: 4 }}>
              {data.title}
            </p>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#444" }}>{date}</p>
          </div>

          <nav style={{ padding: "12px 8px", flex: 1 }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 10px", borderRadius: 8,
                    background: isActive ? "rgba(201,106,203,0.08)" : "transparent",
                    border: "none", cursor: "pointer",
                    color: isActive ? "#c96acb" : "#555",
                    fontFamily: "var(--font-inter)", fontSize: 12,
                    fontWeight: isActive ? 500 : 400,
                    textAlign: "left", transition: "all 0.15s ease", marginBottom: 1,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div style={{ padding: "12px 12px 20px", borderTop: "1px solid #111", display: "flex", flexDirection: "column", gap: 8 }}>
            {!isSaved && (
              <button
                onClick={handleSave}
                disabled={saveState === "saving"}
                style={{
                  fontFamily: "var(--font-inter)", fontSize: 12,
                  color: saveState === "saved" ? "#c96acb" : saveState === "error" ? "#f87171" : "#fff",
                  background: saveState === "saved" ? "rgba(201,106,203,0.1)" : saveState === "error" ? "rgba(239,68,68,0.1)" : saveState === "saving" ? "#8a4d8c" : "#c96acb",
                  border: saveState === "saved" ? "1px solid rgba(201,106,203,0.3)" : saveState === "error" ? "1px solid rgba(239,68,68,0.3)" : "none",
                  borderRadius: 8, padding: "7px 10px", cursor: saveState === "saving" ? "default" : "pointer",
                  transition: "all 0.2s ease", fontWeight: 500,
                }}
              >
                {saveState === "saving" ? "Saving..." : saveState === "saved" ? "✓ Saved!" : saveState === "error" ? "✗ Failed — retry" : "Save Session"}
              </button>
            )}
            {saveState === "error" && errorMsg && (
              <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#f87171", lineHeight: 1.4 }}>{errorMsg}</p>
            )}
            <button
              onClick={onReset}
              style={{
                fontFamily: "var(--font-inter)", fontSize: 12, color: "#444",
                background: "transparent", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, padding: "2px 0",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.44"/>
              </svg>
              {isSaved ? "Back to Memories" : "New recording"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1" style={{ padding: "0 20px 100px" }}>
          <div className="hidden md:block" style={{ padding: "48px 56px 0" }} />
          <div
            style={{
              opacity: tabVisible ? 1 : 0,
              transform: tabVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 200ms ease, transform 200ms ease",
            }}
            className="md:px-9"
          >
            {activeTab === "summary" && <SummaryTab title={data.title} date={date} duration={duration} shortSummary={data.shortSummary} detailedSummary={data.detailedSummary} keyConcepts={data.keyConcepts} />}
            {activeTab === "transcript" && <TranscriptTab transcript={transcript} />}
            {activeTab === "tasks" && <TasksTab tasks={data.tasks} />}
            {activeTab === "flashcards" && <FlashcardsTab flashcards={data.flashcards} />}
            {activeTab === "keyMoments" && <KeyMomentsTab keyMoments={data.keyMoments} />}
            {activeTab === "askMemo" && <AskMemoTab transcript={transcript} />}
          </div>
        </div>
      </div>
    </div>
  );
}