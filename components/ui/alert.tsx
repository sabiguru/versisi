import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type AlertVariant = "info" | "success" | "warning" | "destructive";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  title?: string;
  description?: string;
};

const alertStyles: Record<AlertVariant, string> = {
  info: "bg-[color:color-mix(in srgb,var(--accent) 12%,#fff)] border-[color:var(--accent)] text-[color:var(--accent)]",
  success: "bg-[color:color-mix(in srgb,#16a34a 12%,#fff)] border-[#16a34a] text-[#166534]",
  warning: "bg-[color:color-mix(in srgb,var(--warning) 18%,#fff)] border-[color:var(--warning)] text-[color:var(--warning)]",
  destructive: "bg-[color:color-mix(in srgb,#b42318 14%,#fff)] border-[#b42318] text-[#7f1d1d]",
};

export function Alert({ variant = "info", title, description, className, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border px-4 py-3 text-sm shadow-sm",
        alertStyles[variant],
        className,
      )}
      role="alert"
      {...props}
    >
      {title ? <div className="font-semibold">{title}</div> : null}
      {description ? <div className="text-sm">{description}</div> : null}
    </div>
  );
}
