import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import SaveButton from "./SaveButton";

interface SharedPageProps {
  params: Promise<{ token: string }>;
}

async function getSharedSession(token: string) {
  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      session: {
        include: {
          flashcards: true,
        },
      },
    },
  });

  if (!shareLink) return { status: "not-found" as const };
  if (shareLink.revokedAt) return { status: "revoked" as const };
  if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
    return { status: "expired" as const };
  }

  prisma.shareLink
    .update({
      where: { id: shareLink.id },
      data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
    })
    .catch((err) => console.error("Failed to record share link view:", err));

  return { status: "ok" as const, shareLink };
}

function formatDuration(seconds: number) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function StatusScreen({ heading, body }: { heading: string; body: string }) {
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="font-syne font-extrabold text-3xl text-white mb-3">
          {heading}
        </h1>
        <p className="font-inter text-white/50 text-base leading-relaxed">
          {body}
        </p>
        <Link
          href="/"
          className="inline-block mt-8 font-inter text-sm text-[#c96acb] hover:text-[#c96acb]/80 transition-colors"
        >
          Go to Memo →
        </Link>
      </div>
    </main>
  );
}

export default async function SharedSessionPage({ params }: SharedPageProps) {
  const { token } = await params;
  const result = await getSharedSession(token);
  const { userId } = await auth();

  if (result.status === "not-found") notFound();

  if (result.status === "revoked") {
    return (
      <StatusScreen
        heading="This link is no longer active"
        body="The person who shared this session has turned off access to it."
      />
    );
  }

  if (result.status === "expired") {
    return (
      <StatusScreen
        heading="This link has expired"
        body="Shared sessions are only available for a limited time."
      />
    );
  }

  const { shareLink } = result;
  const { session } = shareLink;
  const isOwnSession = userId === shareLink.createdBy;

  return (
    <main className="min-h-screen bg-[#050505]">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-syne font-extrabold text-4xl md:text-5xl text-white leading-tight mb-4">
            {session.title}
          </h1>
          <div className="flex items-center gap-3 font-inter text-sm text-white/40">
            <span>{formatDate(session.createdAt)}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>{formatDuration(session.duration)}</span>
          </div>
        </header>

        {/* Save action */}
        <div className="mb-12">
          <SaveButton token={token} isOwnSession={isOwnSession} />
        </div>

        {/* Summary */}
        {shareLink.includeSummary && (
          <section className="mb-12">
            <p className="font-inter text-lg text-white/80 leading-relaxed">
              {session.shortSummary}
            </p>
            {session.detailedSummary && (
              <p className="font-inter text-base text-white/60 leading-relaxed mt-4">
                {session.detailedSummary}
              </p>
            )}
          </section>
        )}

        {/* Key Concepts */}
        {shareLink.includeConcepts && session.keyConcepts.length > 0 && (
          <section className="mb-12">
            <h2 className="font-syne font-extrabold text-xs uppercase tracking-wider text-white/40 mb-4">
              Key Concepts
            </h2>
            <div className="flex flex-wrap gap-2">
              {session.keyConcepts.map((concept, i) => (
                <span
                  key={i}
                  className="font-inter text-sm text-white/80 bg-white/5 border border-white/10 rounded-full px-4 py-1.5"
                >
                  {concept}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Flashcards */}
        {shareLink.includeFlashcards && session.flashcards.length > 0 && (
          <section className="mb-12">
            <h2 className="font-syne font-extrabold text-xs uppercase tracking-wider text-white/40 mb-4">
              Flashcards ({session.flashcards.length})
            </h2>
            <div className="space-y-3">
              {session.flashcards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <p className="font-inter text-sm text-white/90 font-medium mb-2">
                    {card.question}
                  </p>
                  <p className="font-inter text-sm text-white/50">
                    {card.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer / watermark */}
        <footer className="pt-12 mt-12 border-t border-white/10 flex items-center justify-between">
          <span className="font-syne font-extrabold text-sm text-white/30">
            Made with Memo
          </span>
          <Link
            href="/"
            className="font-inter text-sm text-[#c96acb] hover:text-[#c96acb]/80 transition-colors"
          >
            Try Memo →
          </Link>
        </footer>
      </div>
    </main>
  );
}
