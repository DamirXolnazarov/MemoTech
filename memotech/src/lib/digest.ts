import { prisma } from "@/lib/prisma";

export interface DigestData {
  user: {
    name: string;
    email: string;
    firstName: string;
  };
  weekRange: {
    start: string;
    end: string;
  };
  stats: {
    sessionsRecorded: number;
    hoursRecorded: number;
    tasksExtracted: number;
    flashcardsGenerated: number;
  };
  sessions: Array<{
    title: string;
    date: string;
    duration: string;
    summary: string;
  }>;
  topConcepts: string[];
  pendingTasks: Array<{
    text: string;
    priority: "High" | "Medium" | "Low";
    dueDate?: string;
    sourceSession: string;
  }>;
  flashcardDecks: Array<{
    name: string;
    cardCount: number;
    lastReviewed: string;
  }>;
  focusSuggestion: string;
}

export async function generateFocusSuggestion(
  sessions: DigestData["sessions"],
  concepts: string[],
  pendingTasks: DigestData["pendingTasks"]
): Promise<string> {
  if (sessions.length === 0) {
    return "You haven't recorded any sessions this week. Start a recording to get personalised insights in your next digest.";
  }

  const prompt = `You are Memo, a personal AI memory assistant. A user has just completed their week and here is what they recorded:

Sessions this week:
${sessions.map((s) => `- ${s.title} (${s.duration}): ${s.summary}`).join("\n")}

Key concepts absorbed:
${concepts.join(", ") || "none recorded"}

Pending tasks not yet completed:
${pendingTasks.map((t) => `- ${t.text} (${t.priority} priority${t.dueDate ? `, due ${t.dueDate}` : ""})`).join("\n") || "none"}

Write a 3-5 sentence personalised focus suggestion for next week. Be specific to the actual content listed above — reference real topics, real tasks, real gaps you notice. Sound like a thoughtful personal tutor who actually read their notes, not a generic AI assistant. Do not start with "Based on your recordings" or any preamble. Just write the paragraph directly. Return only the paragraph, nothing else.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export async function generateDigestData(
  userId: string,
  userEmail: string,
  userFirstName: string
): Promise<DigestData> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const weekSessions = await prisma.session.findMany({
    where: { userId, createdAt: { gte: weekAgo, lte: now } },
    orderBy: { createdAt: "asc" },
    include: { tasks: true, flashcards: true },
  });

  const sessions: DigestData["sessions"] = weekSessions.map((s) => ({
    title: s.title,
    date: formatDate(s.createdAt),
    duration: formatDuration(s.duration),
    summary: s.shortSummary,
  }));

  const conceptSet = new Set<string>();
  weekSessions.forEach((s) => s.keyConcepts.forEach((c) => conceptSet.add(c)));
  const topConcepts = Array.from(conceptSet).slice(0, 10);

  const incompleteTasks = await prisma.task.findMany({
    where: { userId, done: false },
    include: { session: { select: { title: true } } },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    take: 10,
  });

  const pendingTasks: DigestData["pendingTasks"] = incompleteTasks.map((t) => ({
    text: t.text,
    priority: t.priority,
    dueDate: t.dueDate
      ? t.dueDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
      : undefined,
    sourceSession: t.session.title,
  }));

  const sessionsWithCards = await prisma.session.findMany({
    where: { userId, flashcards: { some: {} } },
    orderBy: { createdAt: "desc" },
    include: { flashcards: true },
    take: 6,
  });

  const flashcardDecks: DigestData["flashcardDecks"] = sessionsWithCards.map((s) => ({
    name: s.title,
    cardCount: s.flashcards.length,
    lastReviewed: formatDate(s.createdAt),
  }));

  const totalSeconds = weekSessions.reduce((acc, s) => acc + s.duration, 0);
  const tasksExtractedThisWeek = weekSessions.reduce((acc, s) => acc + s.tasks.length, 0);
  const flashcardsGeneratedThisWeek = weekSessions.reduce((acc, s) => acc + s.flashcards.length, 0);

  const focusSuggestion = await generateFocusSuggestion(sessions, topConcepts, pendingTasks);

  return {
    user: {
      name: userFirstName,
      email: userEmail,
      firstName: userFirstName,
    },
    weekRange: {
      start: formatDate(weekAgo),
      end: formatDate(now),
    },
    stats: {
      sessionsRecorded: sessions.length,
      hoursRecorded: Number((totalSeconds / 3600).toFixed(1)),
      tasksExtracted: tasksExtractedThisWeek,
      flashcardsGenerated: flashcardsGeneratedThisWeek,
    },
    sessions,
    topConcepts,
    pendingTasks,
    flashcardDecks,
    focusSuggestion,
  };
}
