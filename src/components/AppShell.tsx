import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden bg-bg print:h-auto print:overflow-visible">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-surface px-6">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-ink">
              {title}
            </h1>
            {subtitle ? (
              <p className="truncate text-xs text-muted">{subtitle}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </header>
        <main className="flex-1 overflow-y-auto px-5 py-4 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
