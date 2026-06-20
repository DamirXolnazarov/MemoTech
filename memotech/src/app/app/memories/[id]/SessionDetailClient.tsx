"use client";

import { useRouter } from "next/navigation";
import SessionResults from "@/components/app/SessionResults";

interface ProcessedData {
  title: string;
  shortSummary: string;
  detailedSummary: string;
  keyConcepts: string[];
  tasks: Array<{ text: string; priority: "High" | "Medium" | "Low"; dueDate?: string }>;
  flashcards: Array<{ question: string; answer: string }>;
  keyMoments: Array<{ timestamp: string; quote: string; why: string }>;
}

interface SessionDetailClientProps {
  sessionId: string;
  createdAt: string;
  data: ProcessedData;
  transcript: string;
  duration: number;
}

export default function SessionDetailClient({
  sessionId,
  createdAt,
  data,
  transcript,
  duration,
}: SessionDetailClientProps) {
  const router = useRouter();

  return (
    <SessionResults
      mode="saved"
      sessionId={sessionId}
      createdAt={createdAt}
      data={data}
      transcript={transcript}
      duration={duration}
      onReset={() => router.push("/app/memories")}
    />
  );
}
