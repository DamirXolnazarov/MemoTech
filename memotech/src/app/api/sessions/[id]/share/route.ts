import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/sessions/[id]/share
// Creates a new ShareLink for a session, or returns an existing
// active (non-revoked, non-expired) one if it already exists.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: sessionId } = await params;

  // Confirm the session exists and belongs to this user
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Reuse an existing active link if one exists, rather than
  // creating duplicates every time the Share sheet is opened
  const existing = await prisma.shareLink.findFirst({
    where: {
      sessionId,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  if (existing) {
    return NextResponse.json({ shareLink: existing });
  }

  const shareLink = await prisma.shareLink.create({
    data: {
      sessionId,
      createdBy: userId,
      // includeSummary / includeConcepts / includeFlashcards default true,
      // includeTasks defaults false — set in schema, no need to pass here
    },
  });

  return NextResponse.json({ shareLink });
}

// DELETE /api/sessions/[id]/share
// Revokes the active share link for a session (soft delete via revokedAt,
// so view history / viewCount isn't lost).
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.userId !== userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const activeLink = await prisma.shareLink.findFirst({
    where: { sessionId, revokedAt: null },
  });

  if (!activeLink) {
    return NextResponse.json({ error: "No active share link" }, { status: 404 });
  }

  await prisma.shareLink.update({
    where: { id: activeLink.id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
