import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transcript: string = body.transcript ?? "";

    if (!transcript.trim()) {
      return NextResponse.json({ error: "Transcript is empty" }, { status: 400 });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 2048,
        messages: [
          {
            role: "system",
            content: `You are an AI that processes voice recording transcripts and returns structured data.
You must respond with ONLY a valid JSON object. No markdown fences, no preamble, no explanation — just raw JSON.
The JSON must exactly match this schema:
{
  "title": "concise descriptive session title e.g. 'Biology Lecture — Photosynthesis'",
  "shortSummary": "2-3 sentence summary",
  "detailedSummary": "4-6 sentence detailed summary",
  "keyConcepts": ["4-8 key concept strings"],
  "tasks": [{"text": "string", "priority": "High|Medium|Low", "dueDate": "string — omit key if not mentioned"}],
  "flashcards": [{"question": "string", "answer": "string"}],
  "keyMoments": [{"timestamp": "string like 0:32", "quote": "string", "why": "1 line explanation"}]
}
Generate 5-8 flashcards and 4-6 key moments. If no tasks are present return an empty array for tasks.`,
          },
          {
            role: "user",
            content: `Process this transcript and return the JSON:\n\n${transcript}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Groq error:", err);
      throw new Error(err?.error?.message || "Groq API error");
    }

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";

    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("process-recording error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to process recording", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}