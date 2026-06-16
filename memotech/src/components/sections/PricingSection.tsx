"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const ORCHID = "#c96acb";

/* ─── Feature row ────────────────────────────────────────────────────────── */
function Feature({ text, included, orchid }: { text: string; included: boolean; orchid?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px]">
      {included ? (
        <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: orchid ? ORCHID : "#52525b" }} />
      ) : (
        <X size={15} className="mt-0.5 flex-shrink-0 text-[#2a2a2a]" />
      )}
      <span className={included ? "text-[#a1a1aa]" : "text-[#3f3f46]"}>{text}</span>
    </li>
  );
}

/* ─── Animated price ─────────────────────────────────────────────────────── */
function Price({ value, annual }: { value: string | number; annual: boolean }) {
  return (
    <div className="flex items-end gap-1.5 mt-2">
      {typeof value === "number" ? (
        <>
          <span
            className="font-extrabold text-white leading-none"
            style={{ fontFamily: "var(--font-syne)", fontSize: 52 }}
          >
            ${value}
          </span>
          <span className="text-[#52525b] text-base mb-2">/mo</span>
        </>
      ) : (
        <span
          className="font-extrabold text-white leading-none"
          style={{ fontFamily: "var(--font-syne)", fontSize: 40 }}
        >
          {value}
        </span>
      )}
    </div>
  );
}

/* ─── Toggle ─────────────────────────────────────────────────────────────── */
function BillingToggle({ annual, setAnnual }: { annual: boolean; setAnnual: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm ${!annual ? "text-white" : "text-[#52525b]"}`} style={{ fontFamily: "var(--font-inter)" }}>Monthly</span>
      <button
        onClick={() => setAnnual(!annual)}
        className="relative w-14 h-7 rounded-full transition-colors duration-300"
        style={{ background: annual ? ORCHID : "#2a2a2a" }}
        aria-label="Toggle billing period"
      >
        <span
          className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
          style={{ transform: annual ? "translateX(28px)" : "translateX(0)" }}
        />
      </button>
      <span className={`text-sm ${annual ? "text-white" : "text-[#52525b]"}`} style={{ fontFamily: "var(--font-inter)" }}>Annual</span>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-300"
        style={{
          background: annual ? "rgba(201,106,203,0.15)" : "transparent",
          color: annual ? ORCHID : "transparent",
          border: annual ? `1px solid rgba(201,106,203,0.3)` : "1px solid transparent",
          fontFamily: "var(--font-inter)",
        }}
      >
        Save 22%
      </span>
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────────────────── */
export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="max-w-7xl mx-auto px-6 md:px-12 py-28 border-t border-[#1a1a1a]">
      {/* Header */}
      <RevealOnScroll>
        <Eyebrow className="mb-4">Pricing</Eyebrow>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2
              className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white mb-3"
              style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.03em" }}
            >
              Simple, honest pricing.
            </h2>
            <p className="text-lg text-[#a1a1aa]">Start free. Upgrade when you're ready. Cancel anytime.</p>
          </div>
          <BillingToggle annual={annual} setAnnual={setAnnual} />
        </div>
      </RevealOnScroll>

      {/* Cards */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">

        {/* ── Free ── */}
        <RevealOnScroll delay={0}>
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0b0b0b] p-7 h-full flex flex-col">
            <div>
              <p className="text-[13px] font-bold text-[#52525b] mb-1" style={{ fontFamily: "var(--font-syne)" }}>Free</p>
              <Price value={0} annual={annual} />
              <p className="text-[13px] text-[#52525b] mt-2 mb-5">Everything you need to get started.</p>
              <div className="h-px bg-[#1a1a1a] mb-5" />
              <ul className="space-y-3">
                {[
                  [true,  "5 recordings per month"],
                  [true,  "30 min per recording"],
                  [true,  "AI summary"],
                  [true,  "Full transcript"],
                  [true,  "Ask Memo (10 questions/mo)"],
                  [true,  "7 day storage"],
                  [false, "Flashcards"],
                  [false, "Calendar sync"],
                  [false, "Memory search"],
                  [false, "Presentations & videos"],
                  [false, "Integrations"],
                ].map(([inc, text]) => (
                  <Feature key={text as string} text={text as string} included={inc as boolean} />
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <a
                href="/sign-up"
                className="block w-full text-center text-[13px] font-semibold py-3 rounded-xl border border-[#2a2a2a] text-white transition-colors duration-200 hover:border-[#3f3f46]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Get started free
              </a>
            </div>
          </div>
        </RevealOnScroll>

        {/* ── Pro ── */}
        <RevealOnScroll delay={100}>
          <div
            className="relative rounded-2xl p-7 flex flex-col xl:scale-[1.02]"
            style={{
              background: "#0d0b0d",
              border: `1px solid ${ORCHID}`,
              boxShadow: `0 0 50px rgba(201,106,203,0.18)`,
            }}
          >
            {/* Top gradient line */}
            <div
              className="absolute top-0 left-8 right-8 h-px rounded-full"
              style={{ background: `linear-gradient(to right, transparent, ${ORCHID}, transparent)` }}
            />
            {/* Most Popular badge */}
            <div
              className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold text-white whitespace-nowrap"
              style={{ background: ORCHID, fontFamily: "var(--font-syne)" }}
            >
              Most Popular
            </div>

            <div>
              <p className="text-[13px] font-bold mb-1" style={{ fontFamily: "var(--font-syne)", color: ORCHID }}>Pro</p>

              {annual && (
                <p className="text-[12px] text-[#52525b] line-through" style={{ fontFamily: "var(--font-inter)" }}>$9/mo</p>
              )}
              <Price value={annual ? 7 : 9} annual={annual} />
              {annual && (
                <p className="text-[12px] text-[#52525b] mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>Billed $84/year</p>
              )}
              <p className="text-[13px] text-[#52525b] mt-2 mb-5">For serious students and professionals.</p>
              <div className="h-px mb-5" style={{ background: "rgba(201,106,203,0.3)" }} />
              <ul className="space-y-3">
                {[
                  "Everything in Free",
                  "Unlimited recordings",
                  "3 hour per recording",
                  "Full AI summaries + key concepts",
                  "Unlimited Ask Memo",
                  "Unlimited storage",
                  "Flashcards + Quiz mode",
                  "Calendar sync (Google, Apple, Outlook)",
                  "Memory search across all sessions",
                  "Presentation from notes (PowerPoint)",
                  "Study Guide PDF",
                  "Mind map generation",
                  "Notion, Docs, Anki integrations",
                  "YouTube + file upload",
                  "Weekly Brain Digest",
                  "MemoPen early access",
                ].map((text) => (
                  <Feature key={text} text={text} included orchid />
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <a
                href="/sign-up?plan=pro"
                className="block w-full text-center text-[13px] font-semibold py-3 rounded-xl text-white transition-all duration-200 hover:brightness-110"
                style={{ background: ORCHID, fontFamily: "var(--font-inter)" }}
              >
                Get Pro →
              </a>
              <p className="text-center text-[11px] text-[#52525b] mt-2.5" style={{ fontFamily: "var(--font-inter)" }}>
                14-day free trial. No credit card required.
              </p>
            </div>
          </div>
        </RevealOnScroll>

        {/* ── Teams ── */}
        <RevealOnScroll delay={60}>
          <div
            className="rounded-2xl border bg-[#0b0b0b] p-7 h-full flex flex-col"
            style={{ borderColor: "#2a2a2a", boxShadow: "0 0 30px rgba(59,130,246,0.08)" }}
          >
            <div>
              <p className="text-[13px] font-bold mb-1" style={{ fontFamily: "var(--font-syne)", color: "#3b82f6" }}>Teams</p>
              <Price value={annual ? 15 : 19} annual={annual} />
              <p className="text-[12px] text-[#52525b] mt-0.5 mb-1" style={{ fontFamily: "var(--font-inter)" }}>per user / month · Minimum 3 users</p>
              <p className="text-[13px] text-[#52525b] mt-2 mb-5">For study groups and professional teams.</p>
              <div className="h-px bg-[#1a1a1a] mb-5" />
              <ul className="space-y-3">
                {[
                  "Everything in Pro (per user)",
                  "Shared session library",
                  "Team memory search",
                  "Study groups",
                  "Collaborative notes",
                  "Slack + Discord posting",
                  "Zoom + Meet bot recording",
                  "Admin dashboard",
                  "Class Notes Hub",
                  "Priority support",
                  "Custom AI persona",
                  "SSO",
                ].map((text) => (
                  <Feature key={text} text={text} included />
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <a
                href="/sign-up?plan=teams"
                className="block w-full text-center text-[13px] font-semibold py-3 rounded-xl border border-[#2a2a2a] text-white transition-colors duration-200 hover:border-[#3f3f46]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Start team trial →
              </a>
            </div>
          </div>
        </RevealOnScroll>

        {/* ── Enterprise ── */}
        <RevealOnScroll delay={30}>
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0b0b0b] p-7 h-full flex flex-col">
            <div>
              <p className="text-[13px] font-bold text-[#52525b] mb-1" style={{ fontFamily: "var(--font-syne)" }}>Enterprise</p>
              <Price value="Custom" annual={annual} />
              <p className="text-[13px] text-[#52525b] mt-2 mb-5">For universities and large organisations.</p>
              <div className="h-px bg-[#1a1a1a] mb-5" />
              <ul className="space-y-3">
                {[
                  "Everything in Teams",
                  "Unlimited members",
                  "Custom integrations",
                  "Dedicated support",
                  "SLA guarantee",
                  "On-premise deployment option",
                  "Custom AI training on org data",
                  "Compliance & audit logs",
                  "MemoPen bulk hardware pricing",
                  "Custom contract",
                ].map((text) => (
                  <Feature key={text} text={text} included />
                ))}
              </ul>
            </div>
            <div className="mt-8">
              <a
                href="mailto:hello@memotech.ai"
                className="block w-full text-center text-[13px] font-semibold py-3 rounded-xl border border-[#2a2a2a] text-white transition-colors duration-200 hover:border-[#3f3f46]"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Contact us →
              </a>
            </div>
          </div>
        </RevealOnScroll>
      </div>

      {/* Trust signals */}
      <RevealOnScroll delay={80}>
        <div className="mt-10 flex items-center justify-center gap-3 flex-wrap text-[12px] text-[#3f3f46]" style={{ fontFamily: "var(--font-inter)" }}>
          <span>🔒 No credit card for free tier</span>
          <span className="text-[#2a2a2a]">·</span>
          <span>↩ Cancel anytime</span>
          <span className="text-[#2a2a2a]">·</span>
          <span>🔐 Your data is encrypted</span>
        </div>
      </RevealOnScroll>

      {/* Mini FAQ */}
      <RevealOnScroll delay={100}>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              q: "Can I switch plans?",
              a: "Yes, upgrade or downgrade anytime. Changes take effect immediately.",
            },
            {
              q: "What happens when I hit my free limit?",
              a: "You'll be notified and can upgrade to Pro or wait until next month.",
            },
            {
              q: "Is student pricing available?",
              a: "Yes — email us with your student email for 50% off Pro.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-[#1a1a1a] bg-[#0b0b0b] p-5"
            >
              <p className="text-[13px] font-semibold text-white mb-2" style={{ fontFamily: "var(--font-syne)" }}>{item.q}</p>
              <p className="text-[12px] text-[#52525b] leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{item.a}</p>
            </div>
          ))}
        </div>
      </RevealOnScroll>
    </section>
  );
}