import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/shared/[token]
// Public route — no auth. Returns only the fields the sharer chose to
// include. Validates the link hasn't expired or been revoked, and bumps
// view tracking on every successful fetch.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      session: {
        include: {
          flashcards: true,
          tasks: true,
        },
      },
    },
  });

  if (!shareLink) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  if (shareLink.revokedAt) {
    return NextResponse.json({ error: "This link has been revoked" }, { status: 410 });
  }

  if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
    return NextResponse.json({ error: "This link has expired" }, { status: 410 });
  }

  // Fire-and-forget view tracking — don't block the response on it
  prisma.shareLink
    .update({
      where: { id: shareLink.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    })
    .catch((err) => {
      console.error("Failed to record share link view:", err);
    });

  const { session } = shareLink;

  // Build the response shape strictly from the include* flags.
  // Transcript and audio are never exposed here, regardless of flags —
  // that's intentional and not configurable from this route.
  const payload: Record<string, unknown> = {
    title: session.title,
    createdAt: session.createdAt,
    duration: session.duration,
  };

  if (shareLink.includeSummary) {
    payload.shortSummary = session.shortSummary;
    payload.detailedSummary = session.detailedSummary;
  }

  if (shareLink.includeConcepts) {
    payload.keyConcepts = session.keyConcepts;
  }

  if (shareLink.includeFlashcards) {
    payload.flashcards = session.flashcards.map((f) => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
    }));
  }

  if (shareLink.includeTasks) {
    payload.tasks = session.tasks.map((t) => ({
      id: t.id,
      text: t.text,
      priority: t.priority,
      dueDate: t.dueDate,
      done: t.done,
    }));
  }

  return NextResponse.json({ share: payload });
}
