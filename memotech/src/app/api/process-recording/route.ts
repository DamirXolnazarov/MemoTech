import { NextRequest, NextResponse } from "next/server";

const SCHEMA = `{
  "title": "concise descriptive session title",
  "shortSummary": "2-3 sentence summary",
  "detailedSummary": "4-6 sentence detailed summary",
  "keyConcepts": ["4-8 key concept strings"],
  "tasks": [{"text": "string", "priority": "High|Medium|Low", "dueDate": "optional string"}],
  "flashcards": [{"question": "string", "answer": "string"}],
  "keyMoments": [{"timestamp": "string like 0:32", "quote": "string", "why": "1 line explanation"}]
}`;

function extractJSON(raw: string): string {
  // Strip markdown fences
  let s = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  // Find first { and last } to extract just the JSON object
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }
  return s;
}

function sanitizeJSON(raw: string): string {
  // Remove control characters that break JSON.parse
  return raw.replace(/[\u0000-\u001F\u007F]/g, (ch) => {
    if (ch === "\n") return "\\n";
    if (ch === "\r") return "\\r";
    if (ch === "\t") return "\\t";
    return "";
  });
}

async function callGroq(transcript: string, maxTokens: number) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: maxTokens,
      messages: [
        {
          role: "system",
          content: `You are an AI that processes voice recording transcripts and returns structured data.
Respond with ONLY a valid JSON object — no markdown, no fences, no explanation, no trailing commas.
All string values must be properly escaped. Keep string values concise to avoid truncation.
Schema: ${SCHEMA}
Rules:
- title: max 60 chars
- shortSummary: max 200 chars
- detailedSummary: max 500 chars  
- keyConcepts: 4-6 items, max 40 chars each
- tasks: extract only explicit tasks/deadlines, empty array if none
- flashcards: 4-6 items, question max 100 chars, answer max 150 chars
- keyMoments: 3-5 items, quote max 100 chars, why max 80 chars
- dueDate: omit the key entirely if not mentioned`,
        },
        {
          role: "user",
          content: `Process this transcript:\n\n${transcript.slice(0, 4000)}`,
        },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || "Groq API error");
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transcript: string = body.transcript ?? "";
    if (!transcript.trim()) {
      return NextResponse.json({ error: "Transcript is empty" }, { status: 400 });
    }

    // Try with 2048 tokens first, retry with 1500 if JSON is malformed
    let parsed: Record<string, unknown> | null = null;
    const attempts = [2048, 1500];

    for (const maxTokens of attempts) {
      try {
        const data = await callGroq(transcript, maxTokens);
        const raw: string = data.choices?.[0]?.message?.content ?? "";
        const extracted = extractJSON(raw);
        const sanitized = sanitizeJSON(extracted);
        parsed = JSON.parse(sanitized);
        break;
      } catch (parseErr) {
        console.error(`process-recording parse failed (maxTokens=${maxTokens}):`, parseErr instanceof Error ? parseErr.message : parseErr);
        if (maxTokens === attempts[attempts.length - 1]) throw parseErr;
        // else continue to next attempt
      }
    }

    if (!parsed) throw new Error("Failed to parse Groq response after retries");

    // Ensure required fields exist with safe defaults
    const result = {
      title: String(parsed.title ?? "Untitled Session"),
      shortSummary: String(parsed.shortSummary ?? ""),
      detailedSummary: String(parsed.detailedSummary ?? ""),
      keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
      keyMoments: Array.isArray(parsed.keyMoments) ? parsed.keyMoments : [],
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("process-recording error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to process recording", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}