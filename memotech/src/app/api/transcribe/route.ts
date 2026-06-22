import { NextRequest, NextResponse } from "next/server";

// POST /api/transcribe
// Accepts an audio file (multipart/form-data, field name "audio") and
// returns the transcribed text using Deepgram's pre-recorded transcription API.
// Used as the mobile recording path, since the Web Speech API (live,
// in-browser transcription) is unreliable on iOS Safari and Android Chrome.
export async function POST(req: NextRequest) {
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      console.error("[POST /api/transcribe] DEEPGRAM_API_KEY is not configured");
      return NextResponse.json(
        { error: "Transcription is not configured yet" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const mimeType = audioFile.type || "audio/webm";

    const res = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true",
      {
        method: "POST",
        headers: {
          "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": mimeType,
        },
        body: audioBuffer,
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[POST /api/transcribe] Deepgram error:", errText);
      return NextResponse.json(
        { error: "Transcription failed", detail: errText },
        { status: 502 }
      );
    }

    const data = await res.json();
    const transcript: string =
      data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: "No speech detected in the recording" },
        { status: 422 }
      );
    }

    return NextResponse.json({ transcript });
  } catch (err) {
    console.error("[POST /api/transcribe]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to transcribe audio" }, { status: 500 });
  }
}