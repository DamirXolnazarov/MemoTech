import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/account — permanently delete the user's data and Clerk account
export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all DB records for this user.
    // Sessions cascade-delete their tasks/flashcards/keyMoments automatically
    // (onDelete: Cascade in the schema), so we only need to delete sessions
    // and digest settings explicitly. Tasks/flashcards not tied to a session
    // (there shouldn't be any, but just in case) are cleaned up too.
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { userId } }),
      prisma.flashcard.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.digestSettings.deleteMany({ where: { userId } }),
    ]);

    // Delete the actual Clerk account
    const client = await clerkClient();
    await client.users.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/account]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}