import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c96acb]",
        className
      )}
    >
      <span className="block w-5 h-px bg-[#c96acb]" />
      {children}
    </div>
  );
}
