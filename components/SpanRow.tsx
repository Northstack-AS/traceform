"use client";

import { useState } from "react";
import { cn, formatDuration } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";

interface SpanRowProps {
  span: Doc<"spans">;
  traceStart: number;
  traceDuration: number;
  depth?: number;
}

const spanTypeColors: Record<string, string> = {
  llm: "bg-blue-500",
  tool: "bg-purple-500",
  retrieval: "bg-orange-500",
  custom: "bg-gray-500",
};

const spanTypeBg: Record<string, string> = {
  llm: "border-blue-500/30 bg-blue-500/10",
  tool: "border-purple-500/30 bg-purple-500/10",
  retrieval: "border-orange-500/30 bg-orange-500/10",
  custom: "border-gray-500/30 bg-gray-500/10",
};

export function SpanRow({ span, traceStart, traceDuration, depth = 0 }: SpanRowProps) {
  const [expanded, setExpanded] = useState(false);

  const offsetMs = span.startedAt - traceStart;
  const durationMs = span.durationMs ?? (span.endedAt ? span.endedAt - span.startedAt : 0);

  const leftPct = traceDuration > 0 ? (offsetMs / traceDuration) * 100 : 0;
  const widthPct = traceDuration > 0 ? Math.max((durationMs / traceDuration) * 100, 0.5) : 0.5;

  return (
    <div className="border-b border-gray-800">
      <div
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800/50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        style={{ paddingLeft: `${16 + depth * 20}px` }}
      >
        <span className="text-gray-500 text-xs w-4">{expanded ? "▼" : "▶"}</span>
        <span
          className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border w-20 justify-center",
            spanTypeBg[span.type] ?? spanTypeBg.custom
          )}
        >
          {span.type}
        </span>
        <span className="text-sm text-gray-200 flex-1 truncate">{span.name}</span>
        {span.model && (
          <span className="text-xs text-gray-500">{span.model}</span>
        )}
        {span.costUsd !== undefined && (
          <span className="text-xs text-gray-400">${span.costUsd.toFixed(4)}</span>
        )}
        <span className="text-xs text-gray-400 w-16 text-right">{formatDuration(durationMs)}</span>
        <div className="w-48 h-4 bg-gray-800 rounded overflow-hidden relative ml-2">
          <div
            className={cn("absolute top-0 h-full rounded", spanTypeColors[span.type] ?? spanTypeColors.custom, span.status === "error" ? "bg-red-500" : "")}
            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
          />
        </div>
      </div>
      {expanded && (
        <div className="px-8 pb-3 space-y-2" style={{ paddingLeft: `${40 + depth * 20}px` }}>
          {span.input !== undefined && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Input</p>
              <pre className="text-xs bg-gray-900 rounded p-2 overflow-auto max-h-40 text-gray-300">
                {JSON.stringify(span.input, null, 2)}
              </pre>
            </div>
          )}
          {span.output !== undefined && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Output</p>
              <pre className="text-xs bg-gray-900 rounded p-2 overflow-auto max-h-40 text-gray-300">
                {JSON.stringify(span.output, null, 2)}
              </pre>
            </div>
          )}
          {(span.promptTokens !== undefined || span.completionTokens !== undefined) && (
            <div className="flex gap-4 text-xs text-gray-400">
              {span.promptTokens !== undefined && <span>Prompt tokens: {span.promptTokens}</span>}
              {span.completionTokens !== undefined && <span>Completion tokens: {span.completionTokens}</span>}
            </div>
          )}
          {span.error && (
            <div>
              <p className="text-xs text-red-400 mb-1">Error</p>
              <pre className="text-xs bg-red-950/30 border border-red-800/30 rounded p-2 overflow-auto max-h-40 text-red-300">
                {span.error}
                {span.errorStack && `\n\n${span.errorStack}`}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
