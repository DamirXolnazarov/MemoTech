"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import FlashcardsTab from "@/components/app/tabs/FlashcardsTab";

interface Deck {
  sessionId: string;
  topic: string;
  cardCount: number;
  lastStudied: string;
  cards: Array<{ question: string; answer: string }>;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  if (weeks === 1) return "1 week ago";
  return `${weeks} weeks ago`;
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDecks() {
      try {
        const res = await fetch("/api/flashcards");
        if (!res.ok) throw new Error("Failed to fetch flashcards");
        const json = await res.json();
        if (!cancelled) setDecks(json.decks ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDecks();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDeck = decks.find((d) => d.sessionId === selectedDeckId);

  return (
    <div>
      <TopBar title="Flashcards" />
      <div className="p-8 flex flex-col gap-6">
        {!selectedDeck ? (
          <>
            <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-syne)", fontSize: 16 }}>
              Your Decks
            </h2>

            {loading ? (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border"
                    style={{ background: "#0b0b0b", borderColor: "#1a1a1a", height: 100, opacity: 0.4 }}
                  />
                ))}
              </div>
            ) : decks.length === 0 ? (
              <div
                className="rounded-xl border flex flex-col items-center justify-center gap-3 py-20"
                style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
              >
                <p style={{ color: "#666", fontSize: 16, fontFamily: "var(--font-syne)", fontWeight: 600 }}>
                  No flashcard decks yet
                </p>
                <p style={{ color: "#444", fontSize: 13, fontFamily: "var(--font-inter)", maxWidth: 320, textAlign: "center" }}>
                  Flashcards generated from your recordings will show up here, grouped by session.
                </p>
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {decks.map((deck) => (
                  <button
                    key={deck.sessionId}
                    onClick={() => setSelectedDeckId(deck.sessionId)}
                    className="rounded-xl border p-5 text-left transition-all hover:border-[#2a2a2a] group"
                    style={{ background: "#0b0b0b", borderColor: "#1a1a1a", cursor: "pointer" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white leading-snug" style={{ fontFamily: "var(--font-syne)", fontSize: 14 }}>
                        {deck.topic}
                      </h3>
                      <span
                        className="ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: "rgba(201,106,203,0.12)", color: "#c96acb", fontSize: 11 }}
                      >
                        {deck.cardCount}
                      </span>
                    </div>
                    <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#444" }}>
                      Created {formatRelativeDate(deck.lastStudied)}
                    </p>
                    <p className="mt-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#c96acb", fontFamily: "var(--font-inter)" }}>
                      Study now →
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setSelectedDeckId(null)}
                style={{ color: "#555", fontFamily: "var(--font-inter)", fontSize: 13, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                All Decks
              </button>
              <span style={{ color: "#333" }}>·</span>
              <span style={{ fontFamily: "var(--font-syne)", fontSize: 14, color: "#888" }}>{selectedDeck.topic}</span>
            </div>

            <FlashcardsTab flashcards={selectedDeck.cards} />
          </div>
        )}
      </div>
    </div>
  );
}