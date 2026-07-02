"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Square, Mic } from "lucide-react";
import MobileAudioRecorder, { pickSupportedMimeType } from "./MobileAudioRecorder";

interface SpeechRecognitionResultItem { transcript: string; }
interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionResultItem;
}
interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}
interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: ISpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
interface ISpeechRecognitionConstructor { new (): ISpeechRecognition; }

function getSR(): ISpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export interface RecordButtonProps {
  onRecordingComplete: (transcript: string, duration: number) => void;
  maxDurationSeconds?: number;
  onStartRef?: (fn: () => void) => void;
  onStopRef?: (fn: () => void) => void;
  onRecordingStateChange?: (recording: boolean) => void;
}

export default function RecordButton({
  onRecordingComplete,
  maxDurationSeconds = 600,
  onStartRef,
  onStopRef,
  onRecordingStateChange,
}: RecordButtonProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  const checkMobileStatus = useCallback(() => {
    const mobile = isMobileDevice() || window.innerWidth < 768;
    setIsMobile(mobile);
    setHasSpeechSupport(!!getSR());
  }, []);

  useEffect(() => {
    checkMobileStatus();
    window.addEventListener("resize", checkMobileStatus);
    return () => window.removeEventListener("resize", checkMobileStatus);
  }, [checkMobileStatus]);

  if (isMobile === null) return <div style={{ minHeight: 280 }} />;

  if (isMobile) {
    return (
      <MobileAudioRecorder
        onRecordingComplete={onRecordingComplete}
        maxDurationSeconds={maxDurationSeconds}
        onStartRef={onStartRef}
        onStopRef={onStopRef}
        onRecordingStateChange={onRecordingStateChange}
      />
    );
  }

  return (
    <DesktopRecordButton
      onRecordingComplete={onRecordingComplete}
      maxDurationSeconds={maxDurationSeconds}
      onStartRef={onStartRef}
      onStopRef={onStopRef}
      onRecordingStateChange={onRecordingStateChange}
      hasSpeechSupport={hasSpeechSupport}
    />
  );
}

function DesktopRecordButton({
  onRecordingComplete,
  maxDurationSeconds = 600,
  onStartRef,
  onStopRef,
  onRecordingStateChange,
  hasSpeechSupport,
}: RecordButtonProps & { hasSpeechSupport: boolean }) {
  const [recState, setRecState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [timer, setTimer] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(20).fill(8));
  const [error, setError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isStoppingRef = useRef(false);
  const isTranscribingRef = useRef(false);
  const stopRef = useRef<() => void>(() => {});

  // Real audio capture — this is the source of truth for the final transcript
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>("");

  const animateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const step = Math.floor(data.length / 20);
    const newBars = Array.from({ length: 20 }, (_, i) => {
      const val = data[i * step] / 255;
      return Math.max(8, Math.round(val * 56));
    });
    setBars(newBars);
    animFrameRef.current = requestAnimationFrame(animateWaveform);
  }, []);

  // Hard-abort everything — used on unmount and on startup errors only.
  // The normal stop path does NOT use this (it needs the recorder's final blob first).
  const abortAll = useCallback(() => {
    isStoppingRef.current = true;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      try { recognitionRef.current.stop(); } catch { /* ok */ }
      recognitionRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try { recorderRef.current.stop(); } catch { /* ok */ }
    }
    recorderRef.current = null;
    audioChunksRef.current = [];
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    analyserRef.current = null;
    isStoppingRef.current = false;
    setBars(Array(20).fill(8));
    setLiveTranscript("");
    setRecState("idle");
    onRecordingStateChange?.(false);
  }, [onRecordingStateChange]);

  const stopRecording = useCallback(async () => {
    if (isTranscribingRef.current) return;
    isTranscribingRef.current = true;
    isStoppingRef.current = true;

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      try { recognitionRef.current.stop(); } catch { /* ok */ }
      recognitionRef.current = null;
    }

    setRecState("transcribing");
    onRecordingStateChange?.(false);

    // Wait for the recorder to flush its final blob
    await new Promise<void>((resolve) => {
      if (!recorderRef.current || recorderRef.current.state === "inactive") { resolve(); return; }
      recorderRef.current.onstop = () => resolve();
      recorderRef.current.stop();
    });

    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    analyserRef.current = null;

    const mime = mimeTypeRef.current || "audio/webm";
    const blob = new Blob(audioChunksRef.current, { type: mime });
    audioChunksRef.current = [];

    let transcript = "";
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": blob.type || "audio/webm" },
        body: blob,
      });
      if (res.ok) {
        const data = await res.json();
        transcript = data.transcript ?? "";
      }
    } catch {
      // fall through, handled by empty-transcript check below
    }

    isStoppingRef.current = false;
    isTranscribingRef.current = false;
    setBars(Array(20).fill(8));
    setLiveTranscript("");
    setRecState("idle");

    if (!transcript.trim()) {
      setError("No speech detected. Please try again.");
      return;
    }
    onRecordingComplete(transcript.trim(), duration);
  }, [onRecordingComplete, onRecordingStateChange]);

  useEffect(() => { stopRef.current = stopRecording; }, [stopRecording]);

  const startRecording = useCallback(async () => {
    audioChunksRef.current = [];
    setError(null);
    setLiveTranscript("");
    setTimer(0);

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = micStream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(micStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Real audio recording — this is what actually gets transcribed
      const mimeType = pickSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const recorder = new MediaRecorder(micStream, mimeType ? { mimeType } : {});
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(1000);
      recorderRef.current = recorder;

      // Web Speech API — cosmetic live captions only, never used as the final transcript
      const SR = getSR();
      if (SR) {
        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognitionRef.current = recognition;

        let finalTranscript = "";
        recognition.onresult = (e: ISpeechRecognitionEvent) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + " ";
            else interim += e.results[i][0].transcript;
          }
          setLiveTranscript(finalTranscript + interim);
        };

        recognition.onerror = (e: Event) => {
          const err = e as unknown as { error: string };
          if (err.error === "aborted") return;
          if (err.error === "not-allowed" || err.error === "service-not-allowed") {
            setError("Speech recognition permission was blocked.");
          }
        };

        recognition.onend = () => {
          if (isStoppingRef.current) return;
          if (recognitionRef.current) {
            try { recognitionRef.current.start(); } catch { /* ok */ }
          }
        };

        recognition.start();
      }

      startTimeRef.current = Date.now();
      setRecState("recording");
      onRecordingStateChange?.(true);

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimer(elapsed);
        if (elapsed >= maxDurationSeconds) stopRef.current();
      }, 500);
      animFrameRef.current = requestAnimationFrame(animateWaveform);
    } catch (err: unknown) {
      const domErr = err as DOMException;
      if (domErr?.name === "NotAllowedError") {
        setError("Microphone access blocked. Allow it in your browser settings.");
      } else if (domErr?.name === "NotFoundError") {
        setError("No microphone found.");
      } else {
        setError("Couldn't access the microphone.");
      }
      abortAll();
    }
  }, [animateWaveform, maxDurationSeconds, abortAll, onRecordingStateChange]);

  useEffect(() => { onStartRef?.(startRecording); }, [startRecording, onStartRef]);
  useEffect(() => { onStopRef?.(stopRecording); }, [stopRecording, onStopRef]);

  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try { recognitionRef.current.stop(); } catch { /* ok */ }
      }
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        try { recorderRef.current.stop(); } catch { /* ok */ }
      }
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  const handleClick = () => {
    if (recState === "idle") startRecording();
    else if (recState === "recording") stopRecording();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const remaining = maxDurationSeconds - timer;

  return (
    <div className="flex flex-col items-center gap-7 w-full" style={{ maxWidth: 420 }}>
      {recState === "recording" && (
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 700, color: "#c96acb", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Recording
          </span>
          <span style={{ fontFamily: "var(--font-syne)", fontSize: 48, fontWeight: 700, color: "#fff", letterSpacing: "0.01em" }}>
            {formatTime(timer)}
          </span>
        </div>
      )}

      {recState === "transcribing" && (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full animate-spin" style={{ width: 36, height: 36, border: "3px solid #2a1f2e", borderTopColor: "#c96acb" }} />
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#a1a1aa" }}>Transcribing…</span>
        </div>
      )}

      <div className="flex items-end gap-1 transition-opacity duration-300" style={{ height: 48, opacity: recState === "recording" ? 1 : 0 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ width: 3.5, height: h * 0.85, background: "#c96acb", borderRadius: 3, transition: "height 80ms ease", opacity: 0.55 + (h / 64) * 0.45 }} />
        ))}
      </div>

      {recState === "recording" && hasSpeechSupport && liveTranscript && (
        <div className="w-full rounded-2xl border" style={{ background: "#0e0a10", borderColor: "#1c1620", padding: "18px" }}>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700, color: "#c96acb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Live preview
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#a1a1aa", lineHeight: 1.7 }}>
            &ldquo;{liveTranscript.slice(-180)}{liveTranscript.length > 180 ? "…" : ""}&rdquo;
          </p>
        </div>
      )}

      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        {recState === "recording" && (
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ border: "1.5px solid #c96acb", opacity: 0.35, animation: "pulse-ring 2s ease-in-out infinite" }} />
        )}
        {recState === "idle" && (
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ border: "1.5px solid #c96acb", opacity: 0.3, animation: "idle-pulse 3s ease-in-out infinite" }} />
        )}
        <button
          onClick={handleClick}
          disabled={recState === "transcribing"}
          style={{
            width: 88, height: 88, borderRadius: "50%",
            background: recState === "recording" ? "linear-gradient(145deg, #f87171, #ef4444)" : "linear-gradient(145deg, #d97fdb, #c96acb)",
            border: "none", cursor: recState === "transcribing" ? "default" : "pointer",
            opacity: recState === "transcribing" ? 0.5 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 1,
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
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

      {recState === "recording" && remaining <= 60 && (
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#f87171", textAlign: "center" }}>
          {remaining}s remaining
        </p>
      )}

      {error && (
        <p style={{ color: "#f87171", fontFamily: "var(--font-inter)", fontSize: 13, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
          {error}
        </p>
      )}

      <style>{`
        @keyframes idle-pulse { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.08);opacity:0.15}}
        @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:0.35} 50%{transform:scale(1.06);opacity:0.15} }
      `}</style>
    </div>
  );
}