"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceModeProps {
  onWakeWord: () => void;
  onStopWord: () => void;
  isRecording: boolean;
  disabled?: boolean;
}

// Wake phrases — any of these trigger recording
const WAKE_PHRASES = ["hey memo", "memo", "hi memo", "ok memo"];
// Stop phrases — any of these stop recording
const STOP_PHRASES = ["memo stop", "stop memo", "memo stop recording", "stop recording"];

type ListenState = "off" | "listening" | "active";

interface ISpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    length: number;
    [i: number]: { isFinal: boolean; [j: number]: { transcript: string } };
  };
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
type ISpeechRecognitionCtor = new () => ISpeechRecognition;

function getSR(): ISpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: ISpeechRecognitionCtor;
    webkitSpeechRecognition?: ISpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function matchesAny(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase().trim();
  return phrases.some((p) => lower.includes(p));
}

export default function VoiceMode({ onWakeWord, onStopWord, isRecording, disabled }: VoiceModeProps) {
  const [supported, setSupported] = useState(true);
  const [listenState, setListenState] = useState<ListenState>("off");
  const [lastHeard, setLastHeard] = useState<string>("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const srRef = useRef<ISpeechRecognition | null>(null);
  const shouldRestartRef = useRef(false);
  const isRecordingRef = useRef(isRecording);

  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  useEffect(() => {
    if (!getSR()) setSupported(false);
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (srRef.current) {
      srRef.current.onend = null;
      try { srRef.current.stop(); } catch { /* ok */ }
      srRef.current = null;
    }
    setListenState("off");
    setLastHeard("");
  }, []);

  const startListening = useCallback(() => {
    const SR = getSR();
    if (!SR) return;

    const sr = new SR();
    sr.continuous = true;
    sr.interimResults = true;
    sr.lang = "en-US";
    srRef.current = sr;

    sr.onresult = (e: ISpeechRecognitionEvent) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setLastHeard(text.toLowerCase().trim());

      if (!isRecordingRef.current && matchesAny(text, WAKE_PHRASES)) {
        setListenState("active");
        onWakeWord();
      } else if (isRecordingRef.current && matchesAny(text, STOP_PHRASES)) {
        onStopWord();
      }
    };

    sr.onerror = (e: Event) => {
      const err = e as unknown as { error: string };
      if (err.error === "not-allowed") {
        setPermissionDenied(true);
        stopListening();
      }
      // aborted / no-speech are transient — let onend restart
    };

    sr.onend = () => {
      if (shouldRestartRef.current) {
        try {
          const newSR = new SR();
          newSR.continuous = true;
          newSR.interimResults = true;
          newSR.lang = "en-US";
          newSR.onresult = sr.onresult;
          newSR.onerror = sr.onerror;
          newSR.onend = sr.onend;
          srRef.current = newSR;
          newSR.start();
        } catch { /* ok */ }
      }
    };

    shouldRestartRef.current = true;
    try {
      sr.start();
      setListenState("listening");
      setPermissionDenied(false);
    } catch {
      setListenState("off");
    }
  }, [onWakeWord, onStopWord, stopListening]);

  // When recording stops, revert visual to "listening"
  useEffect(() => {
    if (!isRecording && listenState === "active") {
      setListenState("listening");
    }
  }, [isRecording, listenState]);

  // Cleanup on unmount
  useEffect(() => { return () => stopListening(); }, [stopListening]);

  const toggle = () => {
    if (listenState === "off") startListening();
    else stopListening();
  };

  if (!supported) return null;

  const isOn = listenState !== "off";

  return (
    <div className="flex flex-col items-center gap-3 w-full" style={{ maxWidth: 420 }}>

      {/* Toggle button */}
      <button
        onClick={toggle}
        disabled={disabled}
        className="flex items-center gap-2.5 rounded-2xl px-5 py-3 transition-all duration-300"
        style={{
          background: isOn ? "rgba(201,106,203,0.1)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${isOn ? "rgba(201,106,203,0.35)" : "#1a1a1a"}`,
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.5 : 1,
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
      >
        {/* Animated dot */}
        <div className="relative flex items-center justify-center" style={{ width: 20, height: 20 }}>
          {isOn && (
            <div
              className="absolute rounded-full"
              style={{
                width: 20, height: 20,
                background: "rgba(201,106,203,0.2)",
                animation: "vm-ping 2s ease-in-out infinite",
              }}
            />
          )}
          <div
            className="rounded-full flex-shrink-0"
            style={{
              width: 8, height: 8,
              background: isOn ? "#c96acb" : "#333",
              transition: "background 0.3s ease",
              boxShadow: isOn ? "0 0 8px rgba(201,106,203,0.6)" : "none",
            }}
          />
        </div>

        {isOn ? (
          <Mic size={14} color="#c96acb" strokeWidth={2} />
        ) : (
          <MicOff size={14} color="#555" strokeWidth={1.8} />
        )}

        <span style={{
          fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 500,
          color: isOn ? "#c96acb" : "#555",
          transition: "color 0.3s ease",
        }}>
          {isOn ? "Voice mode on" : "Voice mode off"}
        </span>
      </button>

      {/* Status */}
      {isOn && (
        <div className="flex flex-col items-center gap-1.5">
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#52525b", textAlign: "center" }}>
            {isRecording
              ? <>Say <span style={{ color: "#c96acb" }}>"Memo stop"</span> to stop recording</>
              : <>Say <span style={{ color: "#c96acb" }}>"Hey Memo"</span> to start recording</>
            }
          </p>
          {lastHeard && (
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#3f3f46", textAlign: "center" }}>
              heard: "{lastHeard.slice(-40)}"
            </p>
          )}
        </div>
      )}

      {permissionDenied && (
        <p style={{ color: "#f87171", fontFamily: "var(--font-inter)", fontSize: 12, textAlign: "center" }}>
          Microphone permission denied. Allow it in browser settings.
        </p>
      )}

      <style>{`
        @keyframes vm-ping {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}