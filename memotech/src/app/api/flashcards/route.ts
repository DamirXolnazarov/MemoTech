import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/flashcards — flashcard decks grouped by session
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: { userId, flashcards: { some: {} } },
      orderBy: { createdAt: "desc" },
      include: { flashcards: true },
    });

    const decks = sessions.map((s) => ({
      sessionId: s.id,
      topic: s.title,
      cardCount: s.flashcards.length,
      lastStudied: s.createdAt,
      cards: s.flashcards.map((f) => ({ question: f.question, answer: f.answer })),
    }));

    return NextResponse.json({ decks });
  } catch (err) {
    console.error("[GET /api/flashcards]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch flashcards" }, { status: 500 });
  }
}