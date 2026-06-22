"use client";

import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardsTabProps {
  flashcards: Flashcard[];
}

export default function FlashcardsTab({ flashcards: initialCards }: FlashcardsTabProps) {
  const [cards, setCards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = cards[index];

  const prev = () => { setFlipped(false); setTimeout(() => setIndex((i) => Math.max(0, i - 1)), 150); };
  const next = () => { setFlipped(false); setTimeout(() => setIndex((i) => Math.min(cards.length - 1, i + 1)), 150); };
  const shuffle = () => { setFlipped(false); setIndex(0); setCards([...cards].sort(() => Math.random() - 0.5)); };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setFlipped((f) => !f); }
      if (e.code === "ArrowLeft") prev();
      if (e.code === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#52525b" }}>No flashcards generated.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 md:gap-8">
      <div className="flex items-center justify-between w-full">
        <h2
          style={{ fontFamily: "var(--font-syne)", fontSize: 17, fontWeight: 700, color: "#fff" }}
          className="md:text-[18px] md:font-semibold"
        >
          Flashcards
        </h2>
        <button
          onClick={shuffle}
          style={{
            fontFamily: "var(--font-inter)", fontSize: 12.5, color: "#a1a1aa",
            background: "rgba(255,255,255,0.04)", border: "1px solid #221a26",
            borderRadius: 20, padding: "6px 14px",
          }}
        >
          Shuffle
        </button>
      </div>

      {/* Card */}
      <div
        style={{ perspective: 1000, width: "100%", maxWidth: 480, height: 280, cursor: "pointer" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          style={{
            position: "relative", width: "100%", height: "100%",
            transformStyle: "preserve-3d", transition: "transform 0.5s ease",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            className="rounded-2xl md:rounded-2xl"
            style={{
              position: "absolute", inset: 0, backfaceVisibility: "hidden",
              background: "#0e0a10", border: "1px solid #221a26",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "32px 28px", gap: 14,
            }}
          >
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700, color: "#52525b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Question
            </span>
            <p style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.5, margin: 0 }}>
              {current.question}
            </p>
            <span
              className="flex items-center gap-1.5"
              style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#c96acb", marginTop: 10 }}
            >
              Tap to flip <RotateCw size={12} />
            </span>
          </div>

          <div
            className="rounded-2xl md:rounded-2xl"
            style={{
              position: "absolute", inset: 0, backfaceVisibility: "hidden",
              background: "rgba(201,106,203,0.06)", border: "1px solid rgba(201,106,203,0.25)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: "32px 28px", gap: 14, transform: "rotateY(180deg)",
            }}
          >
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700, color: "#c96acb", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>
              Answer
            </span>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 15.5, color: "#e4e4e7", textAlign: "center", lineHeight: 1.7, margin: 0 }}>
              {current.answer}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        <button
          onClick={prev}
          disabled={index === 0}
          className="flex items-center justify-center rounded-full transition-colors"
          style={{
            width: 40, height: 40, background: "#0e0a10",
            border: "1px solid #221a26", color: index === 0 ? "#2a2a2a" : "#a1a1aa",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span style={{ fontFamily: "var(--font-inter)", fontSize: 13.5, color: "#71717a", fontWeight: 500 }}>
          {index + 1} / {cards.length}
        </span>

        <button
          onClick={next}
          disabled={index === cards.length - 1}
          className="flex items-center justify-center rounded-full transition-colors"
          style={{
            width: 40, height: 40, background: "#0e0a10",
            border: "1px solid #221a26", color: index === cards.length - 1 ? "#2a2a2a" : "#a1a1aa",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}