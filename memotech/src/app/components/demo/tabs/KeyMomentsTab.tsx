interface KeyMoment {
  timestamp: string;
  quote: string;
  why: string;
}

interface KeyMomentsTabProps {
  keyMoments: KeyMoment[];
}

export default function KeyMomentsTab({ keyMoments }: KeyMomentsTabProps) {
  if (keyMoments.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 200 }}>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#444" }}>No key moments found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 600, color: "#f0f0f0" }}>
        Key Moments
      </h2>
      <div className="flex flex-col gap-4">
        {keyMoments.map((m, i) => (
          <div
            key={i}
            style={{
              background: "#0b0b0b",
              border: "1px solid #1a1a1a",
              borderRadius: 12,
              padding: "18px 22px",
              display: "flex",
              gap: 18,
            }}
          >
            {/* Timestamp badge */}
            <div style={{ flexShrink: 0, paddingTop: 2 }}>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#c96acb",
                  background: "rgba(201,106,203,0.1)",
                  border: "1px solid rgba(201,106,203,0.2)",
                  borderRadius: 6,
                  padding: "2px 8px",
                  letterSpacing: "0.04em",
                }}
              >
                {m.timestamp}
              </span>
            </div>

            <div className="flex flex-col gap-2 min-w-0">
              <p
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: 15,
                  fontWeight: 500,
                  color: "#ddd",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                &ldquo;{m.quote}&rdquo;
              </p>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  color: "#555",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {m.why}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}