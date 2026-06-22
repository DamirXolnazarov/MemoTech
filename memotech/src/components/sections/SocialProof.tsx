export function SocialProof() {
  return (
    <div className="bg-[rgba(11,11,11,0.55)] backdrop-blur-sm border-t border-b border-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-12 py-6 sm:py-8">
        {/* Mobile: stacked; Desktop: row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-6 flex-wrap">
            <p className="text-[11px] text-[#52525b] uppercase tracking-[0.1em] flex-shrink-0">Built for</p>
            <div className="flex gap-6 flex-wrap items-center">
              {["Students", "Researchers", "Professionals", "Learners"].map((item) => (
                <span key={item} className="text-sm text-[#52525b]">{item}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[11px] text-[#52525b] uppercase tracking-[0.1em] flex-shrink-0">Coming soon</span>
            {["Google Calendar", "Apple Calendar", "Outlook"].map((c) => (
              <span key={c} className="text-[12px] text-[#52525b] border border-[#1a1a1a] rounded px-2 py-1">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}