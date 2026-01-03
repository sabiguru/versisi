import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "h-4 w-full animate-pulse rounded-md bg-[color:color-mix(in srgb,var(--foreground) 8%,#fff)]",
        className,
      )}
      {...props}
    />
  );
}
