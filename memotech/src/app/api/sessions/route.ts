import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface IncomingTask {
  text: string;
  priority: "High" | "Medium" | "Low";
  dueDate?: string;
}
interface IncomingFlashcard {
  question: string;
  answer: string;
}
interface IncomingKeyMoment {
  timestamp: string;
  quote: string;
  why: string;
}
interface IncomingSession {
  title: string;
  shortSummary: string;
  detailedSummary: string;
  keyConcepts: string[];
  transcript: string;
  duration: number;
  tasks: IncomingTask[];
  flashcards: IncomingFlashcard[];
  keyMoments: IncomingKeyMoment[];
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: IncomingSession = await req.json();

    if (!body.title || !body.transcript) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await prisma.session.create({
      data: {
        userId,
        title: body.title,
        shortSummary: body.shortSummary,
        detailedSummary: body.detailedSummary,
        keyConcepts: body.keyConcepts ?? [],
        transcript: body.transcript,
        duration: body.duration ?? 0,
        tasks: {
          create: (body.tasks ?? []).map((t) => ({
            userId,
            text: t.text,
            priority: t.priority,
            dueDate: t.dueDate ? new Date(t.dueDate) : null,
          })),
        },
        flashcards: {
          create: (body.flashcards ?? []).map((f) => ({
            userId,
            question: f.question,
            answer: f.answer,
          })),
        },
        keyMoments: {
          create: (body.keyMoments ?? []).map((k) => ({
            userId,
            timestamp: k.timestamp,
            quote: k.quote,
            why: k.why,
          })),
        },
      },
      include: {
        tasks: true,
        flashcards: true,
        keyMoments: true,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/sessions]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        tasks: true,
        flashcards: true,
        keyMoments: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("[GET /api/sessions]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}
