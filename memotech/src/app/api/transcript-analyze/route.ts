// app/api/transcript-analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();
    if (!transcript || transcript.length < 10) {
      return NextResponse.json({ flagged: [] });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const words = transcript.split(/(\s+)/);
    const wordList = words
      .map((w: string, i: number) => ({ i, w }))
      .filter(({ w }: { w: string }) => !/^\s+$/.test(w));

    const prompt = `You are a transcript accuracy checker. Given a transcript, identify words that are likely misheard or transcription errors — things that don't make grammatical or contextual sense, sound like they could be homophones, or seem out of place.

Transcript:
"""
${transcript.slice(0, 3000)}
"""

Word index list (index: word):
${wordList.slice(0, 200).map(({ i, w }: { i: number; w: string }) => `${i}: "${w}"`).join("\n")}

Return a JSON array of flagged words. For each flagged word, provide:
- index: the word index from the list above
- word: the original word
- suggestions: array of exactly 3 likely correct alternatives

Only flag words that are genuinely uncertain — do NOT flag proper nouns, technical terms, or words that make sense in context. If the transcript looks clean, return an empty array.

Respond with ONLY a JSON array, no markdown, no explanation:
[{"index": 5, "word": "their", "suggestions": ["there", "they're", "the"]}, ...]`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content ?? "[]";
    const clean = raw.replace(/```json|```/g, "").trim();

    let flagged = [];
    try {
      flagged = JSON.parse(clean);
      // Validate shape
      flagged = flagged.filter((f: { index: number; word: string; suggestions: string[] }) =>
        typeof f.index === "number" &&
        typeof f.word === "string" &&
        Array.isArray(f.suggestions) &&
        f.suggestions.length > 0
      );
    } catch {
      flagged = [];
    }

    return NextResponse.json({ flagged });
  } catch (err) {
    console.error("[transcript-analyze]", err);
    return NextResponse.json({ flagged: [] });
  }
}