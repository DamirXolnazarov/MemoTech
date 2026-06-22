interface SummaryTabProps {
  title: string;
  date: string;
  duration: number;
  shortSummary: string;
  detailedSummary: string;
  keyConcepts: string[];
}

export default function SummaryTab({
  shortSummary,
  detailedSummary,
  keyConcepts,
}: SummaryTabProps) {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Summary card — matches mockup */}
      <div
        className="rounded-2xl md:rounded-xl border"
        style={{
          background: "#0e0a10",
          borderColor: "#1c1620",
          padding: "20px 20px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 11,
            fontWeight: 700,
            color: "#c96acb",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Summary
        </p>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 15,
            color: "#d4d4d8",
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
            color: "#52525b",
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
              color: "#52525b",
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
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "#c96acb",
                  background: "rgba(201,106,203,0.08)",
                  border: "1px solid rgba(201,106,203,0.2)",
                  borderRadius: 20,
                  padding: "5px 13px",
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