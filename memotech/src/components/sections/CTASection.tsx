import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function CTASection() {
  return (
    <section className="py-32 px-12 text-center border-t border-[#1a1a1a]">
      <RevealOnScroll>
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute pointer-events-none" style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "500px", height: "240px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,106,203,0.1) 0%, transparent 70%)" }} />
          <h2 className="relative z-10 text-5xl md:text-7xl font-extrabold leading-tight" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.04em" }}>
            Start remembering{" "}
            <em className="not-italic text-[#c96acb]">everything.</em>
          </h2>
          <p className="relative z-10 mt-5 text-lg text-[#a1a1aa] leading-relaxed mb-10">
            Your next lecture, meeting, or conversation shouldn&apos;t be forgotten.<br />
            Memo is free to start.
          </p>
          <div className="relative z-10 flex gap-3.5 justify-center flex-wrap">
            <Button variant="primary" size="lg" href="/demo">Get started free →</Button>
            <Button variant="outline" size="lg" href="/demo">Try the demo</Button>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
