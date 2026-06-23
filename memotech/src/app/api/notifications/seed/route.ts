// app/api/notifications/seed/route.ts
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { seedWelcomeNotifications } from "@/lib/notifications";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await currentUser();
  await seedWelcomeNotifications(userId, user?.firstName ?? "");
  return NextResponse.json({ ok: true });
}