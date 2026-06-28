"use client";
import { useState, useEffect, useRef } from "react";
import { Copy, Check, AlertTriangle, ChevronDown } from "lucide-react";

interface TranscriptTabProps {
  transcript: string;
}

interface FlaggedWord {
  index: number;
  word: string;
  suggestions: string[];
}

export default function TranscriptTab({ transcript }: TranscriptTabProps) {
  const [copied, setCopied] = useState(false);
  const [flagged, setFlagged] = useState<FlaggedWord[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [activePopover, setActivePopover] = useState<number | null>(null);
  const [corrections, setCorrections] = useState<Record<number, string>>({});
  const analyzed = useRef(false);

  // Split into tokens preserving whitespace
  const tokens = transcript.split(/(\s+)/);

  useEffect(() => {
    if (!transcript || analyzed.current) return;
    analyzed.current = true;
    (async () => {
      setAnalyzing(true);
      try {
        const res = await fetch("/api/transcript-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });
        if (res.ok) {
          const data = await res.json();
          setFlagged(data.flagged ?? []);
        }
      } catch { /* silent */ }
      finally { setAnalyzing(false); }
    })();
  }, [transcript]);

  const handleCopy = async () => {
    const corrected = tokens.map((w, i) => corrections[i] ?? w).join("");
    await navigator.clipboard.writeText(corrected);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const flaggedMap = new Map<number, FlaggedWord>();
  flagged.forEach((f) => flaggedMap.set(f.index, f));

  const unreviewedCount = flagged.filter((f) => !corrections[f.index]).length;

  // Chunk tokens into timed segments
  type Chunk = { startIdx: number; endIdx: number; ts: string };
  const chunks: Chunk[] = [];
  let charCount = 0, chunkStart = 0, second = 0;
  for (let i = 0; i < tokens.length; i++) {
    charCount += tokens[i].length;
    if (charCount >= 300 || i === tokens.length - 1) {
      chunks.push({ startIdx: chunkStart, endIdx: i, ts: `${Math.floor(second / 60)}:${String(second % 60).padStart(2, "0")}` });
      chunkStart = i + 1; charCount = 0; second += 30;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 600, color: "#f0f0f0" }}>
            Full Transcript
          </h2>
          {analyzing && (
            <span className="flex items-center gap-1.5" style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#52525b" }}>
              <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#52525b", borderTopColor: "transparent" }} />
              Checking…
            </span>
          )}
          {!analyzing && unreviewedCount > 0 && (
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-0.5"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", fontFamily: "var(--font-inter)", fontSize: 11, color: "#f59e0b" }}
            >
              <AlertTriangle size={10} />
              {unreviewedCount} {unreviewedCount === 1 ? "error" : "errors"}
            </span>
          )}
          {!analyzing && flagged.length > 0 && unreviewedCount === 0 && (
            <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", fontFamily: "var(--font-inter)", fontSize: 11, color: "#4ade80" }}>
              <Check size={10} /> All reviewed
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors"
          style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: copied ? "#c96acb" : "#555", background: "transparent", border: "1px solid #1a1a1a", cursor: "pointer" }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Accuracy note — only when errors found */}
      {!analyzing && unreviewedCount > 0 && (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
          <AlertTriangle size={13} color="#f59e0b" className="flex-shrink-0 mt-0.5" />
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#71717a", lineHeight: 1.5, margin: 0 }}>
            Due to accents or pronunciation, some words may be inaccurate.{" "}
            <span style={{ color: "#f59e0b" }}>Tap underlined words</span> to correct them.
          </p>
        </div>
      )}

      {/* Transcript body */}
      <div style={{ background: "#0b0b0b", border: "1px solid #1a1a1a", borderRadius: 12, padding: "16px 20px", maxHeight: "55vh", overflowY: "auto" }}>
        {chunks.map((chunk, ci) => (
          <div key={ci} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "#2a2a2a", flexShrink: 0, paddingTop: 3, minWidth: 34 }}>
              {chunk.ts}
            </span>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#888", lineHeight: 1.85, margin: 0, wordBreak: "break-word" }}>
              {tokens.slice(chunk.startIdx, chunk.endIdx + 1).map((token, localIdx) => {
                const globalIdx = chunk.startIdx + localIdx;
                if (/^\s+$/.test(token)) return <span key={localIdx}>{token}</span>;

                const isFlagged = flaggedMap.has(globalIdx) && !corrections[globalIdx];
                const isCorrected = !!corrections[globalIdx];
                const flagEntry = flaggedMap.get(globalIdx);
                const isOpen = activePopover === globalIdx;

                if (!isFlagged && !isCorrected) {
                  return <span key={localIdx}>{token}</span>;
                }

                return (
                  <span key={localIdx} style={{ position: "relative", display: "inline" }}>
                    <button
                      onClick={() => setActivePopover(isOpen ? null : globalIdx)}
                      style={{
                        display: "inline",
                        background: "none", border: "none", padding: 0,
                        fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit",
                        cursor: "pointer",
                        color: isCorrected ? "#c96acb" : "#f0f0f0",
                        borderBottom: isFlagged ? "2px solid #f59e0b" : "2px solid rgba(201,106,203,0.5)",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      {corrections[globalIdx] ?? token}
                    </button>

                    {/* Inline popover — renders below the word, inside the flow */}
                    {isOpen && flagEntry && (
                      <span
                        style={{
                          position: "absolute",
                          top: "calc(100% + 6px)",
                          left: 0,
                          zIndex: 100,
                          background: "#161616",
                          border: "1px solid #2a2a2a",
                          borderRadius: 10,
                          padding: "10px 12px",
                          minWidth: 170,
                          boxShadow: "0 4px 24px rgba(0,0,0,0.7)",
                          display: "inline-flex",
                          flexDirection: "column",
                          gap: 5,
                          // Clamp to right edge on mobile
                          maxWidth: "min(220px, calc(100vw - 32px))",
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          Did you mean?
                        </span>
                        {flagEntry.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); setCorrections((p) => ({ ...p, [globalIdx]: s })); setActivePopover(null); }}
                            style={{
                              fontFamily: "var(--font-inter)", fontSize: 13,
                              color: "#c96acb", textAlign: "left",
                              background: "rgba(201,106,203,0.08)",
                              border: "1px solid rgba(201,106,203,0.15)",
                              borderRadius: 6, padding: "4px 10px",
                              cursor: "pointer",
                            }}
                          >
                            {s}
                          </button>
                        ))}
                        <button
                          onClick={(e) => { e.stopPropagation(); setActivePopover(null); }}
                          style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#444", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", paddingTop: 2 }}
                        >
                          Keep original
                        </button>
                      </span>
                    )}
                  </span>
                );
              })}
            </p>
          </div>
        ))}
      </div>

      {/* Close popover on outside tap */}
      {activePopover !== null && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setActivePopover(null)}
          style={{ background: "transparent" }}
        />
      )}
    </div>
  );
}