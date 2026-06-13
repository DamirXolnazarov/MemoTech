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

/* ─── Person silhouette (white, side-profile facing right) ───────────────── */
function PersonSVG({ wrapRef }: { wrapRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={wrapRef}
      style={{
        position: "absolute",
        left: "3vw",
        top: "50%",
        transform: "translateY(-52%)",
        zIndex: 6,
        pointerEvents: "none",
        opacity: 0,
      }}
    >
      <svg
        width="300"
        height="420"
        viewBox="0 0 300 420"
        fill="white"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Traced from reference: 3/4 rear-facing person. Round head, bun, narrow neck, wide shoulders, bent arm. */}

        {/* Main head — large round */}
        <ellipse cx="168" cy="108" rx="82" ry="90" />

        {/* Hair bun — small circle left of head */}
        <circle cx="90" cy="130" r="24" />

        {/* Chin / lower face taper */}
        <path d="M118 185 C118 200 130 215 148 220 C164 224 178 216 182 202 C186 190 182 178 175 172 L160 168 C144 165 118 172 118 185Z" />

        {/* Beard / jaw detail under chin */}
        <path d="M128 210 C125 222 128 235 138 240 C148 244 160 240 165 230 C168 222 165 212 158 208Z" />

        {/* Neck — narrow strip */}
        <rect x="138" y="240" width="34" height="36" rx="6" />

        {/* Collar piece */}
        <rect x="126" y="270" width="58" height="22" rx="4" />

        {/* Left shoulder + torso */}
        <path d="M30 320 C20 310 15 295 20 280 C26 262 50 250 80 248 L130 245 C130 258 132 268 136 278 L136 420 L10 420Z" />

        {/* Right shoulder */}
        <path d="M196 278 C200 265 220 252 248 250 C270 248 288 256 294 268 C298 278 295 290 286 296 L240 308 C220 314 200 306 196 292Z" />

        {/* Right arm — bent elbow */}
        <path d="M268 296 C285 300 298 312 300 328 C302 342 295 355 283 360 C270 364 256 356 248 344 L240 320 C244 306 256 292 268 296Z" />

        {/* Forearm resting */}
        <path d="M225 358 C238 355 255 356 265 362 C278 370 282 384 274 392 C265 400 248 398 236 390 L218 374 C214 364 220 360 225 358Z" />

        {/* Central torso fill */}
        <rect x="136" y="278" width="60" height="142" />

      </svg>
    </div>
  );
}

/* ─── Mouth sound waves — arcs radiating from person's mouth area ─────────── */
function MouthWaves({ containerRef, waveRefs }: {
  containerRef: React.RefObject<SVGGElement>;
  waveRefs: React.MutableRefObject<SVGPathElement[]>;
}) {
  // Three arc waves, centered around mouth position (~310px from left, 50% height)
  // Each arc opens rightward toward the mic
  const arcs = [
    "M 0,-22 A 22,22 0 0,1 0,22",
    "M 0,-40 A 40,40 0 0,1 0,40",
    "M 0,-60 A 60,60 0 0,1 0,60",
    "M 0,-82 A 82,82 0 0,1 0,82",
    "M 0,-106 A 106,106 0 0,1 0,106",
  ];
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5, overflow: "visible" }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* mouth origin: x≈310 (person right edge + slight offset), y≈450 (vertical center) */}
      <g ref={containerRef} transform="translate(310,450)">
        {arcs.map((d, i) => (
          <path
            key={i}
            ref={(el) => { if (el) waveRefs.current[i] = el; }}
            d={d}
            fill="none"
            stroke={ORCHID}
            strokeWidth={2.4 - i * 0.3}
            strokeLinecap="round"
            opacity={0}
          />
        ))}
      </g>
    </svg>
  );
}

/* ─── Mic SVG ────────────────────────────────────────────────────────────── */
function MicSVG({ svgRef }: { svgRef: React.RefObject<SVGSVGElement> }) {
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

/* ─── Concentric circles radiating in ALL directions from mic center ─────── */
function RadialCircles({ circleRefs }: {
  circleRefs: React.MutableRefObject<SVGCircleElement[]>;
}) {
  const radii = [55, 100, 155, 215, 285, 360];
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 3, overflow: "visible" }}
    >
      {/* mic center ≈ 720, 440 in 1440×900 viewport space */}
      <g transform="translate(720,440)">
        {radii.map((r, i) => (
          <circle
            key={i}
            ref={(el) => { if (el) circleRefs.current[i] = el; }}
            cx={0} cy={0} r={r}
            fill="none"
            stroke={ORCHID}
            strokeWidth={1.8 - i * 0.2}
            opacity={0}
          />
        ))}
      </g>
    </svg>
  );
}

/* ─── Demo cards fanned out ──────────────────────────────────────────────── */
const CARD_POSITIONS = [
  { left: "18%", top: "18%" },
  { left: "38%", top: "8%"  },
  { left: "58%", top: "8%"  },
  { left: "76%", top: "18%" },
  { left: "78%", top: "62%" },
];

function DemoCards({ wrapRef, cardRefs }: {
  wrapRef: React.RefObject<HTMLDivElement>;
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
            width: 185,
            background: "rgba(8,8,8,0.88)",
            border: "1px solid rgba(201,106,203,0.28)",
            borderRadius: 14,
            padding: "14px 16px",
            backdropFilter: "blur(14px)",
            opacity: 0,
            boxShadow: "0 0 28px rgba(201,106,203,0.07)",
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

/* ─── Main export ────────────────────────────────────────────────────────── */
export function HeroSection() {
  const wrapperRef      = useRef<HTMLDivElement>(null);
  const micWrapRef      = useRef<HTMLDivElement>(null);
  const micSvgRef       = useRef<SVGSVGElement>(null);
  const personWrapRef   = useRef<HTMLDivElement>(null);
  const mouthWaveGroup  = useRef<SVGGElement>(null);
  const mouthWaveRefs   = useRef<SVGPathElement[]>([]);
  const circleRefs      = useRef<SVGCircleElement[]>([]);
  const cardsWrapRef    = useRef<HTMLDivElement>(null);
  const cardRefs        = useRef<HTMLDivElement[]>([]);
  const headlineRef     = useRef<HTMLDivElement>(null);
  const indicatorRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gsapCtx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.4,
        },
      });

      /* ── Phase 1 (0 → 0.10): Person visible, mic visible, scroll hint fades ── */
      tl.to(indicatorRef.current, { opacity: 0, duration: 0.06 }, 0.04);

      /* ── Phase 2 (0.10 → 0.38): Person slides in from left, mouth arc waves travel to mic ── */
      // Person slides in from off-screen left
      tl.fromTo(personWrapRef.current,
        { opacity: 0, x: -80 },
        { opacity: 1, x: 0, duration: 0.14, ease: "power3.out" },
        0.10
      );

      mouthWaveRefs.current.forEach((w, i) => {
        const start = 0.08 + i * 0.028;
        tl.fromTo(w,
          { opacity: 0, scale: 0.4, transformOrigin: "0px 0px" },
          { opacity: 0.75 - i * 0.1, scale: 1, transformOrigin: "0px 0px", duration: 0.10, ease: "power2.out" },
          start
        );
        tl.to(w, { opacity: 0, duration: 0.07, ease: "power2.in" }, start + 0.14);
      });

      /* ── Phase 3 (0.36 → 0.55): Person fades, mic zooms, circles burst out ── */
      tl.to(personWrapRef.current, { opacity: 0, x: -60, duration: 0.10, ease: "power2.in" }, 0.36);

      tl.to(micWrapRef.current, {
        scale: 2.8,
        duration: 0.16,
        ease: "power3.inOut",
        transformOrigin: "50% 50%",
      }, 0.38);

      // Circles burst outward in all directions, staggered
      circleRefs.current.forEach((c, i) => {
        tl.fromTo(c,
          { attr: { r: 0 }, opacity: 0.7 - i * 0.08 },
          { attr: { r: 55 + i * 72 }, opacity: 0.55 - i * 0.08, duration: 0.14, ease: "power2.out" },
          0.40 + i * 0.022
        );
      });

      /* ── Phase 4 (0.58 → 0.78): Zoom into mic+circles, mic fades, circles fill screen ── */
      tl.to(micWrapRef.current, {
        scale: 7,
        opacity: 0,
        duration: 0.16,
        ease: "power3.in",
        transformOrigin: "50% 50%",
      }, 0.58);

      // Circles keep expanding while zooming in — scale the whole SVG layer
      tl.to(".radial-circles-svg", {
        scale: 3.2,
        transformOrigin: "50% 49%",
        duration: 0.18,
        ease: "power3.in",
      }, 0.58);

      /* ── Phase 5 (0.72 → 0.88): Cards appear through the waves ── */
      tl.to(cardsWrapRef.current, { opacity: 1, duration: 0.04 }, 0.72);
      cardRefs.current.forEach((card, i) => {
        tl.fromTo(card,
          { opacity: 0, scale: 0.88, y: 16 },
          { opacity: 1, scale: 1, y: 0, duration: 0.08, ease: "back.out(1.5)" },
          0.74 + i * 0.030
        );
      });

      /* ── Phase 6 (0.88 → 1.0): Cards + circles out, headline in ── */
      tl.to([cardsWrapRef.current, ".radial-circles-svg"], { opacity: 0, duration: 0.07 }, 0.88);
      tl.fromTo(headlineRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.07, ease: "power2.out" },
        0.93
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
          background: "#050505",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Person — visible from frame 1, left side */}
        <PersonSVG wrapRef={personWrapRef} />

        {/* Mouth arc waves */}
        <MouthWaves containerRef={mouthWaveGroup} waveRefs={mouthWaveRefs} />

        {/* Mic — centered */}
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

        {/* Radial circles — all directions */}
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
            Never lose
            <br />
            what <span style={{ color: ORCHID }}>matters.</span>
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
            <button
              style={{
                background: ORCHID,
                color: "white",
                border: "none",
                borderRadius: 9,
                padding: "13px 28px",
                fontFamily: "var(--font-inter, Inter, sans-serif)",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Get started free
            </button>
            <button
              style={{
                background: "transparent",
                color: "white",
                border: "1.5px solid rgba(255,255,255,0.2)",
                borderRadius: 9,
                padding: "12px 28px",
                fontFamily: "var(--font-inter, Inter, sans-serif)",
                fontWeight: 500,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              See how it works
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
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
          <span
            style={{
              fontFamily: "var(--font-inter, Inter, sans-serif)",
              fontSize: 11,
              color: "#444",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
            <path
              d="M10 2 L10 20 M4 14 L10 20 L16 14"
              stroke="#444"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;