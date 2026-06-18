"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ORCHID = "#c96acb";

/* ─── Demo cards ─────────────────────────────────────────────────────────── */
const CARDS = [
  {
    label: "Summary",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ORCHID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    body: "Team agreed to delay launch to Q2. Stakeholders aligned on revised timeline and budget.",
  },
  {
    label: "Tasks",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ORCHID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    body: "✓ Update roadmap  ○ Email stakeholders  ○ Review budget",
  },
  {
    label: "Key Points",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ORCHID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    body: "• Budget increased 15%  • New PM assigned  • Beta ships March",
  },
  {
    label: "Flashcards",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ORCHID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    body: "Q: New ship date? → A: Q2, April window.",
  },
  {
    label: "Recall",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ORCHID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    body: "\"Vendors?\" — 3 months ago, shortlist narrowed to two finalists.",
  },
];

/* ─── Speaking head SVG — exact paths from uploaded icon, white fill ─────── */
function PersonSVG({ wrapRef }: { wrapRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        left: "5vw",
        top: "50%",
        transform: "translateY(-52%)",
        zIndex: 6,
        pointerEvents: "none",
        opacity: 0,
      }}
    >
      <svg
        width="280"
        height="280"
        viewBox="0 0 64 64"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Body + face (the main speaking-head silhouette) */}
        <path d="M38.478 42.632c-4.644-1.466-3.322-2.633 1.11-4.298c2.123-.799.832-2.484.89-3.832c.026-.617 2.452-.494 2.276-2.874c-.124-1.676-3.816-4.064-4.822-5.083c-.581-.588 1.184-2.197-.059-3.612c-1.697-1.934-1.965-5.299-2.992-7.181c0 0 .783-1.196.183-1.876c-5.176-5.859-24.491-5.321-29.427 3.302c-5.541 9.68-5.615 23.059 5.906 30.267C16.667 50.65 10.104 62 10.104 62h20.319c0-1.938-2.266-8.89 1.7-8.578c3.446.271 7.666.122 7.292-3.77c-.113-1.174-.246-2.231.574-3.204c.82-.972 2.007-2.706-1.511-3.816" />
        {/* Sound wave arc 1 (closest to mouth) */}
        <path d="M43.129 40.805L62 43.277v-4.943z" />
        {/* Sound wave arc 2 */}
        <path d="M58.46 57.081l2.024-4.281l-17.355-9.368z" />
        {/* Sound wave arc 3 (furthest) */}
        <path d="M60.484 28.766l-2.024-4.282l-15.331 13.651z" />
      </svg>
    </div>
  );
}

/* ─── Mouth arc waves (ORCHID arcs that animate from person toward mic) ──── */
function MouthWaves({ waveRefs }: {
  waveRefs: React.MutableRefObject<SVGPathElement[]>;
}) {
  const arcs = [
    "M 0,-18 A 18,18 0 0,1 0,18",
    "M 0,-32 A 32,32 0 0,1 0,32",
    "M 0,-50 A 50,50 0 0,1 0,50",
    "M 0,-70 A 70,70 0 0,1 0,70",
    "M 0,-94 A 94,94 0 0,1 0,94",
  ];
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5, overflow: "visible" }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Origin at roughly where the person's mouth is: ~340px from left, vertically centered */}
      <g transform="translate(340,450)">
        {arcs.map((d, i) => (
          <path
            key={i}
            ref={(el) => { if (el) waveRefs.current[i] = el; }}
            d={d}
            fill="none"
            stroke={ORCHID}
            strokeWidth={2.6 - i * 0.35}
            strokeLinecap="round"
            opacity={0}
          />
        ))}
      </g>
    </svg>
  );
}

/* ─── Mic SVG ────────────────────────────────────────────────────────────── */
function MicSVG({ svgRef }: { svgRef: React.RefObject<SVGSVGElement | null> }) {
  return (
    <svg ref={svgRef} width="100" height="128" viewBox="0 0 100 128" fill="none" style={{ overflow: "visible" }}>
      <rect x="30" y="4" width="40" height="60" rx="20" fill="white" />
      <line x1="30" y1="26" x2="70" y2="26" stroke="#050505" strokeWidth="2" strokeLinecap="round" opacity={0.3} />
      <line x1="30" y1="36" x2="70" y2="36" stroke="#050505" strokeWidth="2" strokeLinecap="round" opacity={0.3} />
      <line x1="30" y1="46" x2="70" y2="46" stroke="#050505" strokeWidth="2" strokeLinecap="round" opacity={0.3} />
      <path d="M14 50 Q14 88 50 88 Q86 88 86 50" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
      <line x1="50" y1="88" x2="50" y2="110" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <line x1="26" y1="110" x2="74" y2="110" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Radial circles from mic center ────────────────────────────────────── */
function RadialCircles({ circleRefs }: {
  circleRefs: React.MutableRefObject<SVGCircleElement[]>;
}) {
  return (
    <svg
      className="radial-circles-svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3, overflow: "visible" }}
    >
      <g transform="translate(720,440)">
        {[55, 120, 195, 280, 375, 480].map((r, i) => (
          <circle
            key={i}
            ref={(el) => { if (el) circleRefs.current[i] = el; }}
            cx={0} cy={0} r={r}
            fill="none"
            stroke={ORCHID}
            strokeWidth={1.8 - i * 0.18}
            opacity={0}
          />
        ))}
      </g>
    </svg>
  );
}

/* ─── Demo cards fanned around center ───────────────────────────────────── */
const CARD_POSITIONS = [
  { left: "50%",  top: "15%",   transform: "translateX(-50%)" },  // top center
  { left: "67%",  top: "42%",  transform: "translateX(0)" },      // right
  { left: "50%",  top: "67%",  transform: "translateX(-50%)" },  // bottom center
  { left: "20%",   top: "42%",  transform: "translateX(0)" },      // left
  { left: "50%",  top: "41%",  transform: "translateX(-50%)" },  // center (inside circle)
];

function DemoCards({ wrapRef, cardRefs }: {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  cardRefs: React.MutableRefObject<HTMLDivElement[]>;
}) {
  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 9, opacity: 0 }}>
      {CARDS.map((card, i) => (
        <div
          key={card.label}
          ref={(el) => { if (el) cardRefs.current[i] = el; }}
          style={{
            position: "absolute",
  left: CARD_POSITIONS[i].left,
  top: CARD_POSITIONS[i].top,
  transform: CARD_POSITIONS[i].transform,   // ← add this line
  width: 185,
            background: "rgba(8,8,8,0.88)",
            border: "1px solid rgba(201,106,203,0.28)",
            borderRadius: 14,
            padding: "14px 16px",
            backdropFilter: "blur(14px)",
            opacity: 0,
            boxShadow: `0 0 40px rgba(201,106,203,0.12)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-syne, Syne, sans-serif)", fontWeight: 700, fontSize: 12, color: ORCHID, letterSpacing: "0.06em", marginBottom: 8 }}>
            {card.icon}
            {card.label}
          </div>
          <p style={{ fontSize: 11, lineHeight: 1.65, color: "#a1a1aa", margin: 0 }}>
            {card.body}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ─── Scroll timeline dot indicator (active dot = centered section) ───────── */
const PHASES = ["Intro", "Speaking", "Signal", "Insights", "Result"];

function ScrollDots({ dotRefs, activeDotRefs }: {
  dotRefs: React.MutableRefObject<HTMLDivElement[]>;
  activeDotRefs: React.MutableRefObject<HTMLDivElement[]>;
}) {
  return (
    <div style={{ position: "absolute", left: 28, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 20, pointerEvents: "none" }}>
      {PHASES.map((label, i) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Outer ring */}
          <div
            ref={(el) => { if (el) dotRefs.current[i] = el; }}
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: `1.5px solid rgba(201,106,203,0.35)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Inner active dot */}
            <div
              ref={(el) => { if (el) activeDotRefs.current[i] = el; }}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: ORCHID,
                boxShadow: `0 0 8px ${ORCHID}`,
                opacity: i === 0 ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-inter, Inter, sans-serif)" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export function HeroSection() {
  const wrapperRef      = useRef<HTMLDivElement>(null);
  const micWrapRef      = useRef<HTMLDivElement>(null);
  const micSvgRef       = useRef<SVGSVGElement>(null);
  const personWrapRef   = useRef<HTMLDivElement>(null);
  const mouthWaveRefs   = useRef<SVGPathElement[]>([]);
  const circleRefs      = useRef<SVGCircleElement[]>([]);
  const cardsWrapRef    = useRef<HTMLDivElement>(null);
  const cardRefs        = useRef<HTMLDivElement[]>([]);
  const headlineRef     = useRef<HTMLDivElement>(null);
  const indicatorRef    = useRef<HTMLDivElement>(null);
  const dotRefs         = useRef<HTMLDivElement[]>([]);
  const activeDotRefs   = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Phase boundaries (0–1 scroll progress → which dot lights up)
    const phaseBoundaries = [0, 0.18, 0.38, 0.62, 0.82];

    function setActiveDot(index: number) {
      activeDotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        dot.style.opacity = i === index ? "1" : "0";
      });
    }

    const gsapCtx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.4,
          onUpdate(self) {
            const p = self.progress;
            let activePhase = 0;
            for (let i = phaseBoundaries.length - 1; i >= 0; i--) {
              if (p >= phaseBoundaries[i]) { activePhase = i; break; }
            }
            setActiveDot(activePhase);
          },
        },
      });

      /* ── Phase 1 (0 → 0.18): Mic + idle scroll indicator ── */
      tl.to(indicatorRef.current, { opacity: 0, duration: 0.06 }, 0.12);

      /* ── Phase 2 (0.18 → 0.38): Person slides in, mouth waves pulse ── */
      tl.fromTo(personWrapRef.current,
        { opacity: 0, x: -120 },
        { opacity: 1, x: 0, duration: 0.14, ease: "power3.out" },
        0.18
      );
      mouthWaveRefs.current.forEach((w, i) => {
        const s = 0.22 + i * 0.026;
        tl.fromTo(w,
          { opacity: 0, scale: 0.3, transformOrigin: "0px 0px" },
          { opacity: 0.8 - i * 0.12, scale: 1, transformOrigin: "0px 0px", duration: 0.10, ease: "power2.out" },
          s
        );
        tl.to(w, { opacity: 0, duration: 0.06, ease: "power2.in" }, s + 0.12);
      });
      tl.to(personWrapRef.current, { opacity: 0, x: -80, duration: 0.08, ease: "power2.in" }, 0.36);

      /* ── Phase 3 (0.38 → 0.60): Mic zooms, radial circles burst ── */
      tl.to(micWrapRef.current, {
        scale: 2.8,
        duration: 0.16,
        ease: "power3.inOut",
        transformOrigin: "50% 50%",
      }, 0.38);

      circleRefs.current.forEach((c, i) => {
        tl.fromTo(c,
          { attr: { r: 0 }, opacity: 0 },
          { attr: { r: 55 + i * 85 }, opacity: 0.55 - i * 0.07, duration: 0.14, ease: "power2.out" },
          0.42 + i * 0.022
        );
      });

      /* ── Phase 4 (0.60 → 0.82): Zoom deep, mic vanishes, circles fill screen ── */
      tl.to(micWrapRef.current, {
        scale: 8,
        opacity: 0,
        duration: 0.16,
        ease: "power3.in",
        transformOrigin: "50% 50%",
      }, 0.60);

      tl.to(".radial-circles-svg", {
        scale: 3.6,
        transformOrigin: "50% 49%",
        duration: 0.20,
        ease: "power3.in",
      }, 0.60);

      /* Cards emerge */
      tl.to(cardsWrapRef.current, { opacity: 1, duration: 0.04 }, 0.68);
      cardRefs.current.forEach((card, i) => {
        tl.fromTo(card,
          { opacity: 0, scale: 0.86, y: 18 },
          { opacity: 1, scale: 1, y: 0, duration: 0.08, ease: "back.out(1.5)" },
          0.70 + i * 0.030
        );
      });

      /* ── Phase 5 (0.82 → 1.0): Cards out, headline in ── */
      tl.to([cardsWrapRef.current, ".radial-circles-svg"], { opacity: 0, duration: 0.07 }, 0.83);
      tl.fromTo(headlineRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.07, ease: "power2.out" },
        0.90
      );
    }, wrapperRef);

    return () => gsapCtx.revert();
  }, []);

  return (
    <div ref={wrapperRef} style={{ height: "700vh", position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          /* Deep background with visible orchid hue glow */
          background: `
            radial-gradient(ellipse 70% 55% at 50% 48%, rgba(201,106,203,0.22) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 60%, rgba(201,106,203,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 35% 35% at 80% 35%, rgba(201,106,203,0.10) 0%, transparent 60%),
            #050505
          `,
        }}
      >
        {/* Side scroll dots */}
        <ScrollDots dotRefs={dotRefs} activeDotRefs={activeDotRefs} />

        {/* Person */}
        <PersonSVG wrapRef={personWrapRef} />

        {/* Mouth arc waves */}
        <MouthWaves waveRefs={mouthWaveRefs} />

        {/* Mic */}
        <div
          ref={micWrapRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -52%)",
            zIndex: 5,
            pointerEvents: "none",
          }}
        >
          <MicSVG svgRef={micSvgRef} />
        </div>

        {/* Radial circles */}
        <RadialCircles circleRefs={circleRefs} />

        {/* Demo cards */}
        <DemoCards wrapRef={cardsWrapRef} cardRefs={cardRefs} />

        {/* Final headline */}
        <div
          ref={headlineRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
            opacity: 0,
            zIndex: 15,
            textAlign: "center",
            padding: "0 24px",
            pointerEvents: "none",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontWeight: 800,
              fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
              lineHeight: 1.07,
              letterSpacing: "-0.02em",
              color: "white",
            }}
          >
            Never lose<br />what <span style={{ color: ORCHID }}>matters.</span>
          </h1>
          <p
            style={{
              fontFamily: "var(--font-inter, Inter, sans-serif)",
              fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)",
              color: "#a1a1aa",
              maxWidth: 420,
              lineHeight: 1.65,
            }}
          >
            MemoTech listens, understands, and surfaces exactly what you need —
            the moment you need it.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", pointerEvents: "all" }}>
            <button style={{ background: ORCHID, color: "white", border: "none", borderRadius: 9, padding: "13px 28px", fontFamily: "var(--font-inter, Inter, sans-serif)", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer" }}>
              Get started free
            </button>
            <button style={{ background: "transparent", color: "white", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 9, padding: "12px 28px", fontFamily: "var(--font-inter, Inter, sans-serif)", fontWeight: 500, fontSize: "0.95rem", cursor: "pointer" }}>
              See how it works
            </button>
          </div>
        </div>

        {/* Scroll indicator arrow */}
        <div
          ref={indicatorRef}
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          <span style={{ fontFamily: "var(--font-inter, Inter, sans-serif)", fontSize: 11, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Scroll
          </span>
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
            <path d="M10 2 L10 20 M4 14 L10 20 L16 14" stroke="#555" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;