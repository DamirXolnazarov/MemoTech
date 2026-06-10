"use client";
import { useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { FAQS } from "@/lib/constants";
import { Plus } from "lucide-react";

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="max-w-6xl mx-auto px-12 py-28 border-t border-[#1a1a1a]">
      <RevealOnScroll>
        <Eyebrow className="mb-4">Questions</Eyebrow>
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.03em" }}>
          Frequently asked.
        </h2>
      </RevealOnScroll>

      <RevealOnScroll delay={80} className="mt-14 max-w-3xl">
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={faq.q} className="border-b border-[#1a1a1a] cursor-pointer group" onClick={() => setOpen(isOpen ? null : i)}>
              <div className="flex items-center justify-between py-6 gap-4">
                <span className="text-base font-medium text-white group-hover:text-[#c96acb] transition-colors duration-200" style={{ letterSpacing: "-0.01em" }}>
                  {faq.q}
                </span>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? "border-[#c96acb] text-[#c96acb] rotate-45" : "border-[#2a2a2a] text-[#52525b]"}`}
                  style={isOpen ? { background: "rgba(201,106,203,0.12)" } : {}}>
                  <Plus size={14} />
                </div>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-48 pb-6" : "max-h-0"}`}>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">{faq.a}</p>
              </div>
            </div>
          );
        })}
      </RevealOnScroll>
    </section>
  );
}
