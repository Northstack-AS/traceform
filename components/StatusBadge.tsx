"use client";

import { cn } from "@/lib/utils";

type TraceStatus = "running" | "success" | "error";
type SpanStatus = "ok" | "error";
type Status = TraceStatus | SpanStatus;

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  running: { label: "Running", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  success: { label: "Success", className: "bg-green-500/20 text-green-400 border-green-500/30" },
  error: { label: "Error", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  ok: { label: "OK", className: "bg-green-500/20 text-green-400 border-green-500/30" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.error;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        config.className,
        className
      )}
    >
      {status === "running" && (
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5 animate-pulse" />
      )}
      {config.label}
    </span>
  );
}
