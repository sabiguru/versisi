import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white border border-[var(--accent)] hover:bg-[var(--accent-strong)]",
  secondary: "bg-white text-[var(--foreground)] border border-[var(--border)] hover:bg-gray-50",
  destructive: "bg-[#b42318] text-white border border-[#b42318] hover:bg-[#9a1d14]",
};

export function Button({
  variant = "primary",
  fullWidth,
  leftIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth ? "w-full" : "",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {leftIcon ? <span className="text-base">{leftIcon}</span> : null}
      {children}
    </button>
  );
}

export default Button;
