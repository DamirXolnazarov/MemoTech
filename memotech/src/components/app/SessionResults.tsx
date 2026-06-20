"use client";

import { useState } from "react";
import SummaryTab from "./tabs/SummaryTab";
import TranscriptTab from "./tabs/TranscriptTab";
import TasksTab from "./tabs/TasksTab";
import FlashcardsTab from "./tabs/FlashcardsTab";
import KeyMomentsTab from "./tabs/KeyMomentsTab";
import { Share2 } from "lucide-react";
import ShareModal from "./ShareModal";
import AskMemoTab from "./tabs/AskMemoTab";

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
  /** "live": just-processed, unsaved recording (default).
   *  "saved": viewing an existing session fetched from the DB. */
  mode?: "live" | "saved";
  /** Required when mode="saved" — the real DB session id. */
  sessionId?: string;
  /** Optional: real createdAt for saved sessions, instead of "today". */
  createdAt?: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "summary", label: "Summary",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    id: "transcript", label: "Transcript",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  },
  {
    id: "tasks", label: "Tasks",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  },
  {
    id: "flashcards", label: "Flashcards",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  },
  {
    id: "keyMoments", label: "Key Moments",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    id: "askMemo", label: "Ask Memo",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
];

export default function SessionResults({
  data,
  transcript,
  duration,
  onReset,
  mode = "live",
  sessionId,
  createdAt,
}: SessionResultsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [tabVisible, setTabVisible] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [liveSavedSessionId, setLiveSavedSessionId] = useState<string | null>(null);

  // The id usable for Share: either the real DB id (mode="saved"),
  // or the id captured after a successful live save.
  const shareableSessionId = mode === "saved" ? sessionId ?? null : liveSavedSessionId;

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    setTabVisible(false);
    setTimeout(() => { setActiveTab(tab); setTabVisible(true); }, 150);
  };

  const handleSave = async () => {
    if (saveState === "saving") return;
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

      const body = await res.json();
      if (body?.session?.id) {
        setLiveSavedSessionId(body.session.id);
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
    saveState === "saved" ? "✓ Saved!" :
    saveState === "error" ? "✗ Failed — retry" :
    "Save Session";

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 56px)" }}>
      {/* Inner tab sidebar */}
      <div
        style={{
          width: 200,
          flexShrink: 0,
          borderRight: "1px solid #111",
          display: "flex",
          flexDirection: "column",
          paddingTop: 24,
          position: "sticky",
          top: 56,
          height: "calc(100vh - 56px)",
          overflowY: "auto",
          background: "#080808",
        }}
      >
        {/* Session title */}
        <div style={{ padding: "0 16px 20px", borderBottom: "1px solid #111" }}>
          <p style={{ fontFamily: "var(--font-syne)", fontSize: 12, fontWeight: 600, color: "#f0f0f0", lineHeight: 1.4, marginBottom: 4 }}>
            {data.title}
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#444" }}>{date}</p>
        </div>

        {/* Tab nav */}
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
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#aaa"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#555"; }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div style={{ padding: "12px 12px 20px", borderTop: "1px solid #111", display: "flex", flexDirection: "column", gap: 8 }}>
          {mode === "live" && (
            <button
              onClick={handleSave}
              disabled={saveState === "saving"}
              style={{
                fontFamily: "var(--font-inter)", fontSize: 12,
                color: saveState === "saved" ? "#c96acb" : saveState === "error" ? "#f87171" : "#fff",
                background:
                  saveState === "saved" ? "rgba(201,106,203,0.1)" :
                  saveState === "error" ? "rgba(239,68,68,0.1)" :
                  saveState === "saving" ? "#8a4d8c" : "#c96acb",
                border:
                  saveState === "saved" ? "1px solid rgba(201,106,203,0.3)" :
                  saveState === "error" ? "1px solid rgba(239,68,68,0.3)" : "none",
                borderRadius: 8, padding: "7px 10px",
                cursor: saveState === "saving" ? "default" : "pointer",
                transition: "all 0.2s ease", fontWeight: 500,
              }}
            >
              {saveLabel}
            </button>
          )}

          <button
            onClick={() => shareableSessionId && setShareModalOpen(true)}
            disabled={!shareableSessionId}
            title={!shareableSessionId ? "Save the session before sharing" : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              borderRadius: 8, padding: "7px 10px",
              fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 500,
              color: shareableSessionId ? "#fff" : "#444",
              background: "transparent",
              border: `1px solid ${shareableSessionId ? "#222" : "#161616"}`,
              cursor: shareableSessionId ? "pointer" : "not-allowed",
              transition: "border-color 0.15s ease",
            }}
          >
            <Share2 size={14} />
            Share
          </button>

          {saveState === "error" && errorMsg && (
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#f87171", lineHeight: 1.4 }}>
              {errorMsg}
            </p>
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
            {mode === "saved" ? "Back to Memories" : "New recording"}
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
        <div style={{
          opacity: tabVisible ? 1 : 0,
          transform: tabVisible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}>
          {activeTab === "summary" && <SummaryTab title={data.title} date={date} duration={duration} shortSummary={data.shortSummary} detailedSummary={data.detailedSummary} keyConcepts={data.keyConcepts} />}
          {activeTab === "transcript" && <TranscriptTab transcript={transcript} />}
          {activeTab === "tasks" && <TasksTab tasks={data.tasks} />}
          {activeTab === "flashcards" && <FlashcardsTab flashcards={data.flashcards} />}
          {activeTab === "keyMoments" && <KeyMomentsTab keyMoments={data.keyMoments} />}
          {activeTab === "askMemo" && <AskMemoTab transcript={transcript} />}
        </div>
      </div>

      {shareModalOpen && shareableSessionId && (
        <ShareModal
          sessionId={shareableSessionId}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}
