"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";

gsap.registerPlugin(ScrollTrigger);

const FEAT_LABELS = ["Summary", "Tasks", "Key Points", "Flashcards", "Recall"];

export function HeroSection() {
  const outerRef = useRef<HTMLDivElement>(null);
  const micRef = useRef<HTMLDivElement>(null);
  const humanRef = useRef<SVGSVGElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);
  const chopperwrapRef = useRef<HTMLDivElement>(null);
  const chopperLineRef = useRef<HTMLDivElement>(null);
  const featStageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const ctasRef = useRef<HTMLDivElement>(null);
  const scrollIndRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement[]>([]);
  const hwavesRef = useRef<HTMLDivElement[]>([]);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const splatRef = useRef<HTMLDivElement[]>([]);
  const dropRefs = useRef<HTMLDivElement[]>([]);
  const labelRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          onUpdate: (self) => {
            if (!scrollIndRef.current) return;
            gsap.to(scrollIndRef.current, { opacity: self.progress > 0.04 ? 0 : 1, duration: 0.3 });
          },
        },
      });

      ringsRef.current.forEach((r, i) => {
        tl.to(r, { scale: 3.5, opacity: 0, duration: 0.15, ease: "power2.out" }, i * 0.02);
      });
      tl.fromTo(humanRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.1 }, 0.1);
      tl.to(mouthRef.current, { attr: { d: "M22 19 Q30 27 38 19" }, duration: 0.07 }, 0.16);
      hwavesRef.current.forEach((w, i) => {
        tl.fromTo(w, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.08, ease: "power2.out" }, 0.2 + i * 0.012);
        tl.to(w, { x: 200, opacity: 0, duration: 0.1, ease: "power2.in" }, 0.29 + i * 0.012);
      });
      tl.to(humanRef.current, { opacity: 0, x: -40, duration: 0.08 }, 0.36);
      tl.to(micRef.current, { scale: 2.6, duration: 0.14, ease: "power3.inOut" }, 0.38);
      ringsRef.current.forEach((r, i) => {
        tl.fromTo(r, { scale: 0.7, opacity: 0.85 }, { scale: 5, opacity: 0, duration: 0.1, ease: "power2.out" }, 0.38 + i * 0.022);
      });
      particlesRef.current.forEach((p) => {
        tl.to(p, { opacity: Math.random() * 0.4 + 0.1, duration: 0.06 }, 0.44);
      });
      tl.to(micRef.current, { scale: 1, opacity: 0.2, duration: 0.07 }, 0.53);
      tl.to(chopperwrapRef.current, { opacity: 1, duration: 0.02 }, 0.55);
      tl.fromTo(chopperLineRef.current, { left: "-100%" }, { left: "110%", duration: 0.1, ease: "power3.inOut" }, 0.56);
      tl.fromTo(chopperLineRef.current, { left: "-100%" }, { left: "110%", duration: 0.08, ease: "power2.inOut" }, 0.69);
      tl.to(chopperwrapRef.current, { opacity: 0, duration: 0.02 }, 0.78);
      splatRef.current.forEach((d, i) => {
        const angle = (i / splatRef.current.length) * Math.PI * 2;
        const dist = 50 + Math.random() * 120;
        tl.fromTo(d, { opacity: 1, x: 0, y: 0, scale: 0 }, { opacity: 0, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 1.5 + Math.random(), duration: 0.1 }, 0.78);
      });
      particlesRef.current.forEach((p) => { tl.to(p, { opacity: 0, duration: 0.06 }, 0.79); });
      tl.to(micRef.current, { opacity: 0, scale: 0.7, duration: 0.06 }, 0.81);
      tl.to(featStageRef.current, { opacity: 1, duration: 0.03 }, 0.83);
      dropRefs.current.forEach((d, i) => {
        const t = 0.84 + i * 0.024;
        tl.to(d, { opacity: 1, y: 0, scaleY: 1.5, scaleX: 0.7, duration: 0.04, ease: "power2.out" }, t);
        tl.to(d, { scaleY: 0.35, scaleX: 3.5, opacity: 0.4, duration: 0.025 }, t + 0.04);
        tl.to(d, { scaleX: 0, opacity: 0, duration: 0.02 }, t + 0.065);
      });
      labelRefs.current.forEach((l, i) => { tl.to(l, { opacity: 1, y: 0, duration: 0.05 }, 0.865 + i * 0.024); });
      tl.to(featStageRef.current, { opacity: 0, y: 24, duration: 0.05 }, 0.93);
      tl.to(headlineRef.current, { opacity: 1, duration: 0.06, ease: "power2.out" }, 0.94);
      tl.to(ctasRef.current, { opacity: 1, duration: 0.05 }, 0.97);
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={outerRef} style={{ height: "600vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center" style={{ background: "rgba(0,0,0,0.94)" }}>

        {/* Scroll indicator */}
        <div ref={scrollIndRef} className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-10">
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#52525b]">Scroll</span>
          <div className="w-5 h-5 border-r border-b border-[#52525b] rotate-45" style={{ animation: "arrowBounce 1.8s ease-in-out infinite" }} />
        </div>

        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} ref={(el) => { if (el) particlesRef.current[i] = el; }}
              className="absolute rounded-full bg-[#c96acb] opacity-0"
              style={{ width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} />
          ))}
        </div>

        {/* Human */}
        <svg ref={humanRef} viewBox="0 0 60 120" fill="none" xmlns="http://www.w3.org/2000/svg"
          className="absolute opacity-0"
          style={{ width: "80px", left: "calc(50% - 240px)", top: "50%", transform: "translateY(-50%)" }}>
          <circle cx="30" cy="15" r="12" fill="rgba(255,255,255,0.92)" />
          <path ref={mouthRef} d="M22 19 Q30 22 38 19" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <rect x="15" y="30" width="30" height="38" rx="9" fill="rgba(255,255,255,0.88)" />
          <rect x="3" y="32" width="13" height="26" rx="6" fill="rgba(255,255,255,0.72)" />
          <rect x="44" y="32" width="13" height="26" rx="6" fill="rgba(255,255,255,0.72)" />
          <rect x="17" y="68" width="11" height="32" rx="5" fill="rgba(255,255,255,0.75)" />
          <rect x="32" y="68" width="11" height="32" rx="5" fill="rgba(255,255,255,0.75)" />
        </svg>

        {/* Human waves */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} ref={(el) => { if (el) hwavesRef.current[i] = el; }}
            className="absolute h-[1.5px] rounded-full bg-[#c96acb] opacity-0 origin-left"
            style={{ width: `${24 + i * 18}px`, left: "calc(50% - 215px)", top: `calc(50% + ${(i - 2) * 16}px)` }} />
        ))}

        {/* Mic */}
        <div ref={micRef} className="absolute flex flex-col items-center z-20">
          <svg viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "72px", height: "72px" }}>
            <rect x="24" y="8" width="24" height="36" rx="12" fill="white" />
            <path d="M14 34C14 48 58 48 58 34" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <line x1="36" y1="48" x2="36" y2="60" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="24" y1="60" x2="48" y2="60" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0">
            {Array.from({ length: 5 }).map((_, i) => {
              const s = 80 + i * 56;
              return (
                <div key={i} ref={(el) => { if (el) ringsRef.current[i] = el; }}
                  className="absolute rounded-full opacity-0"
                  style={{ width: `${s}px`, height: `${s}px`, left: `${36 - s / 2}px`, top: `${36 - s / 2}px`, border: "1px solid rgba(201,106,203,0.45)" }} />
              );
            })}
          </div>
        </div>

        {/* Chopper */}
        <div ref={chopperwrapRef} className="absolute inset-0 pointer-events-none opacity-0 overflow-hidden">
          <div ref={chopperLineRef} className="absolute top-1/2 h-[1px]"
            style={{ left: "-100%", width: "100%", background: "linear-gradient(90deg, transparent, #c96acb 40%, #fff 50%, #c96acb 60%, transparent)", boxShadow: "0 0 10px #c96acb" }} />
        </div>

        {/* Splat */}
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} ref={(el) => { if (el) splatRef.current[i] = el; }}
            className="absolute w-1 h-1 rounded-full bg-[#c96acb] opacity-0"
            style={{ left: "50%", top: "50%" }} />
        ))}

        {/* Feature drops */}
        <div ref={featStageRef} className="absolute flex gap-10 items-end opacity-0" style={{ bottom: "80px" }}>
          {FEAT_LABELS.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-2.5">
              <div ref={(el) => { if (el) dropRefs.current[i] = el; }}
                className="w-1.5 h-3 opacity-0 bg-[#c96acb]"
                style={{ transform: "translateY(-80px)", borderRadius: "50% 50% 50% 50% / 35% 35% 65% 65%", boxShadow: "0 0 8px rgba(201,106,203,0.4)" }} />
              <div ref={(el) => { if (el) labelRefs.current[i] = el; }}
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white opacity-0"
                style={{ fontFamily: "var(--font-syne)", transform: "translateY(10px)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Final headline */}
        <div ref={headlineRef} className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 pointer-events-none px-6">
          <h1 className="font-extrabold leading-none text-white" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.04em", fontSize: "clamp(44px, 7.5vw, 96px)" }}>
            Never lose<br />what{" "}
            <em className="not-italic" style={{ color: "#c96acb" }}>matters.</em>
          </h1>
          <p className="mt-5 text-[#a1a1aa] max-w-md leading-relaxed" style={{ fontSize: "17px" }}>
            Record lectures, meetings, and conversations. Turn them into searchable knowledge with AI-powered summaries, tasks, flashcards, and memory recall.
          </p>
        </div>

        {/* CTAs */}
        <div ref={ctasRef} className="absolute flex gap-3.5 items-center opacity-0" style={{ top: "calc(50% + 200px)" }}>
          <Button variant="primary" size="lg" href="/demo">Get started free</Button>
          <Button variant="outline" size="lg" href="#how">See how it works</Button>
        </div>

        <style>{`@keyframes arrowBounce { 0%,100%{transform:rotate(45deg) translateY(0)} 50%{transform:rotate(45deg) translateY(4px)} }`}</style>
      </div>
    </div>
  );
}
