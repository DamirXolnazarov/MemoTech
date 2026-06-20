import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/sessions/[id]
// Returns a single session (with tasks, flashcards, keyMoments nested)
// owned by the requesting user.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        tasks: true,
        flashcards: true,
        keyMoments: true,
      },
    });

    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (err) {
    console.error("[GET /api/sessions/[id]]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
