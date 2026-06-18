"use client";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const PROBLEMS = [
  {
    num: "01",
    title: "Lectures are forgotten",
    body: "Up to 80% of what you hear in a lecture is gone within 24 hours. Notes help — but writing and listening at the same time splits your focus.",
  },
  {
    num: "02",
    title: "Deadlines get missed",
    body: "Your professor mentioned it in passing. It wasn't on the slide. It wasn't in the chat. It just vanished — until it was too late.",
  },
  {
    num: "03",
    title: "Notes become archives",
    body: "You wrote it down. But three weeks later, can you actually find it? Or search it? Or even remember you wrote it?",
  },
  {
    num: "04",
    title: "Knowledge can't be searched",
    body: "Your memory isn't a database. But it should be. Everything you've ever heard or discussed should be one question away.",
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="max-w-6xl mx-auto px-12 py-28">
      <RevealOnScroll>
        <Eyebrow className="mb-4">The problem</Eyebrow>
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white mb-4" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.03em" }}>
          Information disappears.
        </h2>
        <p className="text-lg text-[#a1a1aa] max-w-lg leading-relaxed">
          You sit through hours of content and walk out with fragments. The important stuff slips through every time.
        </p>
      </RevealOnScroll>

      <RevealOnScroll delay={120} className="mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 border border-[#1a1a1a] rounded-2xl overflow-hidden">
          {PROBLEMS.map((p, i) => (
            <div
              key={p.num}
              className={[
                "relative overflow-hidden p-10 group cursor-default",
                "transition-colors duration-300 bg-[#0b0b0b] hover:bg-[#0e0b0e]",
                i % 2 === 0 ? "md:border-r border-[#1a1a1a]" : "",
                i >= 2 ? "border-t border-[#1a1a1a]" : "",
              ].join(" ")}
              style={{ boxShadow: "inset 0 0 0 0px transparent", transition: "background 0.3s ease, box-shadow 0.3s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "inset 0 0 0 1px rgba(201,106,203,0.5), 0 0 20px rgba(201,106,203,0.35), 0 0 40px rgba(201,106,203,0.2)";
                const numberElement = e.currentTarget.querySelector("div:first-child") as HTMLElement | null;
                if (numberElement) {
                  numberElement.style.color = "#c96acb";
                  numberElement.style.textShadow = `
                    0 0 20px rgba(201, 106, 203, 0.9),
                    0 0 40px rgba(201, 106, 203, 0.7),
                    0 0 60px rgba(201, 106, 203, 0.5),
                    0 0 80px rgba(201, 106, 203, 0.3)
                  `;
                  numberElement.style.filter = "drop-shadow(0 0 25px rgba(201, 106, 203, 0.8))";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "inset 0 0 0 0px transparent";
                const numberElement = e.currentTarget.querySelector("div:first-child") as HTMLElement | null;
                if (numberElement) {
                  numberElement.style.color = "#1a1a1a";
                  numberElement.style.textShadow = "none";
                  numberElement.style.filter = "none";
                }
              }}
            >
              {/* Large number — glows on hover */}
              <div
                className="text-6xl font-extrabold leading-none mb-4 transition-all duration-300 select-none"
                style={{
                  fontFamily: "var(--font-syne)",
                  letterSpacing: "-0.04em",
                  color: "#1a1a1a",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {p.num}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2.5" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.01em" }}>
                {p.title}
              </h3>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}