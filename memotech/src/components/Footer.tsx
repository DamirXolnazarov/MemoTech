import Link from "next/link";

const LINKS = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Contact", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a]">
      <div className="max-w-6xl mx-auto px-12 py-12 flex items-center justify-between flex-wrap gap-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c96acb]" />
          <span
            className="text-[15px] font-bold text-[#a1a1aa] tracking-tight"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            MemoTech
          </span>
        </Link>

        <ul className="flex gap-7 flex-wrap list-none">
          {LINKS.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-[13px] text-[#52525b] hover:text-[#a1a1aa] transition-colors duration-200"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <span className="text-[12px] text-[#3f3f46]">
          © 2025 MemoTech. Building the future of memory.
        </span>
      </div>
    </footer>
  );
}
