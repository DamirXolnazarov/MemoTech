"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/app/TopBar";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { ExternalLink, Loader2 } from "lucide-react";

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!on)}
      disabled={disabled}
      className="relative flex-shrink-0 rounded-full transition-colors duration-200"
      style={{
        width: 44, height: 24,
        background: on ? "#c96acb" : "#1a1a1a",
        border: `1px solid ${on ? "#c96acb" : "#2a2a2a"}`,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        className="absolute top-0.5 rounded-full bg-white transition-transform duration-200"
        style={{ width: 18, height: 18, transform: on ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 14, fontWeight: 700, color: "#f0f0f0", marginBottom: 16 }}>
      {title}
    </h2>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#1a1a1a", margin: "32px 0" }} />;
}

const INTEGRATIONS = [
  { id: "gcal", name: "Google Calendar", description: "Sync tasks and deadlines automatically" },
  { id: "apple", name: "Apple Calendar", description: "Push events to your Apple Calendar" },
  { id: "notion", name: "Notion", description: "Export sessions and notes to Notion" },
];

interface DigestSettingsData {
  weeklyDigestEnabled: boolean;
  taskReminders: boolean;
  newFeatureEmails: boolean;
}

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const [settings, setSettings] = useState<DigestSettingsData | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [exportModal, setExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const json = await res.json();
        if (!cancelled) setSettings(json.settings);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setSettingsLoading(false);
      }
    }

    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSetting = async (key: keyof DigestSettingsData, value: boolean) => {
    if (!settings) return;
    const previous = settings[key];

    setSettings({ ...settings, [key]: value });
    setSaving(key);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch (err) {
      console.error(err);
      setSettings((prev) => (prev ? { ...prev, [key]: previous } : prev));
    } finally {
      setSaving(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `memo-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to delete account");
      }
      await signOut();
      window.location.href = "/";
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  };

  return (
    <div>
      <TopBar title="Settings" />
      <div className="p-8" style={{ maxWidth: 640 }}>

        {/* Profile */}
        <SectionHeader title="Profile" />
        <div className="rounded-xl border p-5 flex items-center gap-4" style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}>
          <UserButton appearance={{ elements: { avatarBox: { width: 48, height: 48 } } }} />
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate" style={{ fontFamily: "var(--font-syne)", fontSize: 14 }}>
              {user?.fullName || "—"}
            </p>
            <p style={{ color: "#555", fontSize: 13, fontFamily: "var(--font-inter)" }}>
              {user?.emailAddresses[0]?.emailAddress || "—"}
            </p>
          </div>
          <a
            href="https://accounts.clerk.dev/user"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs rounded-lg border px-3 py-1.5 transition-colors hover:border-[#c96acb]/50 hover:text-[#c96acb]"
            style={{ borderColor: "#1f1f1f", color: "#555", fontFamily: "var(--font-inter)" }}
          >
            Manage Account <ExternalLink size={11} />
          </a>
        </div>

        <Divider />

        {/* Notifications */}
        <SectionHeader title="Notifications" />
        <div className="rounded-xl border overflow-hidden" style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}>
          {([
            { key: "weeklyDigestEnabled" as const, label: "Weekly Brain Digest", desc: "Sunday email with your week's recordings, concepts, and tasks" },
            { key: "taskReminders" as const, label: "Task reminder notifications", desc: "Get reminded before tasks are due" },
            { key: "newFeatureEmails" as const, label: "New feature announcements", desc: "Be the first to know about updates" },
          ]).map(({ key, label, desc }, i, arr) => (
            <div
              key={key}
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid #111" : "none" }}
            >
              <div>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#ccc", marginBottom: 2 }}>{label}</p>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#444" }}>{desc}</p>
              </div>
              {settingsLoading || !settings ? (
                <div style={{ width: 44, height: 24, borderRadius: 12, background: "#1a1a1a", opacity: 0.4 }} />
              ) : (
                <Toggle
                  on={settings[key]}
                  disabled={saving === key}
                  onChange={(v) => updateSetting(key, v)}
                />
              )}
            </div>
          ))}
        </div>

        <Divider />

        {/* Connected apps */}
        <SectionHeader title="Connected Apps" />
        <div className="rounded-xl border overflow-hidden" style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}>
          {INTEGRATIONS.map(({ id, name, description }, i, arr) => (
            <div
              key={id}
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: i < arr.length - 1 ? "1px solid #111" : "none" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#2a2a2a" }} />
                <div>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#ccc", marginBottom: 1 }}>{name}</p>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#444" }}>{description}</p>
                </div>
              </div>
              <div className="relative group">
                <button
                  className="text-xs rounded-lg border px-3 py-1.5 transition-colors"
                  style={{ borderColor: "#1f1f1f", color: "#555", background: "transparent", cursor: "not-allowed", fontFamily: "var(--font-inter)" }}
                >
                  Connect
                </button>
                <div
                  className="absolute right-0 bottom-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg px-3 py-1.5 whitespace-nowrap"
                  style={{ background: "#111", border: "1px solid #1a1a1a", fontSize: 11, color: "#888", fontFamily: "var(--font-inter)" }}
                >
                  Coming soon
                </div>
              </div>
            </div>
          ))}
        </div>

        <Divider />

        {/* Danger zone */}
        <div className="rounded-xl border p-5 flex flex-col gap-4" style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.02)" }}>
          <SectionHeader title="Danger Zone" />
          <div className="flex gap-3">
            <button
              onClick={() => setExportModal(true)}
              className="rounded-lg border px-4 py-2 text-sm transition-colors hover:border-[#555]"
              style={{ borderColor: "#2a2a2a", color: "#888", background: "transparent", cursor: "pointer", fontFamily: "var(--font-inter)" }}
            >
              Export all data
            </button>
            <button
              onClick={() => setDeleteModal(true)}
              className="rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-red-500/10"
              style={{ borderColor: "rgba(239,68,68,0.3)", color: "#f87171", background: "transparent", cursor: "pointer", fontFamily: "var(--font-inter)" }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="rounded-2xl border p-8 w-full max-w-sm flex flex-col gap-4" style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 18, color: "#f0f0f0", fontWeight: 700 }}>Delete account?</h3>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#888", lineHeight: 1.6 }}>
              This will permanently delete your account, all recordings, tasks, and flashcards. This cannot be undone.
            </p>
            {deleteError && (
              <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#f87171" }}>{deleteError}</p>
            )}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => { setDeleteModal(false); setDeleteError(""); }}
                disabled={deleting}
                className="flex-1 rounded-lg border py-2 text-sm"
                style={{ borderColor: "#1a1a1a", color: "#555", background: "transparent", cursor: "pointer", fontFamily: "var(--font-inter)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-lg py-2 text-sm flex items-center justify-center gap-2"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", cursor: deleting ? "default" : "pointer", fontFamily: "var(--font-inter)" }}
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export modal */}
      {exportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="rounded-2xl border p-8 w-full max-w-sm flex flex-col gap-4" style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}>
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 18, color: "#f0f0f0", fontWeight: 700 }}>Export your data?</h3>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#888", lineHeight: 1.6 }}>
              We&apos;ll generate a JSON file of all your sessions, transcripts, tasks, and flashcards for you to download.
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setExportModal(false)}
                disabled={exporting}
                className="flex-1 rounded-lg border py-2 text-sm"
                style={{ borderColor: "#1a1a1a", color: "#555", background: "transparent", cursor: "pointer", fontFamily: "var(--font-inter)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex-1 rounded-lg py-2 text-sm flex items-center justify-center gap-2"
                style={{ background: "#c96acb", color: "#fff", border: "none", cursor: exporting ? "default" : "pointer", fontFamily: "var(--font-inter)" }}
              >
                {exporting && <Loader2 size={13} className="animate-spin" />}
                {exporting ? "Exporting..." : "Download Export"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}