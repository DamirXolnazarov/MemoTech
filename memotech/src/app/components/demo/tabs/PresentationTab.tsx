"use client";

import { useState, useEffect } from "react";
import { Presentation, Download, RefreshCw, Loader2, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type Style = "minimal" | "academic" | "pitch";
type State = "idle" | "generating" | "done" | "error";

interface SlidePreview {
  slideNumber: number;
  title: string;
  type: string;
}

interface GenerationResult {
  pptxBase64: string;
  slideCount: number;
  title: string;
  slides: SlidePreview[];
}

interface StatusLine {
  label: string;
  done: boolean;
}

const STATUS_LINES = [
  "Analysing transcript...",
  "Structuring slides...",
  "Writing slide content...",
  "Building PowerPoint file...",
];

const STYLE_OPTIONS: { id: Style; label: string; description: string }[] = [
  { id: "minimal", label: "Minimal", description: "Clean, dark, lots of whitespace" },
  { id: "academic", label: "Academic", description: "Structured, formal, dense" },
  { id: "pitch", label: "Pitch Deck", description: "Bold, impactful, investor-style" },
];

function StylePreviewSVG({ style }: { style: Style }) {
  if (style === "minimal") {
    return (
      <svg width="72" height="46" viewBox="0 0 72 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="72" height="46" rx="3" fill="#0a0a0a" />
        <rect x="8" y="10" width="30" height="4" rx="1" fill="#ffffff" opacity="0.9" />
        <rect x="8" y="18" width="20" height="2" rx="1" fill="#a1a1aa" opacity="0.6" />
        <rect x="8" y="26" width="56" height="1.5" rx="0.75" fill="#c96acb" opacity="0.4" />
        <rect x="8" y="32" width="40" height="1.5" rx="0.75" fill="#a1a1aa" opacity="0.3" />
        <rect x="8" y="36" width="32" height="1.5" rx="0.75" fill="#a1a1aa" opacity="0.3" />
      </svg>
    );
  }
  if (style === "academic") {
    return (
      <svg width="72" height="46" viewBox="0 0 72 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="72" height="46" rx="3" fill="#0a0a0a" />
        <rect width="72" height="9" rx="3" fill="#1a1a1a" />
        <rect x="4" y="2" width="28" height="4" rx="1" fill="#ffffff" opacity="0.85" />
        <rect x="8" y="14" width="56" height="1.5" rx="0.75" fill="#ffffff" opacity="0.7" />
        <rect x="8" y="18" width="48" height="1.5" rx="0.75" fill="#ffffff" opacity="0.5" />
        <rect x="8" y="22" width="52" height="1.5" rx="0.75" fill="#ffffff" opacity="0.5" />
        <rect x="8" y="26" width="44" height="1.5" rx="0.75" fill="#ffffff" opacity="0.5" />
        <rect x="8" y="30" width="50" height="1.5" rx="0.75" fill="#ffffff" opacity="0.5" />
        <rect x="60" y="40" width="8" height="2" rx="1" fill="#666" opacity="0.6" />
      </svg>
    );
  }
  // pitch
  return (
    <svg width="72" height="46" viewBox="0 0 72 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="72" height="46" rx="3" fill="#050505" />
      <rect x="10" y="8" width="52" height="7" rx="1" fill="#ffffff" opacity="0.95" />
      <rect x="20" y="20" width="32" height="5" rx="1" fill="#c96acb" opacity="0.9" />
      <rect x="24" y="30" width="24" height="2" rx="1" fill="#ffffff" opacity="0.4" />
      <rect x="0" y="42" width="72" height="4" rx="0" fill="#c96acb" opacity="0.8" />
    </svg>
  );
}

function SlideLayoutHint({ type }: { type: string }) {
  return (
    <div className="flex flex-col gap-1 w-full px-2 pt-1">
      {type === "title" ? (
        <>
          <div className="h-2 w-3/4 mx-auto rounded bg-white/20" />
          <div className="h-1 w-1/2 mx-auto rounded bg-white/10 mt-1" />
        </>
      ) : type === "agenda" ? (
        <>
          {[0.7, 0.6, 0.8, 0.55].map((w, i) => (
            <div key={i} className="h-1 rounded bg-white/15" style={{ width: `${w * 100}%` }} />
          ))}
        </>
      ) : type === "summary" ? (
        <>
          <div className="h-1.5 w-2/3 rounded bg-[#c96acb]/40 mb-1" />
          {[0.8, 0.7, 0.75].map((w, i) => (
            <div key={i} className="h-1 rounded bg-white/15" style={{ width: `${w * 100}%` }} />
          ))}
        </>
      ) : (
        <>
          <div className="h-1 w-3/4 rounded bg-white/20 mb-1" />
          {[0.9, 0.75, 0.85].map((w, i) => (
            <div key={i} className="h-1 rounded bg-white/12" style={{ width: `${w * 100}%` }} />
          ))}
          <div className="h-1 w-2/3 rounded bg-[#c96acb]/30 mt-1" />
        </>
      )}
    </div>
  );
}

export function PresentationTab({ transcript }: { transcript: string }) {
  const [uiState, setUiState] = useState<State>("idle");
  const [selectedStyle, setSelectedStyle] = useState<Style>("minimal");
  const [statusLines, setStatusLines] = useState<StatusLine[]>([]);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string>("");
  const [visibleLines, setVisibleLines] = useState(0);

  const resetToIdle = () => {
    setUiState("idle");
    setStatusLines([]);
    setVisibleLines(0);
    setError("");
    setResult(null);
  };

  const handleGenerate = async () => {
    setUiState("generating");
    setStatusLines(STATUS_LINES.map((label) => ({ label, done: false })));
    setVisibleLines(0);

    // Stagger the appearance of status lines
    const delays = [0, 600, 1200, 2000];
    delays.forEach((delay, i) => {
      setTimeout(() => setVisibleLines((v) => Math.max(v, i + 1)), delay);
    });

    // Mark lines as done at realistic intervals
    const doneDelays = [800, 1600, 2600, 0]; // last one done when API returns
    doneDelays.slice(0, 3).forEach((delay, i) => {
      setTimeout(() => {
        setStatusLines((prev) =>
          prev.map((l, idx) => (idx === i ? { ...l, done: true } : l))
        );
      }, delay);
    });

    try {
      const res = await fetch("/api/generate-presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, style: selectedStyle }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data: GenerationResult = await res.json();

      // Mark last line done
      setStatusLines((prev) => prev.map((l, i) => (i === 3 ? { ...l, done: true } : l)));

      setTimeout(() => {
        setResult(data);
        setUiState("done");
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setUiState("error");
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([Buffer.from(result.pptxBase64, "base64")], {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title}.pptx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in fade-in duration-200 ease-out space-y-6">
      {/* Generation card */}
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300",
          uiState === "done" && "p-4"
        )}
      >
        {uiState === "idle" && (
          <div className="flex flex-col items-center gap-6">
            {/* Icon + heading */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c96acb]/10">
                <Presentation size={36} className="text-[#c96acb]" />
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-syne)" }} className="text-xl font-bold text-white">
                  Generate Presentation
                </h3>
                <p className="mt-1 text-sm text-zinc-400 max-w-sm">
                  Turn your recording into a full slide deck — title slide, agenda, one slide per key concept, summary slide.
                </p>
              </div>
            </div>

            {/* Style selector */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
              {STYLE_OPTIONS.map(({ id, label, description }) => (
                <button
                  key={id}
                  onClick={() => setSelectedStyle(id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all duration-150",
                    selectedStyle === id
                      ? "border-[#c96acb] bg-[#c96acb]/8 shadow-[0_0_12px_rgba(201,106,203,0.15)]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  )}
                >
                  <StylePreviewSVG style={id} />
                  <div>
                    <p
                      style={{ fontFamily: "var(--font-syne)" }}
                      className={cn(
                        "text-xs font-bold",
                        selectedStyle === id ? "text-[#c96acb]" : "text-white"
                      )}
                    >
                      {label}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="w-full max-w-lg space-y-2">
              <Button variant="primary" size="lg" className="w-full" onClick={handleGenerate}>
                Generate Presentation
              </Button>
              <p className="text-center text-[11px] text-zinc-600">Powered by Claude + pptxgenjs</p>
            </div>
          </div>
        )}

        {uiState === "generating" && (
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-[#c96acb]" />
              <span style={{ fontFamily: "var(--font-syne)" }} className="text-sm font-semibold text-white">
                Building your presentation…
              </span>
            </div>
            <div className="w-full max-w-xs space-y-2">
              {STATUS_LINES.map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "flex items-center gap-2.5 transition-all duration-300",
                    i < visibleLines ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
                  )}
                >
                  {statusLines[i]?.done ? (
                    <CheckCircle2 size={14} className="text-[#c96acb] shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border border-zinc-600 shrink-0 relative overflow-hidden">
                      {i < visibleLines && (
                        <div className="absolute inset-0 rounded-full bg-[#c96acb]/20 animate-pulse" />
                      )}
                    </div>
                  )}
                  <span className={cn("text-sm", statusLines[i]?.done ? "text-zinc-300" : "text-zinc-500")}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {uiState === "done" && result && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#c96acb]" />
              <span style={{ fontFamily: "var(--font-syne)" }} className="text-sm font-bold text-white">
                {result.title}
              </span>
            </div>
            <span className="text-xs text-zinc-500 shrink-0">
              {result.slideCount} slides • {STYLE_OPTIONS.find((s) => s.id === selectedStyle)?.label}
            </span>
          </div>
        )}

        {uiState === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={18} />
              <span style={{ fontFamily: "var(--font-syne)" }} className="text-sm font-semibold">
                Generation failed
              </span>
            </div>
            <p className="text-xs text-zinc-500 text-center max-w-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={resetToIdle}>
              Try again
            </Button>
          </div>
        )}
      </div>

      {/* Slide previews */}
      {uiState === "done" && result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
          {/* Horizontal scroll row */}
          <div className="overflow-x-auto pb-2 -mx-1 px-1">
            <div className="flex gap-3" style={{ width: "max-content" }}>
              {result.slides.map((slide) => (
                <div
                  key={slide.slideNumber}
                  className="group relative flex flex-col rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#c96acb]/50 transition-all duration-150 overflow-hidden"
                  style={{ width: 200, height: 130, flexShrink: 0 }}
                >
                  {/* Slide number badge */}
                  <div className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#c96acb]/15 border border-[#c96acb]/30">
                    <span className="text-[9px] font-bold text-[#c96acb]">{slide.slideNumber}</span>
                  </div>

                  {/* Layout hint */}
                  <div className="flex-1 pt-8">
                    <SlideLayoutHint type={slide.type} />
                  </div>

                  {/* Title */}
                  <div className="px-2 pb-2">
                    <p
                      style={{ fontFamily: "var(--font-syne)", fontSize: 10 }}
                      className="text-white/80 truncate text-center font-semibold leading-tight"
                    >
                      {slide.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="primary" size="lg" onClick={handleDownload} className="flex items-center gap-2">
              <Download size={16} />
              Download .pptx
            </Button>
            <Button variant="ghost" size="lg" onClick={resetToIdle} className="flex items-center gap-2">
              <RefreshCw size={14} />
              Regenerate
            </Button>
          </div>

          <p className="text-xs text-zinc-600">
            {result.slideCount} slides generated&nbsp;•&nbsp;Style:{" "}
            {STYLE_OPTIONS.find((s) => s.id === selectedStyle)?.label}
          </p>
        </div>
      )}
    </div>
  );
}