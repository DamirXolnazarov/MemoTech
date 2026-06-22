import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Memo — Never lose what matters.",
  description:
    "Record lectures, meetings, and conversations. Turn them into searchable knowledge with AI-powered summaries, tasks, flashcards, and memory recall.",
};

import GSAPMobileFixClient from "@/components/GSAPMobileFixClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <GSAPMobileFixClient />
        <ClerkProvider>
          <AmbientBackground />
          <div style={{ position: "relative", zIndex: 1 }}>
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
