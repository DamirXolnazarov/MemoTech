"use client";

import { useState } from "react";
import TopBar from "@/components/app/TopBar";
import FlashcardsTab from "@/components/app/tabs/FlashcardsTab";

// TODO: Replace with real DB fetch — query flashcard decks by userId
const DECKS = [
  {
    id: "1",
    topic: "Biology 201 — Photosynthesis",
    cardCount: 8,
    lastStudied: "2 days ago",
    cards: [
      { question: "What are the two main stages of photosynthesis?", answer: "The light-dependent reactions (in the thylakoid) and the light-independent reactions / Calvin cycle (in the stroma)." },
      { question: "What molecule captures light energy in photosynthesis?", answer: "Chlorophyll, a green pigment found in the chloroplast." },
      { question: "What is produced during the light-dependent reactions?", answer: "ATP, NADPH, and oxygen (as a byproduct of water splitting)." },
      { question: "What is the role of RuBisCO in the Calvin cycle?", answer: "It catalyses the fixation of CO₂ to RuBP, the first step in carbon fixation." },
      { question: "Where does the Calvin cycle occur?", answer: "In the stroma of the chloroplast." },
      { question: "What is the net equation for photosynthesis?", answer: "6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂" },
      { question: "What is photorespiration?", answer: "A process where RuBisCO fixes O₂ instead of CO₂, reducing photosynthetic efficiency — more common in C3 plants under heat." },
      { question: "How do C4 plants reduce photorespiration?", answer: "By concentrating CO₂ in bundle sheath cells, keeping RuBisCO away from high O₂ environments." },
    ],
  },
  {
    id: "2",
    topic: "Machine Learning — Neural Networks",
    cardCount: 6,
    lastStudied: "1 week ago",
    cards: [
      { question: "What is backpropagation?", answer: "An algorithm that computes the gradient of the loss function with respect to each weight using the chain rule, allowing weights to be updated." },
      { question: "What does a sigmoid activation function output?", answer: "A value between 0 and 1, making it useful for binary classification but prone to vanishing gradients." },
      { question: "Why is ReLU preferred over sigmoid in hidden layers?", answer: "ReLU doesn't saturate for positive values, reducing vanishing gradient problems and training faster." },
      { question: "What is gradient descent?", answer: "An optimisation algorithm that iteratively moves in the direction of steepest descent of the loss function to minimise error." },
      { question: "What is a learning rate?", answer: "A hyperparameter controlling the step size during gradient descent — too high diverges, too low converges slowly." },
      { question: "What is overfitting?", answer: "When a model learns the training data too well, including noise, and performs poorly on unseen data." },
    ],
  },
  {
    id: "3",
    topic: "Economics — Supply & Demand",
    cardCount: 5,
    lastStudied: "1 week ago",
    cards: [
      { question: "What is price elasticity of demand?", answer: "A measure of how much quantity demanded changes in response to a price change: %ΔQd / %ΔP." },
      { question: "What does it mean for demand to be inelastic?", answer: "Quantity demanded changes little when price changes — |PED| < 1. Common for necessities like insulin." },
      { question: "What shifts the demand curve rightward?", answer: "Increase in income (for normal goods), rise in price of substitutes, fall in price of complements, or positive consumer expectations." },
      { question: "What is market equilibrium?", answer: "The price at which quantity supplied equals quantity demanded — no surplus or shortage exists." },
      { question: "What is a price ceiling?", answer: "A legal maximum price set below equilibrium, causing shortages because quantity demanded exceeds quantity supplied." },
    ],
  },
];

export default function FlashcardsPage() {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const selectedDeck = DECKS.find((d) => d.id === selectedDeckId);

  return (
    <div>
      <TopBar title="Flashcards" />
      <div className="p-8 flex flex-col gap-6">
        {!selectedDeck ? (
          <>
            <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-syne)", fontSize: 16 }}>
              Your Decks
            </h2>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {DECKS.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
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
                    Last studied: {deck.lastStudied}
                  </p>
                  <p className="mt-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#c96acb", fontFamily: "var(--font-inter)" }}>
                    Study now →
                  </p>
                </button>
              ))}
            </div>
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

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#555" }}>Progress</span>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#555" }}>0 / {selectedDeck.cards.length}</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 3, background: "#1a1a1a" }}>
                <div style={{ height: "100%", width: "0%", background: "#c96acb", transition: "width 0.3s ease" }} />
              </div>
            </div>

            <FlashcardsTab flashcards={selectedDeck.cards} />
          </div>
        )}
      </div>
    </div>
  );
}