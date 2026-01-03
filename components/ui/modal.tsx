import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

type ModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  onClose?: () => void;
  footer?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function Modal({ open, title, description, onClose, footer, className, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4">
      <div
        className={cn(
          "w-full max-w-lg rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-lg",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {title ? <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{title}</h3> : null}
            {description ? <p className="text-sm text-gray-600">{description}</p> : null}
          </div>
          {onClose ? (
            <button
              className="rounded-md border border-[color:var(--border)] bg-white px-2 py-1 text-sm text-gray-500 hover:bg-gray-50"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          ) : null}
        </div>
        <div className="mt-4 text-sm text-[color:var(--foreground)]">{children}</div>
        <div className="mt-6 flex items-center justify-end gap-2">
          {footer ? footer : onClose ? <Button variant="secondary" onClick={onClose}>Close</Button> : null}
        </div>
      </div>
    </div>
  );
}
