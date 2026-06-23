// app/api/notifications/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getNotifications,
  markAllNotificationsRead,
  deleteNotification,
} from "@/lib/notifications";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notifications = await getNotifications(userId);
  return NextResponse.json({ notifications });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { action } = await req.json();
  if (action === "markAllRead") {
    await markAllNotificationsRead(userId);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await deleteNotification(id, userId);
  return NextResponse.json({ ok: true });
}