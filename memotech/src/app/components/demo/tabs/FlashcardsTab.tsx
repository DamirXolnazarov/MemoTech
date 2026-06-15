"use client";

import { useEffect, useState } from "react";

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

  const prev = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(0, i - 1)), 150);
  };

  const next = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.min(cards.length - 1, i + 1)), 150);
  };

  const shuffle = () => {
    setFlipped(false);
    setIndex(0);
    setCards([...cards].sort(() => Math.random() - 0.5));
  };

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
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#444" }}>No flashcards generated.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center justify-between w-full">
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 600, color: "#f0f0f0" }}>
          Flashcards
        </h2>
        <button
          onClick={shuffle}
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 12,
            color: "#555",
            background: "transparent",
            border: "1px solid #1a1a1a",
            borderRadius: 6,
            padding: "4px 12px",
            cursor: "pointer",
          }}
        >
          Shuffle
        </button>
      </div>

      {/* Card */}
      <div
        style={{
          perspective: 1000,
          width: "100%",
          maxWidth: 480,
          height: 260,
          cursor: "pointer",
        }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s ease",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              background: "#0b0b0b",
              border: "1px solid #1a1a1a",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "28px 32px",
              gap: 12,
            }}
          >
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Question
            </span>
            <p style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 600, color: "#ddd", textAlign: "center", lineHeight: 1.6, margin: 0 }}>
              {current.question}
            </p>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#2a2a2a", marginTop: 8 }}>
              Click or press Space to reveal
            </span>
          </div>

          {/* Back */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              background: "rgba(201,106,203,0.05)",
              border: "1px solid rgba(201,106,203,0.2)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "28px 32px",
              gap: 12,
              transform: "rotateY(180deg)",
            }}
          >
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#c96acb", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6 }}>
              Answer
            </span>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 15, color: "#ccc", textAlign: "center", lineHeight: 1.7, margin: 0 }}>
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
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "transparent",
            border: "1px solid #1a1a1a",
            color: index === 0 ? "#222" : "#666",
            cursor: index === 0 ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#555" }}>
          {index + 1} / {cards.length}
        </span>

        <button
          onClick={next}
          disabled={index === cards.length - 1}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "transparent",
            border: "1px solid #1a1a1a",
            color: index === cards.length - 1 ? "#222" : "#666",
            cursor: index === cards.length - 1 ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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