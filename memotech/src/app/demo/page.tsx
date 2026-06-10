import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="text-center px-8">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <span
            className="w-2 h-2 rounded-full bg-[#c96acb]"
            style={{ boxShadow: "0 0 10px #c96acb" }}
          />
          <span
            className="text-[20px] font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Memo
          </span>
        </div>
        <h1
          className="text-[48px] font-extrabold text-white mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.04em" }}
        >
          Demo coming soon.
        </h1>
        <p className="text-[#a1a1aa] text-[17px] mb-10 max-w-md mx-auto leading-[1.7]">
          The interactive product demo is being built. Come back tomorrow — or
          join the waitlist to be first in.
        </p>
        <Link
          href="/"
          className="text-sm text-[#52525b] hover:text-[#a1a1aa] transition-colors"
        >
          ← Back to landing page
        </Link>
      </div>
    </main>
  );
}
