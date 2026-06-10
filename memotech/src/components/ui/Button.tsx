import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  onClick,
  children,
  className,
  external,
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 font-medium transition-all duration-200 rounded-lg cursor-pointer select-none";

  const variants = {
    primary:
      "bg-[#c96acb] text-white hover:opacity-85 hover:shadow-[0_0_24px_rgba(201,106,203,0.35)] active:scale-[0.98]",
    outline:
      "bg-transparent text-[#a1a1aa] border border-[#2a2a2a] hover:border-[#52525b] hover:text-white active:scale-[0.98]",
    ghost:
      "bg-transparent text-[#a1a1aa] hover:text-white active:scale-[0.98]",
  };

  const sizes = {
    sm: "text-xs px-3 py-2",
    md: "text-sm px-4 py-[9px]",
    lg: "text-[15px] px-6 py-[13px]",
  };

  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick}>
      {children}
    </button>
  );
}
