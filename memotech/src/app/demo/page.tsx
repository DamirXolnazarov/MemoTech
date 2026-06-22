"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RecordButton from "../components/demo/RecordButton";
import ProcessingScreen from "../components/demo/ProcessingScreen";
import ResultsView from "../components/demo/ResultsView";

type AppState = "idle" | "processing" | "results" | "used" | "manual";

interface ProcessedData {
  title: string;
  shortSummary: string;
  detailedSummary: string;
  keyConcepts: string[];
  tasks: Array<{ text: string; priority: "High" | "Medium" | "Low"; dueDate?: string }>;
  flashcards: Array<{ question: string; answer: string }>;
  keyMoments: Array<{ timestamp: string; quote: string; why: string }>;
}

const DEMO_KEY = "memotech_demo_used";

export default function DemoPage() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");

  useEffect(() => {
    const used = localStorage.getItem(DEMO_KEY);
    if (used === "true") setAppState("used");
  }, []);

  const processTranscript = async (t: string, d: number) => {
    localStorage.setItem(DEMO_KEY, "true");
    setTranscript(t);
    setDuration(d);
    setAppState("processing");
    setApiError(null);

    try {
      const res = await fetch("/api/process-recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: t }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "API error");
      }

      const data = await res.json();
      setProcessedData(data);
      setAppState("results");
    } catch (err) {
      console.error(err);
      setApiError("Something went wrong. Please try again.");
      localStorage.removeItem(DEMO_KEY);
      setAppState("manual");
    }
  };

  const handleReset = () => setAppState("used");

  // USED
  if (appState === "used") {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, padding: "0 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1.5px solid rgba(201,106,203,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c96acb" strokeWidth="1.5">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        <div style={{ maxWidth: 380, textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.02em", margin: 0 }}>
            You&apos;ve used your demo
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0 }}>
            The demo is limited to one session. Sign up for MemoTech to record unlimited sessions, access your history, and sync across devices.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%", maxWidth: 280 }}>
           <Link href="/signup" style={{ width: "100%", textDecoration: "none" }}>
            <button style={{ width: "100%", padding: "12px 24px", background: "#c96acb", border: "none", borderRadius: 10, fontFamily: "var(--font-syne)", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer" }}>
              Get full access
            </button>
          </Link>
          <Link href="/" style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#444", textDecoration: "none" }}>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // RESULTS
  if (appState === "results" && processedData) {
    return (
      <ResultsView
        data={processedData}
        transcript={transcript}
        duration={duration}
        onReset={handleReset}
      />
    );
  }

  // PROCESSING
  if (appState === "processing") {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ProcessingScreen />
      </div>
    );
  }

  // MANUAL TEXT INPUT
  if (appState === "manual") {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", flexDirection: "column" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px" }}>
          <span style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 700, color: "#c96acb" }}>memo</span>
          <button
            onClick={() => { setApiError(null); setAppState("idle"); }}
            style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#444", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            Back
          </button>
        </header>
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 20, fontWeight: 700, color: "#f0f0f0", margin: 0 }}>
              Paste your transcript
            </h2>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#555", margin: 0 }}>
              Paste any text — a lecture, meeting notes, voice memo — and Memo will analyze it.
            </p>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Today in biology class we covered photosynthesis. The professor explained how plants convert sunlight into glucose using chlorophyll..."
              style={{ width: "100%", height: 240, background: "#0b0b0b", border: "1px solid #1a1a1a", borderRadius: 12, padding: "16px", fontFamily: "var(--font-inter)", fontSize: 14, color: "#ccc", lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#c96acb")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
            />
            {apiError && (
              <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#f87171", margin: 0 }}>{apiError}</p>
            )}
            <button
              onClick={() => { if (manualText.trim()) processTranscript(manualText.trim(), 0); }}
              disabled={!manualText.trim()}
              style={{ padding: "12px 28px", background: manualText.trim() ? "#c96acb" : "#1a1a1a", border: "none", borderRadius: 10, fontFamily: "var(--font-syne)", fontSize: 14, fontWeight: 600, color: manualText.trim() ? "#fff" : "#333", cursor: manualText.trim() ? "pointer" : "default", alignSelf: "flex-start", transition: "all 0.2s ease" }}
            >
              Analyze with Memo →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // IDLE
  return (
    <div style={{ minHeight: "100vh", background: "#050505", display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 32px", position: "fixed", top: 0, left: 0, right: 0, zIndex: 10 }}>
        <span style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 700, color: "#c96acb", letterSpacing: "-0.02em" }}>memo</span>
        <Link
          href="/"
          style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#444", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#888")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </Link>
      </header>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px" }}>
        <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#c96acb", background: "rgba(201,106,203,0.08)", border: "1px solid rgba(201,106,203,0.15)", borderRadius: 20, padding: "4px 14px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 40 }}>
          Live Demo · 1 session · 10 min max
        </div>
        <RecordButton onRecordingComplete={processTranscript} maxDurationSeconds={600} />
        <button
          onClick={() => setAppState("manual")}
          style={{ marginTop: 24, fontFamily: "var(--font-inter)", fontSize: 12, color: "#444", background: "transparent", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          or paste text instead
        </button>
        {apiError && (
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#f87171", marginTop: 20, textAlign: "center", maxWidth: 320 }}>{apiError}</p>
        )}
      </main>
    </div>
  );
}