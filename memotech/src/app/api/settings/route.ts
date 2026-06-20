import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings — fetch the user's digest/notification settings
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.digestSettings.findUnique({ where: { userId } });

    // Create defaults on first visit if none exist yet
    if (!settings) {
      settings = await prisma.digestSettings.create({
        data: { userId },
      });
    }

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[GET /api/settings]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PATCH /api/settings — update one or more notification toggles
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: {
      weeklyDigestEnabled?: boolean;
      taskReminders?: boolean;
      newFeatureEmails?: boolean;
    } = await req.json();

    const settings = await prisma.digestSettings.upsert({
      where: { userId },
      update: body,
      create: { userId, ...body },
    });

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("[PATCH /api/settings]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}