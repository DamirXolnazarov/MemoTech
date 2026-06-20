import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/shared/[token]/save
// Clones the shared session (respecting the same include* flags as the
// public view) into a new Session owned by the requesting user.
// Idempotent per (shareLink, recipient) — calling twice returns the
// already-saved copy instead of duplicating it.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;

  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      session: {
        include: { flashcards: true, tasks: true },
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

  // Don't let someone save their own shared session as a "copy" —
  // doesn't make sense and would create a confusing duplicate.
  if (shareLink.createdBy === userId) {
    return NextResponse.json(
      { error: "You already own this session" },
      { status: 400 }
    );
  }

  // Dedupe: if this recipient already saved this link, return the
  // existing copy instead of cloning again.
  const existingSave = await prisma.shareLinkSave.findUnique({
    where: { shareLinkId_savedBy: { shareLinkId: shareLink.id, savedBy: userId } },
  });

  if (existingSave) {
    return NextResponse.json({ savedSessionId: existingSave.savedSessionId, alreadySaved: true });
  }

  const { session } = shareLink;

  const newSession = await prisma.session.create({
    data: {
      userId,
      title: session.title,
      shortSummary: shareLink.includeSummary ? session.shortSummary : "",
      detailedSummary: shareLink.includeSummary ? session.detailedSummary : "",
      keyConcepts: shareLink.includeConcepts ? session.keyConcepts : [],
      // Transcript/audio are never carried over from a shared copy,
      // matching the public view's restrictions.
      transcript: "",
      duration: session.duration,
      flashcards: shareLink.includeFlashcards
        ? {
            create: session.flashcards.map((f) => ({
              userId,
              question: f.question,
              answer: f.answer,
            })),
          }
        : undefined,
      tasks: shareLink.includeTasks
        ? {
            create: session.tasks.map((t) => ({
              userId,
              text: t.text,
              priority: t.priority,
              dueDate: t.dueDate,
            })),
          }
        : undefined,
    },
  });

  await prisma.shareLinkSave.create({
    data: {
      shareLinkId: shareLink.id,
      savedBy: userId,
      savedSessionId: newSession.id,
    },
  });

  return NextResponse.json({ savedSessionId: newSession.id, alreadySaved: false });
}
