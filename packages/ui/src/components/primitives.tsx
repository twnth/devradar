import type { ReactNode } from "react";
import clsx from "clsx";

export function Card(props: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl3 border border-line bg-panel text-foreground shadow-panel",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

export function SectionHeader(props: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{props.title}</h2>
        {props.description ? (
          <p className="mt-2 text-sm text-muted">{props.description}</p>
        ) : null}
      </div>
      {props.action}
    </div>
  );
}

export function SourceBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-black/10 px-2.5 py-1 text-xs text-muted">
      {label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: "critical" | "high" | "medium" | "low" | "info" }) {
  const colorMap = {
    critical: "border-critical/40 bg-critical/15 text-critical",
    high: "border-high/40 bg-high/15 text-high",
    medium: "border-medium/40 bg-medium/15 text-medium",
    low: "border-low/30 bg-low/10 text-low",
    info: "border-accent/40 bg-accent/15 text-accent"
  };

  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", colorMap[severity])}>
      {severity}
    </span>
  );
}

export function TagPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-elevated px-2.5 py-1 text-xs text-foreground/80">
      {label}
    </span>
  );
}

export function LoadingState({ title }: { title: string }) {
  return (
    <Card className="p-6 text-sm text-muted">
      {title}
    </Card>
  );
}

export function EmptyState(props: {
  title: string;
  body: string;
}) {
  return (
    <Card className="p-8 text-center">
      <h3 className="text-lg font-semibold">{props.title}</h3>
      <p className="mt-2 text-sm text-muted">{props.body}</p>
    </Card>
  );
}

export function ErrorState({ title }: { title: string }) {
  return (
    <Card className="border-critical/25 bg-critical/10 p-6 text-sm text-critical">
      {title}
    </Card>
  );
}
