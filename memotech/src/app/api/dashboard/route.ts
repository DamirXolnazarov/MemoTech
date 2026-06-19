import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard — aggregated stats + recent sessions for the dashboard
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalMemories, sessions, allTasks] = await Promise.all([
      prisma.session.count({ where: { userId } }),
      prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { tasks: true, flashcards: true, keyMoments: true },
      }),
      prisma.task.findMany({ where: { userId } }),
    ]);

    // Tasks due today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const tasksDueToday = allTasks.filter((t) => {
      if (!t.dueDate || t.done) return false;
      const due = new Date(t.dueDate);
      return due >= startOfToday && due <= endOfToday;
    }).length;

    // Total hours recorded — sum of all session durations (in seconds), converted to hours
    const allSessions = await prisma.session.findMany({
      where: { userId },
      select: { duration: true },
    });
    const totalSeconds = allSessions.reduce((sum, s) => sum + s.duration, 0);
    const hoursRecorded = Math.round((totalSeconds / 3600) * 10) / 10; // 1 decimal place

    // Study streak — consecutive days with at least one session, counting back from today
    const sessionDates = allSessions.length
      ? (
          await prisma.session.findMany({
            where: { userId },
            select: { createdAt: true },
            orderBy: { createdAt: "desc" },
          })
        ).map((s) => {
          const d = new Date(s.createdAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      : [];
    const uniqueDays = Array.from(new Set(sessionDates)).sort((a, b) => b - a);

    let streak = 0;
    if (uniqueDays.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const oneDayMs = 86400000;
      let cursor = today.getTime();

      // Allow streak to count today or yesterday as the most recent valid day
      if (uniqueDays[0] === cursor || uniqueDays[0] === cursor - oneDayMs) {
        streak = 1;
        cursor = uniqueDays[0];
        for (let i = 1; i < uniqueDays.length; i++) {
          if (uniqueDays[i] === cursor - oneDayMs) {
            streak++;
            cursor = uniqueDays[i];
          } else {
            break;
          }
        }
      }
    }

    const recentSessions = sessions.map((s) => ({
      id: s.id,
      title: s.title,
      date: s.createdAt,
      durationSeconds: s.duration,
      tags: [
        "Summary",
        s.tasks.length > 0 ? "Tasks" : null,
        s.flashcards.length > 0 ? "Flashcards" : null,
      ].filter(Boolean),
    }));

    return NextResponse.json({
      stats: {
        totalMemories,
        tasksDueToday,
        studyStreak: streak,
        hoursRecorded,
      },
      recentSessions,
    });
  } catch (err) {
    console.error("[GET /api/dashboard]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}