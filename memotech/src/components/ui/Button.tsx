"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
      {
        "bg-[#c96acb] text-white hover:bg-[#b85aba] active:bg-[#a54ea7]":
          variant === "primary",
        "border border-[#2a2a2a] text-white hover:border-[#c96acb] hover:text-[#c96acb] bg-transparent":
          variant === "outline",
        "text-[#a1a1aa] hover:text-white hover:bg-white/5 bg-transparent":
          variant === "ghost",
      },
      {
        "text-xs px-3 py-1.5": size === "sm",
        "text-sm px-4 py-2": size === "md",
        "text-base px-6 py-3": size === "lg",
      },
      className
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };