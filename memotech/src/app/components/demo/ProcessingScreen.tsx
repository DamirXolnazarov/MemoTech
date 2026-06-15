"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Transcribing audio…",
  "Generating summary…",
  "Extracting tasks…",
  "Building insights…",
];

export default function ProcessingScreen() {
  const [visible, setVisible] = useState<number[]>([]);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    STEPS.forEach((_, i) => {
      setTimeout(() => {
        setVisible((v) => [...v, i]);
      }, i * 600);
      setTimeout(() => {
        setDone((d) => [...d, i]);
      }, i * 600 + 900);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-10" style={{ minHeight: "60vh" }}>
      {/* Pulsing logo */}
      <div
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: 28,
          fontWeight: 700,
          color: "#c96acb",
          letterSpacing: "-0.02em",
          animation: "logo-pulse 1.5s ease-in-out infinite",
        }}
      >
        memo
      </div>

      {/* Status lines */}
      <div className="flex flex-col gap-4" style={{ minWidth: 260 }}>
        {STEPS.map((step, i) => (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: visible.includes(i) ? 1 : 0,
              transform: visible.includes(i) ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {done.includes(i) ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="#c96acb" opacity="0.15" />
                  <path d="M5 8l2 2 4-4" stroke="#c96acb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : visible.includes(i) ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="8" cy="8" r="6" stroke="#2a2a2a" strokeWidth="2" />
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="#c96acb" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : null}
            </div>
            <span
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 14,
                color: done.includes(i) ? "#c96acb" : "#666",
                transition: "color 0.3s ease",
              }}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes logo-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}