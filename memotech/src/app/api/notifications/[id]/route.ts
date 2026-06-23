import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { markNotificationRead } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await markNotificationRead(id, userId);
  return NextResponse.json({ ok: true });
}
