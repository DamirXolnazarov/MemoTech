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
  const prompt = `You are Memo, a personal AI memory assistant. A user has just completed their week and here is what they recorded:

Sessions this week:
${sessions.map((s) => `- ${s.title} (${s.duration}): ${s.summary}`).join("\n")}

Key concepts absorbed:
${concepts.join(", ")}

Pending tasks not yet completed:
${pendingTasks.map((t) => `- ${t.text} (${t.priority} priority${t.dueDate ? `, due ${t.dueDate}` : ""})`).join("\n")}

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

export async function generateDigestData(userId: string): Promise<DigestData> {
  // Mock data — replace with real DB queries when your database is live.
  // Structure mirrors exactly what you'd return from Prisma/Supabase queries.

  const sessions: DigestData["sessions"] = [
    {
      title: "Biology — Photosynthesis Deep Dive",
      date: "Monday, June 9",
      duration: "47 min",
      summary:
        "Covered the light-dependent and light-independent reactions, with extended discussion on the role of chlorophyll and the electron transport chain. Several questions about the Calvin cycle remained unresolved.",
    },
    {
      title: "Economics — Market Structures Lecture",
      date: "Tuesday, June 10",
      duration: "58 min",
      summary:
        "Detailed walkthrough of monopoly vs oligopoly pricing behaviour, including real-world case studies from the pharma industry. Includes key formulas for the upcoming Monday deadline.",
    },
    {
      title: "Biology — Cellular Respiration Revision",
      date: "Thursday, June 12",
      duration: "32 min",
      summary:
        "Quick revision session linking ATP synthesis in mitochondria back to the electron transport chain concepts from Monday. Solidified understanding of glycolysis steps.",
    },
    {
      title: "Philosophy — Epistemology Introduction",
      date: "Friday, June 13",
      duration: "41 min",
      summary:
        "First encounter with Descartes' Meditations and the methodological doubt framework. Recorded personal reflections on the relationship between rationalism and empiricism.",
    },
  ];

  const topConcepts: string[] = [
    "Electron transport chain",
    "Calvin cycle",
    "Chlorophyll absorption",
    "Monopoly pricing",
    "Nash equilibrium",
    "Glycolysis",
    "Methodological doubt",
    "ATP synthesis",
  ];

  const pendingTasks: DigestData["pendingTasks"] = [
    {
      text: "Submit Economics essay on market structures",
      priority: "High",
      dueDate: "Monday, June 16",
      sourceSession: "Economics — Market Structures Lecture",
    },
    {
      text: "Review light-dependent reaction diagrams before next bio lecture",
      priority: "High",
      sourceSession: "Biology — Photosynthesis Deep Dive",
    },
    {
      text: "Read Descartes Meditations I and II in full",
      priority: "Medium",
      dueDate: "Wednesday, June 18",
      sourceSession: "Philosophy — Epistemology Introduction",
    },
    {
      text: "Create flashcard deck for ATP synthesis pathway",
      priority: "Medium",
      sourceSession: "Biology — Cellular Respiration Revision",
    },
    {
      text: "Find oligopoly case study to add to essay",
      priority: "Low",
      sourceSession: "Economics — Market Structures Lecture",
    },
  ];

  const flashcardDecks: DigestData["flashcardDecks"] = [
    { name: "Biology: Cell Biology Basics", cardCount: 34, lastReviewed: "8 days ago" },
    { name: "Economics: Key Definitions", cardCount: 22, lastReviewed: "12 days ago" },
    { name: "Philosophy: Core Arguments", cardCount: 18, lastReviewed: "14 days ago" },
  ];

  const focusSuggestion = await generateFocusSuggestion(sessions, topConcepts, pendingTasks);

  return {
    user: {
      name: userId,
      email: "user@example.com",
      firstName: "there",
    },
    weekRange: {
      start: "June 9, 2025",
      end: "June 15, 2025",
    },
    stats: {
      sessionsRecorded: sessions.length,
      hoursRecorded: Number(
        (sessions.reduce((acc, s) => acc + parseInt(s.duration), 0) / 60).toFixed(1)
      ),
      tasksExtracted: pendingTasks.length,
      flashcardsGenerated: flashcardDecks.reduce((acc, d) => acc + d.cardCount, 0),
    },
    sessions,
    topConcepts,
    pendingTasks,
    flashcardDecks,
    focusSuggestion,
  };
}