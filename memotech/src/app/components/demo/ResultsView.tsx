"use client";

import { useState } from "react";
import SummaryTab from "./tabs/SummaryTab";
import TranscriptTab from "./tabs/TranscriptTab";
import TasksTab from "./tabs/TasksTab";
import FlashcardsTab from "./tabs/FlashcardsTab";
import KeyMomentsTab from "./tabs/KeyMomentsTab";
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

interface ResultsViewProps {
  data: ProcessedData;
  transcript: string;
  duration: number;
  onReset: () => void;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "summary",
    label: "Summary",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "transcript",
    label: "Transcript",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: "flashcards",
    label: "Flashcards",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    id: "keyMoments",
    label: "Key Moments",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "askMemo",
    label: "Ask Memo",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function ResultsView({ data, transcript, duration, onReset }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [tabVisible, setTabVisible] = useState(true);

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    setTabVisible(false);
    setTimeout(() => {
      setActiveTab(tab);
      setTabVisible(true);
    }, 150);
  };

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#050505" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          flexShrink: 0,
          borderRight: "1px solid #111",
          display: "flex",
          flexDirection: "column",
          padding: "32px 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Session info */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #111" }}>
          <p
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: 13,
              fontWeight: 600,
              color: "#f0f0f0",
              lineHeight: 1.4,
              marginBottom: 6,
            }}
          >
            {data.title}
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#444" }}>
            {date}
          </p>
        </div>

        {/* Nav tabs */}
        <nav style={{ padding: "16px 8px", flex: 1 }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  background: isActive ? "rgba(201,106,203,0.08)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: isActive ? "#c96acb" : "#555",
                  fontFamily: "var(--font-inter)",
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  marginBottom: 2,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#aaa";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "#555";
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Reset */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #111" }}>
          <button
            onClick={onReset}
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              color: "#333",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.44" />
            </svg>
            New recording
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          padding: "48px 56px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            opacity: tabVisible ? 1 : 0,
            transform: tabVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 200ms ease, transform 200ms ease",
          }}
        >
          {activeTab === "summary" && (
            <SummaryTab
              title={data.title}
              date={date}
              duration={duration}
              shortSummary={data.shortSummary}
              detailedSummary={data.detailedSummary}
              keyConcepts={data.keyConcepts}
            />
          )}
          {activeTab === "transcript" && <TranscriptTab transcript={transcript} />}
          {activeTab === "tasks" && <TasksTab tasks={data.tasks} />}
          {activeTab === "flashcards" && <FlashcardsTab flashcards={data.flashcards} />}
          {activeTab === "keyMoments" && <KeyMomentsTab keyMoments={data.keyMoments} />}
          {activeTab === "askMemo" && <AskMemoTab transcript={transcript} />}
        </div>
      </div>
    </div>
  );
}