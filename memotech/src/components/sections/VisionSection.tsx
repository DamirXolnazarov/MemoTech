"use client";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ROADMAP } from "@/lib/constants";
import { useEffect, useRef } from "react";

export function VisionSection() {
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const update = () => {
      const mid = window.innerHeight / 2;
      let closest = 0;
      let closestDist = Infinity;
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const rect = row.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - mid);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        if (i === closest) {
          dot.style.background = "#c96acb";
          dot.style.borderColor = "#c96acb";
          dot.style.boxShadow = "0 0 16px rgba(201,106,203,0.5)";
        } else {
          dot.style.background = "#0b0b0b";
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
    <section id="vision" className="max-w-6xl mx-auto px-12 py-28 border-t border-[#1a1a1a]">
      <RevealOnScroll>
        <Eyebrow className="mb-4">Where we&apos;re going</Eyebrow>
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white mb-5" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.03em" }}>
          Today: Memo.<br />Tomorrow: Human Memory OS.
        </h2>
        <p className="text-lg text-[#a1a1aa] max-w-lg leading-relaxed">
          We&apos;re starting with the app. Once memory is validated at scale, we go further.
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={100} className="mt-20">
        <div className="relative">
          <div className="absolute left-8 top-2 bottom-2 w-px bg-[#1a1a1a]" />
          <div className="space-y-0">
            {ROADMAP.map((item, i) => (
              <div
                key={item.title}
                ref={(el) => { rowRefs.current[i] = el; }}
                className="relative flex gap-10 pb-14 pl-20"
              >
                {/* Scroll-driven dot */}
                <div
                  ref={(el) => { dotRefs.current[i] = el; }}
                  className="absolute left-6 top-1.5 w-[18px] h-[18px] rounded-full border bg-[#0b0b0b] border-[#2a2a2a]"
                  style={{ transition: "background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease" }}
                />
                <div className={`min-w-[80px] text-[11px] font-semibold uppercase tracking-[0.15em] pt-1 ${item.current ? "text-[#c96acb]" : "text-[#52525b]"}`}
                  style={{ fontFamily: "var(--font-syne)" }}>
                  {item.label}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold tracking-tight mb-1.5 ${item.current ? "text-white" : "text-[#52525b]"}`}
                    style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.02em" }}>
                    {item.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${item.current ? "text-[#a1a1aa]" : "text-[#3f3f46]"}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}