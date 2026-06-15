"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Browser Speech Recognition types (not in TS lib by default)
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}
declare const webkitSpeechRecognition: ISpeechRecognitionConstructor | undefined;

function getSR(): ISpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

interface RecordButtonProps {
  onRecordingComplete: (transcript: string, duration: number) => void;
  maxDurationSeconds?: number;
}

export default function RecordButton({
  onRecordingComplete,
  maxDurationSeconds = 600,
}: RecordButtonProps) {
  const [recState, setRecState] = useState<"idle" | "recording">("idle");
  const [timer, setTimer] = useState(0);
  const [bars, setBars] = useState<number[]>(Array(20).fill(8));
  const [error, setError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [noSpeechSupport, setNoSpeechSupport] = useState(false);
  const [fallbackText, setFallbackText] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  // keep stopRecording stable via ref so interval can call it
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!getSR()) setNoSpeechSupport(true);
  }, []);

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

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});

    setBars(Array(20).fill(8));
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalTranscript = transcriptRef.current;

    setRecState("idle");
    setLiveTranscript("");

    if (!finalTranscript.trim()) {
      setError("No speech detected. Please try again.");
      return;
    }
    onRecordingComplete(finalTranscript.trim(), duration);
  }, [onRecordingComplete]);

  // keep ref fresh so interval always sees latest version
  useEffect(() => {
    stopRef.current = stopRecording;
  }, [stopRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    setLiveTranscript("");
    transcriptRef.current = "";

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
        recognition.onresult = (e: SpeechRecognitionEvent) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) {
              finalTranscript += e.results[i][0].transcript + " ";
            } else {
              interim += e.results[i][0].transcript;
            }
          }
          transcriptRef.current = finalTranscript + interim;
          setLiveTranscript(transcriptRef.current);
        };
        // auto-restart on end so it doesn't silently stop
        recognition.onend = () => {
          if (recognitionRef.current) {
            try { recognition.start(); } catch { /* already stopped */ }
          }
        };
        recognition.start();
      }

      startTimeRef.current = Date.now();
      setTimer(0);
      setRecState("recording");
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimer(elapsed);
        if (elapsed >= maxDurationSeconds) {
          stopRef.current();
        }
      }, 500);
      animFrameRef.current = requestAnimationFrame(animateWaveform);
    } catch {
      setError("Microphone access denied. Please allow microphone access and try again.");
    }
  }, [animateWaveform, maxDurationSeconds]);

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

  if (noSpeechSupport) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <p style={{ color: "#c96acb", fontFamily: "var(--font-syne)" }} className="text-sm text-center">
          Your browser doesn&apos;t support live transcription. Please use Chrome, or paste your transcript below.
        </p>
        <textarea
          value={fallbackText}
          onChange={(e) => setFallbackText(e.target.value)}
          placeholder="Paste your transcript here..."
          style={{
            background: "#0b0b0b",
            border: "1px solid #1a1a1a",
            color: "#e5e5e5",
            fontFamily: "var(--font-inter)",
            resize: "none",
          }}
          className="w-full h-32 p-3 rounded-lg text-sm outline-none focus:border-[#c96acb]"
        />
        <button
          onClick={() => {
            if (!fallbackText.trim()) { setError("Please enter some text."); return; }
            onRecordingComplete(fallbackText.trim(), 0);
          }}
          style={{ background: "#c96acb", fontFamily: "var(--font-syne)" }}
          className="px-6 py-2 rounded-full text-white font-semibold text-sm"
        >
          Process Text
        </button>
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Waveform bars */}
      <div
        className="flex items-end gap-1 transition-opacity duration-300"
        style={{ height: 64, opacity: recState === "recording" ? 1 : 0 }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: h,
              background: "#c96acb",
              borderRadius: 2,
              transition: "height 80ms ease",
              opacity: 0.6 + (h / 64) * 0.4,
            }}
          />
        ))}
      </div>

      {/* Button */}
      <div className="relative flex items-center justify-center">
        {recState === "recording" && (
          <>
            <div
              className="absolute rounded-full animate-ping"
              style={{ width: 120, height: 120, border: "2px solid #c96acb", opacity: 0.4 }}
            />
            <div
              className="absolute rounded-full"
              style={{ width: 108, height: 108, border: "1.5px solid #c96acb", opacity: 0.2, animation: "pulse 2s ease-in-out infinite" }}
            />
          </>
        )}
        {recState === "idle" && (
          <div
            className="absolute rounded-full"
            style={{ width: 112, height: 112, border: "1.5px solid #c96acb", opacity: 0.3, animation: "idle-pulse 3s ease-in-out infinite" }}
          />
        )}
        <button
          onClick={handleClick}
          style={{
            width: 96, height: 96, borderRadius: "50%",
            background: recState === "recording" ? "#c96acb" : "transparent",
            border: recState === "recording" ? "none" : "2px solid #c96acb",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s ease",
            position: "relative", zIndex: 1,
          }}
          aria-label={recState === "idle" ? "Start recording" : "Stop recording"}
        >
          {recState === "idle" ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c96acb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          )}
        </button>
      </div>

      {/* Timer */}
      {recState === "recording" && (
        <div style={{ fontFamily: "var(--font-syne)", fontSize: 28, fontWeight: 600, color: "#c96acb", letterSpacing: "0.05em" }}>
          {formatTime(timer)}
        </div>
      )}

      {/* Label */}
      <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#555", letterSpacing: "0.03em" }}>
        {recState === "idle" ? "Click to start recording" : "Click to stop"}
      </p>

      {/* Live transcript preview */}
      {recState === "recording" && liveTranscript && (
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#444", maxWidth: 320, textAlign: "center", lineHeight: 1.6 }}>
          {liveTranscript.slice(-120)}{liveTranscript.length > 120 ? "…" : ""}
        </p>
      )}

      {/* Time warning */}
      {recState === "recording" && remaining <= 60 && (
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#f87171", letterSpacing: "0.02em" }}>
          {remaining}s remaining — recording will stop automatically
        </p>
      )}

      {error && (
        <p style={{ color: "#f87171", fontFamily: "var(--font-inter)", fontSize: 13, textAlign: "center", maxWidth: 300 }}>
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
      `}</style>
    </div>
  );
}