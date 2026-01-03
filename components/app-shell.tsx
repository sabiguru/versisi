import type { ReactNode } from "react";

type NavItem = {
  label: string;
};

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const primaryNav: NavItem[] = [
    { label: "Overview" },
    { label: "Tokens" },
    { label: "Components" },
    { label: "Patterns" },
  ];

  const secondaryNav: NavItem[] = [
    { label: "Foundations" },
    { label: "Accessibility" },
    { label: "Changelog" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="flex min-h-screen">
        <aside className="flex w-72 flex-col border-r bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="text-base font-semibold">sygnoff</div>
            <button className="rounded-md border px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">
              …
            </button>
          </div>

          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-600 shadow-inner">
              <span className="text-gray-500">⌘K</span>
              <span className="flex-1">Quick find</span>
            </div>
          </div>

          <nav className="flex-1 overflow-auto px-2 pb-4 text-sm text-gray-700">
            <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Workspace
            </div>
            <div className="flex flex-col gap-1">
              {primaryNav.map((item) => (
                <button
                  key={item.label}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-gray-100"
                  type="button"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="px-2 pb-2 pt-5 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Library
            </div>
            <div className="flex flex-col gap-1">
              {secondaryNav.map((item) => (
                <button
                  key={item.label}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-gray-100"
                  type="button"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="border-t px-4 py-4">
            <button className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              New page
              <span className="text-gray-400">+</span>
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="rounded-md border px-2 py-1 text-xs text-gray-500">Design</span>
              <span className="font-medium">System workspace</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Guidelines
              </button>
              <button className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
                New component
              </button>
            </div>
          </header>
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
