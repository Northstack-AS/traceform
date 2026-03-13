"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { SpanRow } from "./SpanRow";

interface TraceWaterfallProps {
  traceId: Id<"traces">;
  traceStart: number;
  traceDuration: number;
}

export function TraceWaterfall({ traceId, traceStart, traceDuration }: TraceWaterfallProps) {
  const spans = useQuery(api.spans.listByTrace, { traceId });

  if (spans === undefined) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        Loading spans...
      </div>
    );
  }

  if (spans.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        No spans recorded
      </div>
    );
  }

  // Build span tree
  const spanMap = new Map(spans.map((s) => [s._id.toString(), s]));
  const rootSpans = spans.filter((s) => !s.parentSpanId);
  const childrenMap = new Map<string, typeof spans>();

  for (const span of spans) {
    if (span.parentSpanId) {
      const children = childrenMap.get(span.parentSpanId) ?? [];
      children.push(span);
      childrenMap.set(span.parentSpanId, children);
    }
  }

  function renderSpan(span: (typeof spans)[0], depth: number): React.ReactNode {
    const children = childrenMap.get(span._id.toString()) ?? [];
    return (
      <div key={span._id}>
        <SpanRow
          span={span}
          traceStart={traceStart}
          traceDuration={traceDuration}
          depth={depth}
        />
        {children.map((child) => renderSpan(child, depth + 1))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 text-xs text-gray-500">
        <span className="w-4" />
        <span className="w-20">Type</span>
        <span className="flex-1">Name</span>
        <span className="w-16 text-right">Duration</span>
        <span className="w-48 ml-2">Timeline</span>
      </div>
      {rootSpans.length > 0
        ? rootSpans.map((span) => renderSpan(span, 0))
        : spans.map((span) => renderSpan(span, 0))}
    </div>
  );
}
