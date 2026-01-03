import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "accent" | "warning";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const badgeStyles: Record<BadgeVariant, string> = {
  neutral: "bg-gray-100 text-gray-800 border border-[color:var(--border)]",
  accent: "bg-[color:color-mix(in srgb,var(--accent) 15%,#fff)] text-[color:var(--accent)]",
  warning: "bg-[color:color-mix(in srgb,var(--warning) 18%,#fff)] text-[color:var(--warning)]",
};

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
        badgeStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
