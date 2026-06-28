"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface TranscriptTabProps {
  transcript: string;
}

interface FlaggedWord {
  word: string;
  index: number; // word index in the transcript
  suggestions: string[];
}

export default function TranscriptTab({ transcript }: TranscriptTabProps) {
  const [copied, setCopied] = useState(false);
  const [flagged, setFlagged] = useState<FlaggedWord[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [activePopover, setActivePopover] = useState<number | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [corrections, setCorrections] = useState<Record<number, string>>({});
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const analyzed = useRef(false);

  // Split transcript into words once
  useEffect(() => {
    setWords(transcript.split(/(\s+)/));
  }, [transcript]);

  // Auto-analyze on mount
  useEffect(() => {
    if (!transcript || analyzed.current) return;
    analyzed.current = true;
    analyzeTranscript();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const analyzeTranscript = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/transcript-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setFlagged(data.flagged ?? []);
    } catch {
      // silent — analysis is best-effort
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = async () => {
    // Build corrected transcript
    const wordArr = transcript.split(/(\s+)/);
    const corrected = wordArr.map((w, i) => corrections[i] ?? w).join("");
    await navigator.clipboard.writeText(corrected);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const applyCorrection = (wordIndex: number, suggestion: string) => {
    setCorrections((prev) => ({ ...prev, [wordIndex]: suggestion }));
    setActivePopover(null);
  };

  // Close popover on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Build a map of word-index → flagged entry for O(1) lookup
  const flaggedMap = new Map<number, FlaggedWord>();
  flagged.forEach((f) => flaggedMap.set(f.index, f));

  // Chunk transcript into timed segments for display
  const chunkSize = 300;
  const chunks: { startWordIdx: number; endWordIdx: number; ts: string }[] = [];
  const wordArr = transcript.split(/(\s+)/);
  let charCount = 0;
  let chunkStart = 0;
  let second = 0;

  for (let i = 0; i < wordArr.length; i++) {
    charCount += wordArr[i].length;
    if (charCount >= chunkSize || i === wordArr.length - 1) {
      chunks.push({ startWordIdx: chunkStart, endWordIdx: i, ts: `${Math.floor(second / 60)}:${String(second % 60).padStart(2, "0")}` });
      chunkStart = i + 1;
      charCount = 0;
      second += 30;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 600, color: "#f0f0f0" }}>
            Full Transcript
          </h2>
          {analyzing && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-[#c96acb] border-t-transparent animate-spin" />
              <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#52525b" }}>Checking accuracy…</span>
            </div>
          )}
          {!analyzing && flagged.length > 0 && (
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#f59e0b", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: "2px 8px" }}>
              {flagged.length - Object.keys(corrections).length > 0
                ? `${flagged.length - Object.keys(corrections).length} possible ${flagged.length - Object.keys(corrections).length === 1 ? "error" : "errors"}`
                : "✓ All reviewed"}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          style={{
            fontFamily: "var(--font-inter)", fontSize: 12,
            color: copied ? "#c96acb" : "#555",
            background: "transparent", border: "1px solid #1a1a1a",
            borderRadius: 6, padding: "4px 12px", cursor: "pointer",
            transition: "color 0.2s ease",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Accuracy note */}
      {flagged.length > 0 && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-4 py-3"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
        >
          <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#a1a1aa", lineHeight: 1.6 }}>
            Due to accents or pronunciation, some words may be inaccurate.{" "}
            <span style={{ color: "#f59e0b" }}>Tap underlined words</span> to see suggestions and correct them.
          </p>
        </div>
      )}

      {/* Transcript */}
      <div
        style={{
          background: "#0b0b0b", border: "1px solid #1a1a1a",
          borderRadius: 12, padding: "20px 24px",
          maxHeight: "60vh", overflowY: "auto", position: "relative",
        }}
      >
        {chunks.map((chunk, ci) => (
          <div key={ci} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#333", flexShrink: 0, paddingTop: 2, minWidth: 36 }}>
              {chunk.ts}
            </span>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#888", lineHeight: 1.8, margin: 0 }}>
              {wordArr.slice(chunk.startWordIdx, chunk.endWordIdx + 1).map((w, localIdx) => {
                const globalIdx = chunk.startWordIdx + localIdx;
                const isFlagged = flaggedMap.has(globalIdx) && !corrections[globalIdx];
                const isCorrected = !!corrections[globalIdx];
                const isPopoverOpen = activePopover === globalIdx;
                const flagEntry = flaggedMap.get(globalIdx);

                if (/^\s+$/.test(w)) return <span key={localIdx}>{w}</span>;

                return (
                  <span key={localIdx} style={{ position: "relative", display: "inline" }}>
                    <span
                      onClick={() => {
                        if (isFlagged) setActivePopover(isPopoverOpen ? null : globalIdx);
                        if (isCorrected) {
                          setCorrections((prev) => { const n = { ...prev }; delete n[globalIdx]; return n; });
                        }
                      }}
                      style={{
                        cursor: isFlagged || isCorrected ? "pointer" : "default",
                        color: isCorrected ? "#c96acb" : isFlagged ? "#f0f0f0" : "#888",
                        borderBottom: isFlagged
                          ? "2px solid #f59e0b"
                          : isCorrected
                          ? "2px solid #c96acb"
                          : "none",
                        paddingBottom: isFlagged || isCorrected ? 1 : 0,
                        transition: "color 0.15s ease",
                      }}
                    >
                      {corrections[globalIdx] ?? w}
                    </span>

                    {/* Popover */}
                    {isPopoverOpen && flagEntry && (
                      <span
                        ref={popoverRef}
                        style={{
                          position: "absolute",
                          bottom: "calc(100% + 8px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 50,
                          background: "#111",
                          border: "1px solid #2a2a2a",
                          borderRadius: 10,
                          padding: "10px 12px",
                          minWidth: 180,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                          display: "inline-flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>
                          Did you mean?
                        </span>
                        {flagEntry.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); applyCorrection(globalIdx, s); }}
                            style={{
                              fontFamily: "var(--font-inter)", fontSize: 13,
                              color: "#c96acb", background: "rgba(201,106,203,0.08)",
                              border: "1px solid rgba(201,106,203,0.2)",
                              borderRadius: 6, padding: "4px 10px",
                              cursor: "pointer", textAlign: "left",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,106,203,0.18)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(201,106,203,0.08)"; }}
                          >
                            {s}
                          </button>
                        ))}
                        <button
                          onClick={(e) => { e.stopPropagation(); setActivePopover(null); }}
                          style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#555", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", marginTop: 2 }}
                        >
                          Keep original
                        </button>
                        {/* Arrow */}
                        <span style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 8, height: 8, background: "#111", border: "1px solid #2a2a2a", borderTop: "none", borderLeft: "none" }} />
                      </span>
                    )}
                  </span>
                );
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}