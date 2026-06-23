// lib/notifications.ts
import { prisma } from "@/lib/prisma";

export async function seedWelcomeNotifications(userId: string, firstName: string) {
  const existing = await prisma.notification.findFirst({ where: { userId } });
  if (existing) return;

  const name = firstName || "there";
  const now = new Date();
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  await prisma.notification.createMany({
    data: [
      {
        userId,
        type: "welcome",
        title: `Welcome to Memo, ${name} 👋`,
        body: `Hey ${name}! We're so glad you're here. Memo turns your voice into structured knowledge — summaries, tasks, flashcards, and a searchable memory of everything you've ever heard. Start by pressing Record on your first session. It takes one tap.`,
        createdAt: now,
      },
      {
        userId,
        type: "pro",
        title: "You're on the Free plan",
        body: "Free gives you 5 recordings per month, 30 minutes each, with AI summaries and full transcripts. When you're ready for unlimited recordings, 3-hour sessions, flashcards, calendar sync, and memory search — Pro is $9/mo. No credit card needed to try.",
        createdAt: threeDays,
      },
      {
        userId,
        type: "partnership",
        title: "Interested in collaborating with Memo?",
        body: "We're looking for early partners — student organisations, study groups, educators, and content creators who want to shape what Memo becomes. If that sounds like you, we'd love to hear from you. Fill out our short partnership interest form and we'll be in touch.",
        createdAt: oneWeek,
      },
    ],
  });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.notification.update({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function deleteNotification(id: string, userId: string) {
  return prisma.notification.delete({ where: { id, userId } });
}