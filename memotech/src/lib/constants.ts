export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Vision", href: "#vision" },
  { label: "FAQ", href: "#faq" },
];

export const FEATURES = [
  {
    icon: "mic",
    title: "Smart recording",
    description:
      "Crystal-clear capture with live transcription, speaker detection, and bookmark support. Hit record and stop thinking about notes.",
    tags: ["Live transcript", "Speaker ID", "Waveform"],
  },
  {
    icon: "file-text",
    title: "AI summaries",
    description:
      "Short summary, detailed breakdown, key concepts, and important quotes — generated the moment you stop recording.",
    tags: ["Concise", "Detailed", "Key concepts"],
  },
  {
    icon: "check-square",
    title: "Action detection",
    description:
      "Assignments, deadlines, meeting follow-ups, and personal reminders are automatically extracted and added to your task list.",
    tags: ["Deadlines", "Assignments", "Calendar sync"],
  },
  {
    icon: "layout",
    title: "Flashcards",
    description:
      "Study decks built from your recordings — definitions, Q&A pairs, and practice quizzes. Spaced repetition, ready to go.",
    tags: ["Auto-generated", "Quiz mode", "Study decks"],
  },
  {
    icon: "search",
    title: "Memory search",
    description:
      "Ask anything about any session you've ever recorded. Natural language. Instant answers with a direct link to the exact moment.",
    tags: ["Natural language", "Timestamps", "Vector search"],
  },
  {
    icon: "message-circle",
    title: "AI tutor",
    description:
      "Ask Memo to explain, quiz, simplify, or give examples — specific to your actual recordings and notes, not generic answers.",
    tags: ["Explain this", "Quiz me", "Simplify"],
  },
];

export const HOW_STEPS = [
  {
    step: "01",
    title: "Press record",
    description:
      "Open Memo before your lecture, meeting, or conversation. One tap starts capturing everything — audio, live transcript, and automatic speaker labels.",
    visual: "recording",
  },
  {
    step: "02",
    title: "Memo understands",
    description:
      "The moment you stop recording, Memo processes the full transcript — generating a summary, key concepts, and pulling out action items automatically.",
    visual: "summary",
  },
  {
    step: "03",
    title: "Tasks, deadlines, done",
    description:
      "Every deadline, assignment, and follow-up mentioned in your session is automatically added to your task list — with the date, priority, and calendar sync.",
    visual: "tasks",
  },
  {
    step: "04",
    title: "Ask anything, instantly",
    description:
      "Three weeks later, ask Memo what your professor said about photosynthesis. It finds the exact moment and answers in plain language — from your own recordings.",
    visual: "search",
  },
];

export const ROADMAP = [
  {
    label: "Now",
    title: "Memo",
    description: "AI memory assistant — record, understand, organize, recall. Available on web and mobile.",
    current: true,
  },
  {
    label: "Next",
    title: "Memo Teams",
    description: "Collaborative memory. Shared sessions, team knowledge bases, and collective recall.",
    current: false,
  },
  {
    label: "Then",
    title: "Memo Classroom",
    description: "A dedicated education platform — for institutions, professors, and entire cohorts.",
    current: false,
  },
  {
    label: "Future",
    title: "MemoPen",
    description: "Dedicated hardware. Wear it to any lecture or meeting. No phone, no friction.",
    current: false,
  },
  {
    label: "Vision",
    title: "Memo OS",
    description: "Personal memory operating system. Every conversation, lecture, and thought — indexed, searchable, and yours forever.",
    current: false,
  },
];

export const FAQS = [
  {
    q: "What languages does Memo support?",
    a: "Memo currently supports English, Uzbek, and Russian. More languages are on the roadmap — if yours isn't listed, let us know.",
  },
  {
    q: "Does Memo work offline?",
    a: "Audio recording works offline. AI processing — summaries, tasks, search — requires an internet connection and runs once you reconnect.",
  },
  {
    q: "How is my data stored and kept private?",
    a: "Your recordings and transcripts are encrypted and stored securely. We never sell your data. You can export or delete everything at any time.",
  },
  {
    q: "Can I connect Memo to my calendar?",
    a: "Yes. Memo syncs tasks and deadlines directly to Google Calendar, Apple Calendar, and Outlook. Connect once under Settings — it works automatically after that.",
  },
  {
    q: "What's the difference between Memo and just taking notes?",
    a: "Notes require you to write while you listen — splitting your attention. Memo lets you be fully present, then gives you a structured, searchable record afterward. Plus, you can ask it questions your notes could never answer.",
  },
  {
    q: "Is there a free version?",
    a: "Yes — Memo is free to start. Recording, transcription, and basic summaries are available on the free plan. Advanced features like flashcards, long-form search, and calendar sync come with the Pro plan.",
  },
];

export const SEARCH_EXAMPLES = [
  "What did my biology teacher say about photosynthesis?",
  "When is my economics assignment due?",
  "What did Alex say about sponsorship?",
  "Summarize last Tuesday's meeting.",
];
