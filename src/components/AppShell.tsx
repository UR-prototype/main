import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

export function AppShell({
  title,
  subtitle,
  actions,
  children,
  variant = "default",
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** studio: fill viewport, no scroll chrome — for CVAT-like tools */
  variant?: "default" | "studio";
}) {
  const studio = variant === "studio";
  return (
    <div className="flex h-dvh overflow-hidden bg-bg print:h-auto print:overflow-visible">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={`flex shrink-0 items-center justify-between gap-4 border-b border-line bg-surface ${
            studio ? "h-11 px-4" : "h-14 px-6"
          }`}
        >
          <div className="min-w-0">
            <h1
              className={`truncate font-semibold tracking-tight text-ink ${
                studio ? "text-sm" : "text-base"
              }`}
            >
              {title}
            </h1>
            {subtitle && !studio ? (
              <p className="truncate text-xs text-muted">{subtitle}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </header>
        <main
          className={
            studio
              ? "flex min-h-0 flex-1 flex-col overflow-hidden p-0 print:overflow-visible"
              : "flex-1 overflow-y-auto px-5 py-4 print:overflow-visible"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}
