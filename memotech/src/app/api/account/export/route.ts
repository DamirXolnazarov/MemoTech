import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/account/export — return all of the user's data as JSON for download
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { tasks: true, flashcards: true, keyMoments: true },
    });

    const settings = await prisma.digestSettings.findUnique({ where: { userId } });

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      sessions,
      settings,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="memo-export-${Date.now()}.json"`,
      },
    });
  } catch (err) {
    console.error("[GET /api/account/export]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}