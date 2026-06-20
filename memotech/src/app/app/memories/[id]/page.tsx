import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SessionDetailClient from "./SessionDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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
    notFound();
  }

  return (
    <SessionDetailClient
      sessionId={session.id}
      createdAt={session.createdAt.toISOString()}
      data={{
        title: session.title,
        shortSummary: session.shortSummary,
        detailedSummary: session.detailedSummary,
        keyConcepts: session.keyConcepts,
        tasks: session.tasks.map((t) => ({
          text: t.text,
          priority: t.priority,
          dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
        })),
        flashcards: session.flashcards.map((f) => ({
          question: f.question,
          answer: f.answer,
        })),
        keyMoments: session.keyMoments.map((k) => ({
          timestamp: k.timestamp,
          quote: k.quote,
          why: k.why,
        })),
      }}
      transcript={session.transcript}
      duration={session.duration}
    />
  );
}
