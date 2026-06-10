"use client";
import { useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Search } from "lucide-react";
import { SEARCH_EXAMPLES } from "@/lib/constants";

export function SearchSection() {
  const [query, setQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const typeDemo = (text: string) => {
    if (isTyping) return;
    setIsTyping(true);
    setQuery("");
    let i = 0;
    const clean = text.replace(/['"]/g, "");
    const iv = setInterval(() => {
      setQuery(clean.slice(0, ++i));
      if (i >= clean.length) {
        clearInterval(iv);
        setTimeout(() => { setQuery(""); setIsTyping(false); }, 2000);
      }
    }, 30);
  };

  return (
    <section id="search" className="max-w-6xl mx-auto px-12 py-28 border-t border-[#1a1a1a]">
      <RevealOnScroll>
        <Eyebrow className="mb-4">Memory search</Eyebrow>
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.03em" }}>
          Your memory,<br />searchable.
        </h2>
      </RevealOnScroll>

      <RevealOnScroll delay={100} className="mt-14">
        <div className="relative border border-[#1a1a1a] rounded-2xl bg-[#0b0b0b] p-16 overflow-hidden">
          <div className="absolute pointer-events-none" style={{ top: "-80px", left: "50%", transform: "translateX(-50%)", width: "500px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,106,203,0.07) 0%, transparent 70%)" }} />
          <p className="text-lg text-[#a1a1aa] max-w-md leading-relaxed mb-10 relative z-10">
            Ask Memo anything about anything you&apos;ve ever recorded. It searches across every session, every word, every moment.
          </p>
          <div className="relative z-10 border border-[#2a2a2a] rounded-xl px-5 py-4 flex items-center gap-3.5 mb-8 hover:border-[rgba(201,106,203,0.3)] transition-colors duration-200" style={{ background: "rgba(255,255,255,0.04)" }}>
            <Search size={18} color="#52525b" strokeWidth={2} />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Memo anything…"
              className="flex-1 bg-transparent outline-none text-white text-sm placeholder-[#52525b]" />
          </div>
          <div className="relative z-10 flex flex-wrap gap-2.5">
            {SEARCH_EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => typeDemo(ex)}
                className="text-sm text-[#a1a1aa] border border-[#1a1a1a] rounded-lg px-3.5 py-1.5 hover:border-[#c96acb] hover:text-[#c96acb] transition-all duration-200 text-left"
                style={{ ":hover": { background: "rgba(201,106,203,0.07)" } } as React.CSSProperties}>
                &ldquo;{ex}&rdquo;
              </button>
            ))}
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
