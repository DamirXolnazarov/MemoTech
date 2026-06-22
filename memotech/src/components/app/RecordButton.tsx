"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Square, Mic } from "lucide-react";
import MobileAudioRecorder from "./MobileAudioRecorder";

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

interface RecordButtonProps {
  onRecordingComplete: (transcript: string, duration: number) => void;
  maxDurationSeconds?: number;
}

export default function RecordButton({
  onRecordingComplete,
  maxDurationSeconds = 600,
}: RecordButtonProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  useEffect(() => {
    setIsMobile(isMobileDevice());
    setHasSpeechSupport(!!getSR());
  }, []);

  // Avoid SSR/CSR mismatch — render nothing meaningful until we know
  // which path to take (this resolves in a single render frame)
  if (isMobile === null) {
    return <div style={{ minHeight: 280 }} />;
  }

  // Mobile (or any browser without Web Speech support): real audio
  // recording + server-side Deepgram transcription.
  if (isMobile || !hasSpeechSupport) {
    return (
      <MobileAudioRecorder
        onRecordingComplete={onRecordingComplete}
        maxDurationSeconds={maxDurationSeconds}
      />
    );
  }

  // Desktop Chrome/Edge: live in-browser Web Speech API transcription.
  return (
    <DesktopRecordButton
      onRecordingComplete={onRecordingComplete}
      maxDurationSeconds={maxDurationSeconds}
    />
  );
}

function DesktopRecordButton({ onRecordingComplete, maxDurationSeconds = 600 }: RecordButtonProps) {
  const [recState, setRecState] = useState<"idle" | "recording">("idle");
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
  const transcriptRef = useRef("");
  const isStoppingRef = useRef(false);
  const stopRef = useRef<() => void>(() => {});

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

  const cleanupAll = useCallback(() => {
    isStoppingRef.current = true;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    analyserRef.current = null;
    isStoppingRef.current = false;
    setBars(Array(20).fill(8));
    setLiveTranscript("");
    setRecState("idle");
  }, []);

  const stopRecording = useCallback(() => {
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalTranscript = transcriptRef.current;
    cleanupAll();
    if (!finalTranscript.trim()) {
      setError("No speech detected. Please try again.");
      return;
    }
    onRecordingComplete(finalTranscript.trim(), duration);
  }, [cleanupAll, onRecordingComplete]);

  useEffect(() => { stopRef.current = stopRecording; }, [stopRecording]);

  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try { recognitionRef.current.stop(); } catch { /* ok */ }
        recognitionRef.current = null;
      }
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  const startRecording = useCallback(async () => {
    transcriptRef.current = "";
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
          transcriptRef.current = finalTranscript + interim;
          setLiveTranscript(transcriptRef.current);
        };

        recognition.onerror = (e: Event) => {
          const err = e as unknown as { error: string };
          if (err.error === "aborted") return;
          if (err.error === "not-allowed" || err.error === "service-not-allowed") {
            setError("Speech recognition permission was blocked. Reload and allow access.");
          } else if (err.error === "network") {
            setError("Speech recognition needs an internet connection.");
          }
        };

        recognition.onend = () => {
          if (isStoppingRef.current) return;
          if (recognitionRef.current) {
            try { recognitionRef.current.start(); } catch { /* already started */ }
          }
        };

        recognition.start();
      }

      startTimeRef.current = Date.now();
      setRecState("recording");
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimer(elapsed);
        if (elapsed >= maxDurationSeconds) stopRef.current();
      }, 500);
      animFrameRef.current = requestAnimationFrame(animateWaveform);
    } catch (err: unknown) {
      const domErr = err as DOMException;
      if (domErr?.name === "NotAllowedError") {
        setError("Microphone access is blocked. Click the lock icon in your address bar, allow it, then reload.");
      } else if (domErr?.name === "NotFoundError") {
        setError("No microphone was found on this device.");
      } else if (domErr?.name === "NotReadableError") {
        setError("Your microphone is being used by another app. Close it and try again.");
      } else {
        setError("Couldn't access the microphone. Please check permissions and try again.");
      }
      cleanupAll();
    }
  }, [animateWaveform, maxDurationSeconds, cleanupAll]);

  const handleClick = () => {
    if (recState === "idle") startRecording();
    else stopRecording();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const remaining = maxDurationSeconds - timer;

  return (
    <div className="flex flex-col items-center gap-7 w-full" style={{ maxWidth: 420 }}>
      {recState === "recording" ? (
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 700, color: "#c96acb", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Recording
          </span>
          <span style={{ fontFamily: "var(--font-syne)", fontSize: 48, fontWeight: 700, color: "#fff", letterSpacing: "0.01em" }}>
            {formatTime(timer)}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 md:hidden">
          <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: "rgba(201,106,203,0.08)", border: "1px solid rgba(201,106,203,0.2)" }}>
            <Mic size={26} style={{ color: "#c96acb" }} />
          </div>
        </div>
      )}

      <div className="flex items-end gap-1 transition-opacity duration-300" style={{ height: 48, opacity: recState === "recording" ? 1 : 0 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ width: 3.5, height: h * 0.85, background: "#c96acb", borderRadius: 3, transition: "height 80ms ease", opacity: 0.55 + (h / 64) * 0.45 }} />
        ))}
      </div>

      {recState === "recording" && liveTranscript && (
        <div className="w-full rounded-2xl border" style={{ background: "#0e0a10", borderColor: "#1c1620", padding: "18px 18px" }}>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700, color: "#c96acb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Live transcript
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#a1a1aa", lineHeight: 1.7 }}>
            &ldquo;{liveTranscript.slice(-180)}{liveTranscript.length > 180 ? "…" : ""}&rdquo;
          </p>
        </div>
      )}

      <div className="relative flex items-center justify-center" style={{ marginTop: recState === "recording" ? 4 : 8 }}>
        {recState === "recording" && (
          <div className="absolute rounded-full" style={{ width: 116, height: 116, border: "1.5px solid #c96acb", opacity: 0.35, animation: "pulse-ring 2s ease-in-out infinite" }} />
        )}
        {recState === "idle" && (
          <div className="absolute rounded-full" style={{ width: 116, height: 116, border: "1.5px solid #c96acb", opacity: 0.3, animation: "idle-pulse 3s ease-in-out infinite" }} />
        )}
        <button
          onClick={handleClick}
          style={{
            width: 88, height: 88, borderRadius: "50%",
            background: recState === "recording" ? "linear-gradient(145deg, #f87171, #ef4444)" : "linear-gradient(145deg, #d97fdb, #c96acb)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.15s ease", position: "relative", zIndex: 1,
            boxShadow: recState === "recording" ? "0 6px 24px rgba(239,68,68,0.4)" : "0 6px 24px rgba(201,106,203,0.4)",
          }}
          className="active:scale-95"
          aria-label={recState === "idle" ? "Start recording" : "Stop recording"}
        >
          {recState === "idle" ? <Mic size={32} color="#0a0a0a" strokeWidth={2.2} /> : <Square size={26} color="#0a0a0a" fill="#0a0a0a" />}
        </button>
      </div>

      {recState === "idle" && (
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#71717a" }}>Tap to start recording</p>
      )}

      {recState === "recording" && remaining <= 60 && (
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#f87171", textAlign: "center" }}>
          {remaining}s remaining — stops automatically
        </p>
      )}

      {error && (
        <p style={{ color: "#f87171", fontFamily: "var(--font-inter)", fontSize: 13, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
          {error}
        </p>
      )}

      <p style={{ fontSize: 11, color: "#333", fontFamily: "var(--font-inter)" }}>
        Live transcription powered by your browser.
      </p>

      <style>{`
        @keyframes idle-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.08); opacity: 0.15; }
        }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.35; }
          50% { transform: scale(1.06); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}