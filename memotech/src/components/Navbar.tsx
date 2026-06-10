"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/constants";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-400",
          scrolled
            ? "px-12 py-3.5 bg-[rgba(5,5,5,0.88)] backdrop-blur-xl border-b border-[#1a1a1a]"
            : "px-12 py-5 bg-transparent"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span
            className="w-2 h-2 rounded-full bg-[#c96acb]"
            style={{ boxShadow: "0 0 10px #c96acb" }}
          />
          <span
            className="font-display text-[20px] font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Memo
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex gap-9 list-none">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-[#a1a1aa] hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
          <Button variant="primary" size="sm" href="/demo">
            Try demo →
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-[#a1a1aa] hover:text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#050505] flex flex-col justify-center items-center gap-8 transition-all duration-300 md:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-2xl font-display font-semibold text-white hover:text-[#c96acb] transition-colors"
            style={{ fontFamily: "var(--font-syne)" }}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="flex flex-col gap-3 mt-4 w-full px-8">
          <Button variant="outline" size="lg" className="w-full justify-center">
            Sign in
          </Button>
          <Button variant="primary" size="lg" href="/demo" className="w-full justify-center">
            Try demo →
          </Button>
        </div>
      </div>
    </>
  );
}
