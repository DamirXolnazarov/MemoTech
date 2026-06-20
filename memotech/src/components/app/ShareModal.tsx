"use client";

import { useState } from "react";
import { X, Copy, Check, Link2, Loader2 } from "lucide-react";

interface ShareModalProps {
  sessionId: string;
  onClose: () => void;
}

interface ShareLinkData {
  id: string;
  token: string;
  revokedAt: string | null;
}

export default function ShareModal({ sessionId, onClose }: ShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<ShareLinkData | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateLink() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/share`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to create share link");
      const data = await res.json();
      setShareLink(data.shareLink);
    } catch (err) {
      setError("Couldn't create the link. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    if (!shareLink) return;
    setLoading(true);
    try {
      await fetch(`/api/sessions/${sessionId}/share`, { method: "DELETE" });
      setShareLink(null);
      setCopied(false);
    } catch (err) {
      setError("Couldn't turn off the link. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shareLink) return;
    const url = `${window.location.origin}/shared/${shareLink.token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-syne font-extrabold text-xl text-white">
            Share session
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {!shareLink ? (
          <>
            <p className="font-inter text-sm text-white/50 mb-6 leading-relaxed">
              Anyone with the link can view the summary, key concepts, and
              flashcards from this session. Your audio and full transcript
              stay private.
            </p>
            {error && (
              <p className="font-inter text-sm text-red-400 mb-4">{error}</p>
            )}
            <button
              onClick={handleCreateLink}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#c96acb] hover:bg-[#c96acb]/90 disabled:opacity-50 text-black font-inter font-medium text-sm py-3 transition-colors"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Link2 size={16} />
              )}
              Create share link
            </button>
          </>
        ) : (
          <>
            <p className="font-inter text-sm text-white/50 mb-4 leading-relaxed">
              Anyone with this link can view the summary, key concepts, and
              flashcards. Your audio and transcript stay private.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/shared/${shareLink.token}`}
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 font-inter text-sm text-white/80 truncate"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2.5 font-inter text-sm text-white transition-colors"
              >
                {copied ? (
                  <Check size={14} className="text-[#c96acb]" />
                ) : (
                  <Copy size={14} />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            {error && (
              <p className="font-inter text-sm text-red-400 mb-4">{error}</p>
            )}
            <button
              onClick={handleRevoke}
              disabled={loading}
              className="w-full font-inter text-sm text-white/40 hover:text-red-400 disabled:opacity-50 py-2 transition-colors"
            >
              Turn off link
            </button>
          </>
        )}
      </div>
    </div>
  );
}
