import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/tasks — all tasks for the user, with session title attached
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: { session: { select: { title: true } } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("[GET /api/tasks]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// PATCH /api/tasks — toggle a task's done state
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, done }: { id: string; done: boolean } = await req.json();
    if (!id || typeof done !== "boolean") {
      return NextResponse.json({ error: "Missing id or done" }, { status: 400 });
    }

    // Ensure the task belongs to this user before updating
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { done },
    });

    return NextResponse.json({ task: updated });
  } catch (err) {
    console.error("[PATCH /api/tasks]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}