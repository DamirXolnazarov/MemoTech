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
                "bg-[#0b0b0b] p-10",
                i % 2 === 0 ? "md:border-r border-[#1a1a1a]" : "",
                i >= 2 ? "border-t border-[#1a1a1a]" : "",
              ].join(" ")}
            >
              <div className="text-6xl font-extrabold leading-none mb-4 text-[#1a1a1a]" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.04em" }}>
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
