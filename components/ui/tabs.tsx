import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export type TabItem = {
  label: string;
  value: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
};

export function Tabs({ tabs, defaultValue, className }: TabsProps) {
  const initial = defaultValue ?? tabs[0]?.value ?? "";
  const [active, setActive] = useState(initial);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-wrap gap-2 border-b border-[color:var(--border)] pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active === tab.value
                ? "bg-[color:color-mix(in srgb,var(--accent) 12%,#fff)] text-[color:var(--accent)] border border-[color:var(--accent)]"
                : "text-gray-600 hover:bg-gray-100 border border-transparent",
            )}
            onClick={() => setActive(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {tabs.map((tab) =>
          tab.value === active ? (
            <div key={tab.value} className="text-sm text-[color:var(--foreground)]">
              {tab.content}
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
