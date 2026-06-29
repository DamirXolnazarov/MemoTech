"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Copy, Check, AlertTriangle } from "lucide-react";

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
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [corrections, setCorrections] = useState<Record<number, string>>({});
  const [mounted, setMounted] = useState(false);
  const analyzed = useRef(false);

  useEffect(() => { setMounted(true); }, []);

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
        if (res.ok) setFlagged((await res.json()).flagged ?? []);
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

  const chunks: { startIdx: number; endIdx: number; ts: string }[] = [];
  let charCount = 0, chunkStart = 0, second = 0;
  for (let i = 0; i < tokens.length; i++) {
    charCount += tokens[i].length;
    if (charCount >= 300 || i === tokens.length - 1) {
      chunks.push({ startIdx: chunkStart, endIdx: i, ts: `${Math.floor(second / 60)}:${String(second % 60).padStart(2, "0")}` });
      chunkStart = i + 1; charCount = 0; second += 30;
    }
  }

  const handleWordClick = (e: React.MouseEvent<HTMLButtonElement>, globalIdx: number) => {
    e.stopPropagation();
    if (activePopover === globalIdx) { setActivePopover(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - 216);
    setPopoverStyle({ top: rect.bottom + 8, left: Math.max(left, 8) });
    setActivePopover(globalIdx);
  };

  const activeEntry = activePopover !== null ? flaggedMap.get(activePopover) : null;

  return (
    <div className="flex flex-col gap-4" onClick={() => setActivePopover(null)}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 600, color: "#f0f0f0" }}>
            Full Transcript
          </h2>
          {analyzing && (
            <span className="flex items-center gap-1.5" style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#52525b" }}>
              <span className="w-3 h-3 rounded-full animate-spin inline-block" style={{ border: "2px solid #333", borderTopColor: "#c96acb" }} />
              Checking…
            </span>
          )}
          {!analyzing && unreviewedCount > 0 && (
            <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", fontFamily: "var(--font-inter)", fontSize: 11, color: "#f59e0b" }}>
              <AlertTriangle size={10} />
              {unreviewedCount} {unreviewedCount === 1 ? "possible error" : "possible errors"}
            </span>
          )}
          {!analyzing && flagged.length > 0 && unreviewedCount === 0 && (
            <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", fontFamily: "var(--font-inter)", fontSize: 11, color: "#4ade80" }}>
              <Check size={10} /> All reviewed
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
          style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: copied ? "#c96acb" : "#555", background: "transparent", border: "1px solid #1a1a1a", cursor: "pointer" }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Accuracy note */}
      {!analyzing && unreviewedCount > 0 && (
        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
          <AlertTriangle size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#71717a", lineHeight: 1.5, margin: 0 }}>
            Due to accents or pronunciation, some words may be inaccurate.{" "}
            <span style={{ color: "#f59e0b" }}>Tap underlined words</span> to correct them.
          </p>
        </div>
      )}

      {/* Transcript scroll box */}
      <div style={{ background: "#0b0b0b", border: "1px solid #1a1a1a", borderRadius: 12, padding: "16px 20px", maxHeight: "55vh", overflowY: "auto" }}>
        {chunks.map((chunk, ci) => (
          <div key={ci} style={{ display: "flex", gap: 14, marginBottom: 18 }}>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: "#2a2a2a", flexShrink: 0, paddingTop: 3, minWidth: 34 }}>
              {chunk.ts}
            </span>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#888", lineHeight: 1.85, margin: 0, wordBreak: "break-word" }}>
              {tokens.slice(chunk.startIdx, chunk.endIdx + 1).map((token, localIdx) => {
                const globalIdx = chunk.startIdx + localIdx;
                if (/^\s+$/.test(token)) return <span key={localIdx}>{token}</span>;
                const isFlagged = flaggedMap.has(globalIdx) && !corrections[globalIdx];
                const isCorrected = !!corrections[globalIdx];
                if (!isFlagged && !isCorrected) return <span key={localIdx}>{token}</span>;
                return (
                  <button
                    key={localIdx}
                    onClick={(e) => handleWordClick(e, globalIdx)}
                    style={{
                      display: "inline", background: "none", border: "none",
                      padding: 0, margin: 0, fontFamily: "inherit",
                      fontSize: "inherit", lineHeight: "inherit", cursor: "pointer",
                      color: isCorrected ? "#c96acb" : "#f0f0f0",
                      borderBottom: isFlagged ? "2px solid #f59e0b" : "2px solid rgba(201,106,203,0.5)",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {corrections[globalIdx] ?? token}
                  </button>
                );
              })}
            </p>
          </div>
        ))}
      </div>

      {/* Portal popover — position fixed, always below the word */}
      {mounted && activePopover !== null && activeEntry && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9990 }} onClick={() => setActivePopover(null)} />
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: popoverStyle.top,
              left: popoverStyle.left,
              zIndex: 9999,
              width: 200,
              background: "#161616",
              border: "1px solid #2a2a2a",
              borderRadius: 10,
              padding: "10px 12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.85)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Did you mean?
            </span>
            {activeEntry.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setCorrections((p) => ({ ...p, [activePopover]: s })); setActivePopover(null); }}
                style={{
                  fontFamily: "var(--font-inter)", fontSize: 13, color: "#c96acb",
                  textAlign: "left", background: "rgba(201,106,203,0.08)",
                  border: "1px solid rgba(201,106,203,0.15)", borderRadius: 6,
                  padding: "5px 10px", cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => setActivePopover(null)}
              style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#444", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", paddingTop: 2 }}
            >
              Keep original
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}