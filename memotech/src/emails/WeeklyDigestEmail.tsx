import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import type { DigestData } from "@/lib/digest";

const ORCHID = "#c96acb";
const BLACK = "#050505";
const CARD_BG = "#0b0b0b";
const BORDER = "#1a1a1a";
const GRAY = "#a1a1aa";
const WHITE = "#ffffff";

const priorityColors: Record<string, string> = {
  High: "#f87171",
  Medium: "#facc15",
  Low: "#4ade80",
};

export default function WeeklyDigestEmail({ data }: { data: DigestData }) {
  const previewText = `Your week in review: ${data.stats.sessionsRecorded} sessions, ${data.stats.hoursRecorded}h recorded`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: BLACK, fontFamily: "Helvetica, Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px" }}>

          {/* Logo */}
          <Section style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 700, color: WHITE, margin: 0 }}>
              <span style={{ color: ORCHID }}>●</span> Memo
            </Text>
          </Section>

          {/* Heading */}
          <Heading style={{ color: WHITE, fontSize: 26, fontWeight: 700, margin: "0 0 4px" }}>
            Hey {data.user.firstName}, here&apos;s your week.
          </Heading>
          <Text style={{ color: GRAY, fontSize: 14, margin: "0 0 28px" }}>
            {data.weekRange.start} — {data.weekRange.end}
          </Text>

          {/* Stats row */}
          <Section style={{ marginBottom: 28 }}>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tr>
                {[
                  { label: "Sessions", value: data.stats.sessionsRecorded },
                  { label: "Hours", value: data.stats.hoursRecorded },
                  { label: "Tasks", value: data.stats.tasksExtracted },
                  { label: "Flashcards", value: data.stats.flashcardsGenerated },
                ].map((stat) => (
                  <td
                    key={stat.label}
                    style={{
                      background: CARD_BG,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 10,
                      padding: "14px 8px",
                      textAlign: "center",
                      width: "25%",
                    }}
                  >
                    <Text style={{ color: WHITE, fontSize: 22, fontWeight: 700, margin: "0 0 2px" }}>
                      {stat.value}
                    </Text>
                    <Text style={{ color: GRAY, fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {stat.label}
                    </Text>
                  </td>
                ))}
              </tr>
            </table>
          </Section>

          {/* Focus suggestion */}
          <Section
            style={{
              background: "rgba(201,106,203,0.06)",
              border: `1px solid rgba(201,106,203,0.25)`,
              borderRadius: 12,
              padding: "18px 20px",
              marginBottom: 28,
            }}
          >
            <Text style={{ color: ORCHID, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>
              Focus for next week
            </Text>
            <Text style={{ color: "#ddd", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              {data.focusSuggestion}
            </Text>
          </Section>

          {/* Sessions */}
          {data.sessions.length > 0 && (
            <Section style={{ marginBottom: 28 }}>
              <Text style={{ color: WHITE, fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>
                Sessions this week
              </Text>
              {data.sessions.map((s, i) => (
                <Section
                  key={i}
                  style={{
                    background: CARD_BG,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: WHITE, fontSize: 13, fontWeight: 600, margin: "0 0 2px" }}>
                    {s.title}
                  </Text>
                  <Text style={{ color: "#555", fontSize: 11, margin: "0 0 6px" }}>
                    {s.date} · {s.duration}
                  </Text>
                  <Text style={{ color: GRAY, fontSize: 12, lineHeight: 1.5, margin: 0 }}>
                    {s.summary}
                  </Text>
                </Section>
              ))}
            </Section>
          )}

          {/* Top concepts */}
          {data.topConcepts.length > 0 && (
            <Section style={{ marginBottom: 28 }}>
              <Text style={{ color: WHITE, fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>
                Concepts you covered
              </Text>
              <Text style={{ margin: 0 }}>
                {data.topConcepts.map((c, i) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      background: "rgba(201,106,203,0.08)",
                      border: "1px solid rgba(201,106,203,0.2)",
                      color: ORCHID,
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 20,
                      marginRight: 6,
                      marginBottom: 6,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </Text>
            </Section>
          )}

          {/* Pending tasks */}
          {data.pendingTasks.length > 0 && (
            <Section style={{ marginBottom: 28 }}>
              <Text style={{ color: WHITE, fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>
                Still pending
              </Text>
              {data.pendingTasks.map((t, i) => (
                <Section
                  key={i}
                  style={{
                    borderBottom: i < data.pendingTasks.length - 1 ? `1px solid ${BORDER}` : "none",
                    padding: "10px 0",
                  }}
                >
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td>
                        <Text style={{ color: "#ccc", fontSize: 13, margin: "0 0 2px" }}>{t.text}</Text>
                        <Text style={{ color: "#444", fontSize: 11, margin: 0 }}>
                          {t.sourceSession}{t.dueDate ? ` · Due ${t.dueDate}` : ""}
                        </Text>
                      </td>
                      <td style={{ width: 70, textAlign: "right", verticalAlign: "top" }}>
                        <span
                          style={{
                            color: priorityColors[t.priority],
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {t.priority}
                        </span>
                      </td>
                    </tr>
                  </table>
                </Section>
              ))}
            </Section>
          )}

          {/* Flashcard decks */}
          {data.flashcardDecks.length > 0 && (
            <Section style={{ marginBottom: 28 }}>
              <Text style={{ color: WHITE, fontSize: 14, fontWeight: 700, margin: "0 0 12px" }}>
                Your flashcard decks
              </Text>
              {data.flashcardDecks.map((d, i) => (
                <table key={i} width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: 6 }}>
                  <tr>
                    <td>
                      <Text style={{ color: "#ccc", fontSize: 13, margin: 0 }}>{d.name}</Text>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Text style={{ color: "#555", fontSize: 11, margin: 0 }}>
                        {d.cardCount} cards · {d.lastReviewed}
                      </Text>
                    </td>
                  </tr>
                </table>
              ))}
            </Section>
          )}

          <Hr style={{ borderColor: BORDER, margin: "28px 0 16px" }} />

          {/* CTA */}
          <Section style={{ textAlign: "center", marginBottom: 24 }}>
            <Link
              href="https://memotech-ai.vercel.app/app"
              style={{
                display: "inline-block",
                background: ORCHID,
                color: WHITE,
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 24px",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              Open Memo →
            </Link>
          </Section>

          <Text style={{ color: "#333", fontSize: 11, textAlign: "center", margin: 0 }}>
            You&apos;re receiving this because Weekly Brain Digest is enabled in your Memo settings.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}