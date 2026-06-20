import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface WelcomeEmailProps {
  firstName: string;
}

export default function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Memo — let's record your first session</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Welcome to Memo, {firstName}.</Heading>
          <Text style={paragraph}>
            Memo turns your recordings into summaries, tasks, flashcards, and
            key moments automatically — so you can stay present in the
            conversation and let the notes take care of themselves.
          </Text>
          <Text style={paragraph}>
            The fastest way to see what it can do is to record something real.
            A lecture, a meeting, even a voice memo to yourself works.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href="https://memotech-ai.vercel.app/app/record">
              Record your first session
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Memo — built to help you remember what matters.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#050505",
  fontFamily: "Inter, -apple-system, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "480px",
};

const heading = {
  fontFamily: "Syne, sans-serif",
  fontWeight: 800,
  fontSize: "28px",
  color: "#ffffff",
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "rgba(255,255,255,0.7)",
  marginBottom: "16px",
};

const buttonContainer = {
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#c96acb",
  borderRadius: "10px",
  color: "#000000",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 24px",
};

const hr = {
  borderColor: "rgba(255,255,255,0.1)",
  margin: "32px 0",
};

const footer = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.3)",
};
