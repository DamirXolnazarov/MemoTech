"use client";

import { useState } from "react";
import TopBar from "@/components/app/TopBar";
import RecordButton from "@/components/app/RecordButton";
import ProcessingScreen from "@/components/app/ProcessingScreen";
import SessionResults from "@/components/app/SessionResults";

type Stage = "idle" | "processing" | "results";

interface ProcessedData {
  title: string;
  shortSummary: string;
  detailedSummary: string;
  keyConcepts: string[];
  tasks: Array<{ text: string; priority: "High" | "Medium" | "Low"; dueDate?: string }>;
  flashcards: Array<{ question: string; answer: string }>;
  keyMoments: Array<{ timestamp: string; quote: string; why: string }>;
}

export default function RecordPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = async (t: string, d: number) => {
    setTranscript(t);
    setDuration(d);
    setStage("processing");
    setError(null);

    try {
      const res = await fetch("/api/process-recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: t }),
      });
      if (!res.ok) throw new Error("Processing failed");
      const data = await res.json();
      setProcessedData(data);
      setStage("results");
    } catch {
      setError("Failed to process your recording. Please try again.");
      setStage("idle");
    }
  };

  const handleReset = () => {
    setStage("idle");
    setProcessedData(null);
    setTranscript("");
    setDuration(0);
    setError(null);
  };

  if (stage === "results" && processedData) {
    return (
      <>
        <TopBar title="Record" />
        <SessionResults
          data={processedData}
          transcript={transcript}
          duration={duration}
          onReset={handleReset}
        />
      </>
    );
  }

  return (
    <div>
      <TopBar title="Record" />

      {stage === "processing" ? (
        <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 56px)" }}>
          <ProcessingScreen />
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-12"
          style={{ minHeight: "calc(100vh - 56px)", padding: "48px 24px" }}
        >
          {/* Header */}
          <div className="text-center flex flex-col gap-2">
            <h2
              className="font-bold text-white"
              style={{ fontFamily: "var(--font-syne)", fontSize: 28 }}
            >
              New Recording
            </h2>
            <p style={{ color: "#555", fontSize: 14, fontFamily: "var(--font-inter)" }}>
              Press record, speak freely. Memo handles the rest.
            </p>
          </div>

          {/* Record button */}
          <RecordButton onRecordingComplete={handleRecordingComplete} />

          {error && (
            <p
              style={{
                color: "#f87171",
                fontFamily: "var(--font-inter)",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          {/* Tips */}
          <div
            className="grid grid-cols-3 gap-4 w-full"
            style={{ maxWidth: 560 }}
          >
            {[
              { icon: "🎓", label: "Lectures", desc: "Capture every concept automatically" },
              { icon: "💼", label: "Meetings", desc: "Extract tasks and decisions instantly" },
              { icon: "💡", label: "Ideas", desc: "Think out loud, Memo structures it" },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                className="rounded-xl border p-4 text-center flex flex-col gap-1"
                style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
              >
                <span style={{ fontSize: 20 }}>{icon}</span>
                <p
                  className="font-semibold text-white"
                  style={{ fontFamily: "var(--font-syne)", fontSize: 13 }}
                >
                  {label}
                </p>
                <p
                  style={{
                    color: "#555",
                    fontSize: 11,
                    fontFamily: "var(--font-inter)",
                    lineHeight: 1.5,
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}