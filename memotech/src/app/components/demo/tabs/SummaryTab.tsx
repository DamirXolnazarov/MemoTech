interface SummaryTabProps {
  title: string;
  date: string;
  duration: number;
  shortSummary: string;
  detailedSummary: string;
  keyConcepts: string[];
}

export default function SummaryTab({
  title,
  date,
  duration,
  shortSummary,
  detailedSummary,
  keyConcepts,
}: SummaryTabProps) {
  const formatDuration = (s: number) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: 28,
            fontWeight: 700,
            color: "#f0f0f0",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#555" }}>
          {date} · {formatDuration(duration)}
        </p>
      </div>

      {/* Short summary */}
      <div
        style={{
          background: "#0b0b0b",
          border: "1px solid #1a1a1a",
          borderRadius: 12,
          padding: "20px 24px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 15,
            color: "#bbb",
            lineHeight: 1.7,
          }}
        >
          {shortSummary}
        </p>
      </div>

      {/* Detailed summary */}
      <div className="flex flex-col gap-3">
        <h3
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: 12,
            fontWeight: 600,
            color: "#444",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Detailed Summary
        </h3>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 14,
            color: "#888",
            lineHeight: 1.8,
          }}
        >
          {detailedSummary}
        </p>
      </div>

      {/* Key concepts */}
      {keyConcepts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3
            style={{
              fontFamily: "var(--font-syne)",
              fontSize: 12,
              fontWeight: 600,
              color: "#444",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Key Concepts
          </h3>
          <div className="flex flex-wrap gap-2">
            {keyConcepts.map((c, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  color: "#c96acb",
                  background: "rgba(201,106,203,0.08)",
                  border: "1px solid rgba(201,106,203,0.2)",
                  borderRadius: 20,
                  padding: "4px 12px",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}