"use client";

import { useState } from "react";

interface TranscriptTabProps {
  transcript: string;
}

export default function TranscriptTab({ transcript }: TranscriptTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Split into ~30s chunks (approximate by characters)
  const chunkSize = 300;
  const chunks: { text: string; ts: string }[] = [];
  let remaining = transcript;
  let second = 0;
  while (remaining.length > 0) {
    const chunk = remaining.slice(0, chunkSize);
    chunks.push({ text: chunk, ts: `${Math.floor(second / 60)}:${String(second % 60).padStart(2, "0")}` });
    remaining = remaining.slice(chunkSize);
    second += 30;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: 18,
            fontWeight: 600,
            color: "#f0f0f0",
          }}
        >
          Full Transcript
        </h2>
        <button
          onClick={handleCopy}
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 12,
            color: copied ? "#c96acb" : "#555",
            background: "transparent",
            border: "1px solid #1a1a1a",
            borderRadius: 6,
            padding: "4px 12px",
            cursor: "pointer",
            transition: "color 0.2s ease",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div
        style={{
          background: "#0b0b0b",
          border: "1px solid #1a1a1a",
          borderRadius: 12,
          padding: "20px 24px",
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        {chunks.map((chunk, i) => (
          <div key={i} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <span
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 11,
                color: "#333",
                flexShrink: 0,
                paddingTop: 2,
                minWidth: 36,
              }}
            >
              {chunk.ts}
            </span>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 14,
                color: "#888",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {chunk.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}