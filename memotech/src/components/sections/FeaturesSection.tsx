import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Mic, FileText, CheckSquare, LayoutGrid, Search, MessageCircle } from "lucide-react";
import { FEATURES } from "@/lib/constants";

const ICONS: Record<string, React.ReactNode> = {
  mic: <Mic size={20} color="#c96acb" strokeWidth={1.8} />,
  "file-text": <FileText size={20} color="#c96acb" strokeWidth={1.8} />,
  "check-square": <CheckSquare size={20} color="#c96acb" strokeWidth={1.8} />,
  layout: <LayoutGrid size={20} color="#c96acb" strokeWidth={1.8} />,
  search: <Search size={20} color="#c96acb" strokeWidth={1.8} />,
  "message-circle": <MessageCircle size={20} color="#c96acb" strokeWidth={1.8} />,
};

export function FeaturesSection() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-12 py-28 border-t border-[#1a1a1a]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20 items-end">
        <RevealOnScroll>
          <Eyebrow className="mb-4">What Memo does</Eyebrow>
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.03em" }}>
            Meet Memo.
          </h2>
        </RevealOnScroll>
        <RevealOnScroll delay={100}>
          <p className="text-lg text-[#a1a1aa] leading-relaxed">
            Your AI memory assistant. Press record, then focus on what matters. Memo handles everything else — from word one to the moment you need to recall it.
          </p>
        </RevealOnScroll>
      </div>

      <RevealOnScroll delay={80}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-[#1a1a1a] rounded-2xl overflow-hidden">
          {FEATURES.map((feat, i) => (
            <div
              key={feat.title}
              className={[
                "group bg-[#0b0b0b] hover:bg-[#101010] p-9 transition-colors duration-300 cursor-default",
                i % 3 !== 2 ? "lg:border-r border-[#1a1a1a]" : "",
                i >= 3 ? "border-t border-[#1a1a1a]" : "",
                i === 1 || i === 4 ? "md:border-x border-[#1a1a1a] lg:border-x-0" : "",
              ].join(" ")}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-shadow duration-300 group-hover:shadow-[0_0_18px_rgba(201,106,203,0.25)]"
                style={{ background: "rgba(201,106,203,0.1)" }}>
                {ICONS[feat.icon]}
              </div>
              <h3 className="text-base font-semibold text-white mb-2.5" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.01em" }}>
                {feat.title}
              </h3>
              <p className="text-sm text-[#a1a1aa] leading-relaxed mb-4">{feat.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {feat.tags.map((tag) => (
                  <span key={tag} className="text-xs text-[#52525b] border border-[#1a1a1a] rounded px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}
