"use client";
import { useEffect, useRef } from "react";

/**
 * AmbientBackground
 * Renders a fixed full-screen canvas behind everything.
 * - Seeded random so server/client match (no hydration flash)
 * - Orbs are randomised in position, size, colour, opacity
 * - A second pass adds film-grain noise via per-pixel alpha jitter
 * - No two renders look the same because we re-seed on mount
 */

// Mulberry32 — fast, good enough PRNG
function makePrng(seed: number) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6d2b79f5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Orb {
  x: number; y: number;
  rx: number; ry: number;
  h: number; s: number; l: number;
  a: number;
}

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use a random seed each mount so it's never the same
    const rng = makePrng(Date.now() & 0xffffffff);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ── Black base ───────────────────────────────
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);

      // ── Orbs ─────────────────────────────────────
      // Palette: blues, purples, pinks — never pure green/yellow
      const hueRanges: [number, number][] = [
        [195, 240], // cyan-blue
        [230, 260], // blue-indigo
        [255, 290], // indigo-violet
        [290, 320], // violet-purple
        [310, 340], // purple-pink  ← orchid territory
      ];

      const COUNT = 6 + Math.floor(rng() * 4); // 6–9 orbs
      const orbs: Orb[] = [];

      for (let i = 0; i < COUNT; i++) {
        const range = hueRanges[Math.floor(rng() * hueRanges.length)];
        orbs.push({
          x: rng() * W,
          y: rng() * H,
          rx: W * (0.18 + rng() * 0.32),  // 18–50% of width
          ry: H * (0.15 + rng() * 0.28),  // 15–43% of height
          h: range[0] + rng() * (range[1] - range[0]),
          s: 55 + rng() * 35,              // 55–90%
          l: 38 + rng() * 28,              // 38–66%
          a: 0.04 + rng() * 0.10,          // very subtle: 4–14%
        });
      }

      // Draw each orb as a soft radial gradient ellipse
      orbs.forEach((orb) => {
        ctx.save();
        ctx.translate(orb.x, orb.y);
        ctx.scale(orb.rx, orb.ry); // stretch to ellipse

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        const col = `hsl(${orb.h}, ${orb.s}%, ${orb.l}%)`;
        grad.addColorStop(0, col.replace("hsl(", `hsla(`).replace(")", `, ${orb.a})`));
        grad.addColorStop(0.45, col.replace("hsl(", `hsla(`).replace(")", `, ${orb.a * 0.55})`));
        grad.addColorStop(1, "hsla(0,0%,0%,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // ── Film grain ───────────────────────────────
      // We generate a small tile and repeat it — fast
      const TILE = 256;
      const grain = ctx.createImageData(TILE, TILE);
      const gd = grain.data;
      for (let i = 0; i < gd.length; i += 4) {
        const v = rng() < 0.5 ? 255 : 0;
        gd[i] = gd[i + 1] = gd[i + 2] = v;
        gd[i + 3] = Math.floor(rng() * 18); // 0–17 alpha → very faint
      }

      // Tile the grain across the canvas
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = TILE; tmpCanvas.height = TILE;
      const tmpCtx = tmpCanvas.getContext("2d")!;
      tmpCtx.putImageData(grain, 0, 0);

      const pat = ctx.createPattern(tmpCanvas, "repeat");
      if (pat) {
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
      }

      // ── Subtle vignette (deepen corners) ─────────
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.9);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
