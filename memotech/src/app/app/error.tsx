"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error Boundary]", error);
  }, [error]);

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 text-center"
      style={{ minHeight: "100vh", padding: "32px 24px", background: "#050505" }}
    >
      <p style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 700, color: "#f87171" }}>
        Something went wrong
      </p>
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 13,
          color: "#a1a1aa",
          maxWidth: 360,
          lineHeight: 1.6,
          wordBreak: "break-word",
        }}
      >
        {error.message || "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#52525b" }}>
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="rounded-lg px-5 py-2.5"
        style={{
          background: "#c96acb",
          color: "#0a0a0a",
          fontFamily: "var(--font-inter)",
          fontSize: 14,
          fontWeight: 600,
          border: "none",
        }}
      >
        Try again
      </button>
    </div>
  );
}