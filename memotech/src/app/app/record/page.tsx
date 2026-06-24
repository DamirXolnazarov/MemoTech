"use client";

import { useState } from "react";
import { BookOpen, Briefcase, Lightbulb } from "lucide-react";
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
        <div className="hidden md:block">
          <TopBar title="Record" />
        </div>
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
      <div className="hidden md:block">
        <TopBar title="Record" />
      </div>

      {stage === "processing" ? (
        <div className="flex items-center justify-center" style={{ minHeight: "100vh" }}>
          <ProcessingScreen />
        </div>
      ) : (
        <div
          className="flex flex-col items-center"
          style={{ minHeight: "100vh", padding: "32px 20px" }}
        >
          {/* Mobile-only minimal header, matches mockup's "RECORDING / 12:47" treatment
              handled inside RecordButton itself once recording starts */}
          <div className="md:hidden w-full text-center mb-2" style={{ marginTop: 8 }}>
            <h2
              className="font-bold"
              style={{ fontFamily: "var(--font-syne)", fontSize: 22, color: "#fff" }}
            >
              New Recording
            </h2>
            <p style={{ color: "#71717a", fontSize: 13, fontFamily: "var(--font-inter)", marginTop: 4 }}>
              Tap to start, speak freely
            </p>
          </div>

          <div className="hidden md:block text-center mb-10">
            <h2 className="font-bold text-white mb-2" style={{ fontFamily: "var(--font-syne)", fontSize: 28 }}>
              New Recording
            </h2>
            <p style={{ color: "#555", fontSize: 14, fontFamily: "var(--font-inter)" }}>
              Press record, speak freely. Memo handles the rest.
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center w-full">
            <RecordButton onRecordingComplete={handleRecordingComplete} />
          </div>

          {error && (
            <p style={{ color: "#f87171", fontFamily: "var(--font-inter)", fontSize: 13, textAlign: "center", marginTop: 16 }}>
              {error}
            </p>
          )}

          {/* Tip cards — desktop only, mobile keeps it minimal/focused like the mockup */}
          <div className="hidden md:grid grid-cols-3 gap-4 w-full mt-12" style={{ maxWidth: 560 }}>
            {[
              { icon: BookOpen, label: "Lectures", desc: "Capture every concept automatically" },
              { icon: Briefcase, label: "Meetings", desc: "Extract tasks and decisions instantly" },
              { icon: Lightbulb, label: "Ideas", desc: "Think out loud, Memo structures it" },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="rounded-xl border p-4 text-center flex flex-col gap-1"
                style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
              >
                <Icon className="w-5 h-5 mx-auto text-white" />
                <p className="font-semibold text-white" style={{ fontFamily: "var(--font-syne)", fontSize: 13 }}>
                  {label}
                </p>
                <p style={{ color: "#555", fontSize: 11, fontFamily: "var(--font-inter)", lineHeight: 1.5 }}>
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