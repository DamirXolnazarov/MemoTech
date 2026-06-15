import Link from "next/link";

// TODO: Replace with real DB fetch — query sessions by userId ordered by createdAt desc
const SESSIONS = [
  {
    id: "1",
    title: "Biology 201 — Photosynthesis",
    date: "2 days ago",
    duration: "47 min",
    tags: ["Summary", "Tasks", "Flashcards"],
  },
  {
    id: "2",
    title: "Project Kickoff Meeting",
    date: "4 days ago",
    duration: "31 min",
    tags: ["Summary", "Tasks"],
  },
  {
    id: "3",
    title: "Economics Lecture — Supply & Demand",
    date: "1 week ago",
    duration: "52 min",
    tags: ["Summary", "Flashcards"],
  },
  {
    id: "4",
    title: "Research Interview — User Study #3",
    date: "1 week ago",
    duration: "28 min",
    tags: ["Summary", "Tasks"],
  },
];

const tagColors: Record<string, string> = {
  Summary: "rgba(201,106,203,0.12)",
  Tasks: "rgba(245,158,11,0.12)",
  Flashcards: "rgba(59,130,246,0.12)",
};

const tagText: Record<string, string> = {
  Summary: "#c96acb",
  Tasks: "#f59e0b",
  Flashcards: "#60a5fa",
};

export default function RecentSessions() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2
          className="font-bold text-white"
          style={{ fontFamily: "var(--font-syne)", fontSize: 16 }}
        >
          Recent Sessions
        </h2>
        <Link
          href="/app/memories"
          style={{ color: "#a1a1aa", fontSize: 13, fontFamily: "var(--font-inter)" }}
          className="hover:text-white transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {SESSIONS.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border p-5 flex flex-col gap-3 group"
            style={{ background: "#0b0b0b", borderColor: "#1a1a1a" }}
          >
            <div className="flex flex-col gap-1">
              <h3
                className="font-bold text-white leading-snug"
                style={{ fontFamily: "var(--font-syne)", fontSize: 14 }}
              >
                {s.title}
              </h3>
              <p style={{ color: "#555", fontSize: 12, fontFamily: "var(--font-inter)" }}>
                {s.date} · {s.duration}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {s.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    background: tagColors[tag],
                    color: tagText[tag],
                    fontFamily: "var(--font-inter)",
                    fontSize: 11,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-end mt-auto pt-1">
              <Link
                href={`/app/memories`}
                className="text-xs border rounded-lg px-3 py-1.5 transition-colors hover:border-[#c96acb] hover:text-[#c96acb]"
                style={{
                  borderColor: "#1f1f1f",
                  color: "#555",
                  fontFamily: "var(--font-inter)",
                }}
              >
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}