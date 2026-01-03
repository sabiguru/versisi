import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type DrawerProps = {
  open: boolean;
  side?: "left" | "right";
  title?: string;
  footer?: ReactNode;
  onClose?: () => void;
} & HTMLAttributes<HTMLDivElement>;

export function Drawer({
  open,
  side = "right",
  title,
  footer,
  onClose,
  className,
  children,
}: DrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex bg-black/20">
      <div className={cn("flex-1", side === "left" ? "order-2" : "order-1")} onClick={onClose} />
      <div
        className={cn(
          "order-2 flex h-full w-full max-w-md flex-col border-[color:var(--border)] bg-[color:var(--surface)] shadow-xl",
          side === "left" ? "border-r" : "border-l",
          className,
        )}
        role="dialog"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-5 py-4">
          {title ? <h3 className="text-sm font-semibold text-[color:var(--foreground)]">{title}</h3> : <span />}
          {onClose ? (
            <button
              className="rounded-md border border-[color:var(--border)] bg-white px-2 py-1 text-sm text-gray-500 hover:bg-gray-50"
              onClick={onClose}
              aria-label="Close drawer"
            >
              ×
            </button>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5 text-sm text-[color:var(--foreground)]">{children}</div>
        {footer ? <div className="border-t border-[color:var(--border)] px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
