"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, Download } from "lucide-react";

interface SaveButtonProps {
  token: string;
  isOwnSession: boolean;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export default function SaveButton({ token, isOwnSession }: SaveButtonProps) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<SaveState>("idle");
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function doSave() {
    setState("saving");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/shared/${token}/save`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Failed to save");
      setSavedSessionId(body.savedSessionId);
      setState("saved");

      // Clean the ?save=1 param out of the URL without a full reload
      if (searchParams.get("save")) {
        const url = new URL(window.location.href);
        url.searchParams.delete("save");
        router.replace(url.pathname + url.search);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  // Auto-save on return from sign-up if ?save=1 is present and we're
  // now signed in.
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && searchParams.get("save") === "1" && state === "idle") {
      doSave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn]);

  if (isOwnSession) return null;

  function handleClick() {
    if (!isSignedIn) {
      const returnTo = encodeURIComponent(`${window.location.pathname}?save=1`);
      router.push(`/sign-up?redirect_url=${returnTo}`);
      return;
    }
    doSave();
  }

  if (state === "saved" && savedSessionId) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl border px-4 py-3"
        style={{ borderColor: "rgba(201,106,203,0.3)", background: "rgba(201,106,203,0.08)" }}
      >
        <Check size={16} style={{ color: "#c96acb" }} />
        <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#fff" }}>
          Saved to your Memo
        </span>
        <a
          href={`/app/memories/${savedSessionId}`}
          style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#c96acb", marginLeft: "auto" }}
        >
          Open →
        </a>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={state === "saving"}
        className="flex items-center gap-2 rounded-xl px-5 py-3 transition-colors"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 14,
          fontWeight: 500,
          color: "#000",
          background: "#c96acb",
          opacity: state === "saving" ? 0.6 : 1,
          cursor: state === "saving" ? "default" : "pointer",
        }}
      >
        {state === "saving" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        Save to my Memo
      </button>
      {state === "error" && (
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#f87171", marginTop: 8 }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}
