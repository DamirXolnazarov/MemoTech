"use client";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { useEffect, useRef } from "react";

function WaveformVisual() {
  const heights = [18, 34, 28, 44, 22, 38, 16, 32, 40, 24, 36, 20];
  return (
    <div className="flex items-center gap-1">
      {heights.map((h, i) => (
        <div key={i} className="w-[3px] rounded-sm bg-[#c96acb]"
          style={{ height: `${h}px`, animation: `waveBar 1s ease-in-out ${i * 0.08}s infinite` }} />
      ))}
      <style>{`@keyframes waveBar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.3)} }`}</style>
    </div>
  );
}

function SummaryVisual() {
  return (
    <div className="w-full space-y-2">
      <div className="h-2.5 rounded-full" style={{ width: "55%", background: "rgba(201,106,203,0.2)" }} />
      {["92%","80%","60%","88%","75%"].map((w, i) => (
        <div key={i} className="h-2 rounded-full bg-[#2a2a2a]" style={{ width: w }} />
      ))}
    </div>
  );
}

function TasksVisual() {
  const tasks = [
    { done: true, label: "Read Chapter 7 — Metabolism", date: "Today" },
    { done: false, label: "Submit economics essay", date: "Mon 16" },
    { done: false, label: "Review lab slides with Dr. Aslan", date: "Thu 13" },
  ];
  return (
    <div className="w-full divide-y divide-[#1a1a1a]">
      {tasks.map((t) => (
        <div key={t.label} className="flex items-center gap-2.5 py-2.5 text-xs text-[#a1a1aa]">
          <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${t.done ? "bg-[#c96acb] border-[#c96acb]" : "border-[#2a2a2a]"}`}>
            {t.done && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <span className={t.done ? "line-through text-[#52525b] truncate" : "truncate"}>{t.label}</span>
          <span className="ml-auto text-[11px] text-[#52525b] flex-shrink-0">{t.date}</span>
        </div>
      ))}
    </div>
  );
}

function SearchVisual() {
  return (
    <div className="w-full space-y-3">
      <div className="border border-[#2a2a2a] rounded-xl px-3 py-3 text-xs text-[#a1a1aa] flex items-center gap-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span className="truncate">What did Prof. Karimov say about mitosis?</span>
      </div>
      <div className="rounded-xl p-4" style={{ background: "rgba(201,106,203,0.06)", border: "1px solid rgba(201,106,203,0.15)" }}>
        <p className="text-xs text-white leading-relaxed mb-2">Mitosis was described as having four stages — prophase, metaphase, anaphase, and telophase — with emphasis on spindle fiber alignment during metaphase.</p>
        <p className="text-[11px] text-[#c96acb]">↗ Biology 201 · Nov 4 · 38:22</p>
      </div>
    </div>
  );
}

const VISUALS: Record<string, React.ReactNode> = {
  recording: <WaveformVisual />,
  summary: <SummaryVisual />,
  tasks: <TasksVisual />,
  search: <SearchVisual />,
};

const STEPS = [
  { step: "01", title: "Press record", description: "Open Memo before your lecture, meeting, or conversation. One tap starts capturing everything — audio, live transcript, and automatic speaker labels.", visual: "recording" },
  { step: "02", title: "Memo understands", description: "The moment you stop recording, Memo processes the full transcript — generating a summary, key concepts, and pulling out action items automatically.", visual: "summary" },
  { step: "03", title: "Tasks, deadlines, done", description: "Every deadline, assignment, and follow-up is automatically added to your task list — with date, priority, and option to sync to your calendar.", visual: "tasks" },
  { step: "04", title: "Ask anything, instantly", description: "Three weeks later, ask Memo what your professor said about photosynthesis. It finds the exact moment and answers in plain language — from your own recordings.", visual: "search" },
];

export function HowItWorksSection() {
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const update = () => {
      const mid = window.innerHeight / 2;
      let closest = 0, closestDist = Infinity;
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const rect = row.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - mid);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        if (i === closest) {
          dot.style.background = "#c96acb";
          dot.style.borderColor = "#c96acb";
          dot.style.boxShadow = "0 0 14px rgba(201,106,203,0.5)";
        } else {
          dot.style.background = "#050505";
          dot.style.borderColor = "#2a2a2a";
          dot.style.boxShadow = "none";
        }
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <section id="how" className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 py-20 md:py-28 border-t border-[#1a1a1a]">
      <RevealOnScroll>
        <Eyebrow className="mb-4">How it works</Eyebrow>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.03em" }}>
          Four steps.<br />Zero effort.
        </h2>
      </RevealOnScroll>

      {/* Timeline — desktop: left border with dot; mobile: simple stacked cards */}
      <div className="mt-16 md:mt-20">
        {/* Desktop timeline */}
        <div className="hidden md:block ml-6 pl-12 border-l border-[#1a1a1a] divide-y divide-[#1a1a1a]">
          {STEPS.map((s, i) => (
            <RevealOnScroll key={s.step} delay={i * 60} className="py-16">
              <div ref={(el) => { rowRefs.current[i] = el; }} className="grid grid-cols-2 gap-20 items-center relative">
                <div
                  ref={(el) => { dotRefs.current[i] = el; }}
                  className="absolute -left-[61px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full border bg-[#050505] border-[#2a2a2a]"
                  style={{ transition: "background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease" }}
                />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c96acb] mb-3.5" style={{ fontFamily: "var(--font-syne)" }}>Step {s.step}</div>
                  <h3 className="text-2xl font-bold text-white mb-3.5" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.02em" }}>{s.title}</h3>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">{s.description}</p>
                </div>
                <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-8 min-h-[180px] flex items-center justify-center">
                  {VISUALS[s.visual]}
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* Mobile: simple stacked cards, no timeline chrome */}
        <div className="md:hidden space-y-4 mt-8">
          {STEPS.map((s) => (
            <div key={s.step} className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c96acb] mb-2" style={{ fontFamily: "var(--font-syne)" }}>Step {s.step}</div>
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.02em" }}>{s.title}</h3>
              <p className="text-sm text-[#a1a1aa] leading-relaxed mb-5">{s.description}</p>
              <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 flex items-center justify-center min-h-[120px]">
                {VISUALS[s.visual]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}