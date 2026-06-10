export function SocialProof() {
  return (
    <div className="bg-[rgba(11,11,11,0.55)] backdrop-blur-sm border-t border-b border-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-12 py-8 flex items-center justify-between gap-8 flex-wrap">
        <p className="text-[11px] text-[#52525b] uppercase tracking-[0.1em]">Built for</p>
        <div className="flex gap-10 flex-wrap items-center">
          {["Students", "Researchers", "Professionals", "Learners"].map((item) => (
            <span key={item} className="text-sm text-[#52525b]">
              {item}
            </span>
          ))}
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          <span className="text-[11px] text-[#52525b] uppercase tracking-[0.1em]">Coming soon</span>
          {["Google Calendar", "Apple Calendar", "Outlook"].map((c) => (
            <span
              key={c}
              className="text-[12px] text-[#52525b] border border-[#1a1a1a] rounded px-2 py-1"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
