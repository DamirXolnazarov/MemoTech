"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, Square } from "lucide-react";

interface MobileAudioRecorderProps {
  onRecordingComplete: (transcript: string, duration: number) => void;
  maxDurationSeconds?: number;
  onStartRef?: (fn: () => void) => void;
  onStopRef?: (fn: () => void) => void;
  onRecordingStateChange?: (recording: boolean) => void;
}

const CHUNK_INTERVAL_MS = 60_000;

function pickSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  const candidates = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export default function MobileAudioRecorder({
  onRecordingComplete,
  maxDurationSeconds = 600,
  onStartRef,
  onStopRef,
  onRecordingStateChange,
}: MobileAudioRecorderProps) {
  const [recState, setRecState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [liveText, setLiveText] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentChunkBlobs = useRef<Blob[]>([]);
  const transcriptPartsRef = useRef<string[]>([]);
  const mimeTypeRef = useRef<string>("");
  const stopRequestedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (chunkTimerRef.current) { clearInterval(chunkTimerRef.current); chunkTimerRef.current = null; }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try { recorderRef.current.stop(); } catch { /* ok */ }
    }
    recorderRef.current = null;
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  }, []);

  useEffect(() => { return () => cleanup(); }, [cleanup]);

  const transcribeChunk = useCallback(async (blob: Blob): Promise<string> => {
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": blob.type || "audio/webm" },
        body: blob,
        redirect: "follow",
      });
      if (!res.ok) return "";
      const data = await res.json();
      const text = data.transcript ?? "";
      if (text) setLiveText((prev) => prev ? prev + " " + text : text);
      return text;
    } catch { return ""; }
  }, []);

  const flushCurrentChunk = useCallback(async () => {
    if (currentChunkBlobs.current.length === 0) return;
    const mime = mimeTypeRef.current || "audio/webm";
    const blob = new Blob(currentChunkBlobs.current, { type: mime });
    currentChunkBlobs.current = [];
    await transcribeChunk(blob);
  }, [transcribeChunk]);

  const stopRecording = useCallback(async () => {
    if (stopRequestedRef.current) return;
    stopRequestedRef.current = true;

    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (chunkTimerRef.current) { clearInterval(chunkTimerRef.current); chunkTimerRef.current = null; }

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setRecState("transcribing");
    onRecordingStateChange?.(false);

    await new Promise<void>((resolve) => {
      if (!recorderRef.current || recorderRef.current.state === "inactive") { resolve(); return; }
      recorderRef.current.onstop = () => resolve();
      recorderRef.current.stop();
    });

    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    await flushCurrentChunk();

    const fullTranscript = transcriptPartsRef.current.join(" ").trim() || liveText.trim();
    setRecState("idle");
    setLiveText("");

    if (!fullTranscript) {
      setError("No speech detected. Please speak clearly and try again.");
      return;
    }
    onRecordingComplete(fullTranscript, duration);
  }, [flushCurrentChunk, onRecordingComplete, onRecordingStateChange, liveText]);

  const startRecording = useCallback(async () => {
    setError(null);
    setLiveText("");
    transcriptPartsRef.current = [];
    currentChunkBlobs.current = [];
    stopRequestedRef.current = false;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: unknown) {
      const domErr = err as DOMException;
      if (domErr?.name === "NotAllowedError") setError("Microphone blocked. Allow it in settings and reload.");
      else if (domErr?.name === "NotFoundError") setError("No microphone found.");
      else setError(`Microphone error: ${domErr?.message ?? "unknown"}`);
      return;
    }

    streamRef.current = stream;
    const mimeType = pickSupportedMimeType();
    mimeTypeRef.current = mimeType;

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) currentChunkBlobs.current.push(e.data);
    };

    recorder.start(1000);
    startTimeRef.current = Date.now();
    setTimer(0);
    setRecState("recording");
    onRecordingStateChange?.(true);

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setTimer(elapsed);
      if (elapsed >= maxDurationSeconds) stopRecording();
    }, 500);

    chunkTimerRef.current = setInterval(() => { flushCurrentChunk(); }, CHUNK_INTERVAL_MS);
  }, [maxDurationSeconds, flushCurrentChunk, stopRecording, onRecordingStateChange]);

  // Expose start/stop to parent for VoiceMode
  useEffect(() => { onStartRef?.(startRecording); }, [startRecording, onStartRef]);
  useEffect(() => { onStopRef?.(stopRecording); }, [stopRecording, onStopRef]);

  const handleClick = useCallback(() => {
    if (recState === "idle") startRecording();
    else if (recState === "recording") stopRecording();
  }, [recState, startRecording, stopRecording]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full" style={{ maxWidth: 420 }}>
      {recState === "recording" && (
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 700, color: "#c96acb", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Recording
          </span>
          <span style={{ fontFamily: "var(--font-syne)", fontSize: 48, fontWeight: 700, color: "#fff" }}>
            {formatTime(timer)}
          </span>
        </div>
      )}

      {recState === "recording" && liveText && (
        <div className="w-full rounded-2xl border p-4" style={{ background: "#0e0a10", borderColor: "#1c1620" }}>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700, color: "#c96acb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            Transcript
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#a1a1aa", lineHeight: 1.7 }}>
            {liveText.slice(-300)}{liveText.length > 300 ? "…" : ""}
          </p>
        </div>
      )}

      {recState === "transcribing" && (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full animate-spin" style={{ width: 36, height: 36, border: "3px solid #2a1f2e", borderTopColor: "#c96acb" }} />
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#a1a1aa" }}>Transcribing…</span>
        </div>
      )}

      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        {recState !== "transcribing" && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border: "1.5px solid #c96acb",
              opacity: recState === "recording" ? 0.35 : 0.3,
              animation: recState === "recording" ? "pulse-ring 2s ease-in-out infinite" : "idle-pulse 3s ease-in-out infinite",
            }}
          />
        )}
        <button
          onPointerUp={handleClick}
          disabled={recState === "transcribing"}
          style={{
            width: 88, height: 88, borderRadius: "50%",
            background: recState === "recording" ? "linear-gradient(145deg, #f87171, #ef4444)" : "linear-gradient(145deg, #d97fdb, #c96acb)",
            border: "none", cursor: recState === "transcribing" ? "default" : "pointer",
            opacity: recState === "transcribing" ? 0.5 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 10,
            WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
            boxShadow: recState === "recording" ? "0 6px 24px rgba(239,68,68,0.4)" : "0 6px 24px rgba(201,106,203,0.4)",
          }}
          className="active:scale-95"
          aria-label={recState === "idle" ? "Start recording" : "Stop recording"}
        >
          {recState === "idle" && <Mic size={32} color="#0a0a0a" strokeWidth={2.2} />}
          {recState === "recording" && <Square size={26} color="#0a0a0a" fill="#0a0a0a" />}
          {recState === "transcribing" && (
            <div className="rounded-full animate-spin" style={{ width: 24, height: 24, border: "2.5px solid rgba(10,10,10,0.3)", borderTopColor: "#0a0a0a" }} />
          )}
        </button>
      </div>

      {recState === "idle" && (
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#71717a" }}>Tap to start recording</p>
      )}

      {error && (
        <p style={{ color: "#f87171", fontFamily: "var(--font-inter)", fontSize: 13, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
          {error}
        </p>
      )}

      <style>{`
        @keyframes idle-pulse { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.08);opacity:0.15} }
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:0.35} 50%{transform:scale(1.06);opacity:0.15} }
      `}</style>
    </div>
  );
}