"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { StatusBadge } from "@/components/StatusBadge";
import { TraceWaterfall } from "@/components/TraceWaterfall";
import { formatDuration, formatTimestamp } from "@/lib/utils";
import Link from "next/link";

interface Props {
  traceId: Id<"traces">;
}

export function TraceDetailClient({ traceId }: Props) {
  const trace = useQuery(api.traces.get, { traceId });
  const events = useQuery(api.events.listByTrace, { traceId });

  if (trace === undefined) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <span className="text-gray-500">Loading trace...</span>
      </div>
    );
  }

  if (trace === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <span className="text-red-400">Trace not found</span>
      </div>
    );
  }

  const traceDuration = trace.durationMs ?? (trace.endedAt ? trace.endedAt - trace.startedAt : Date.now() - trace.startedAt);

  const levelColors: Record<string, string> = {
    debug: "text-gray-500",
    info: "text-blue-400",
    warn: "text-yellow-400",
    error: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
          ← Traces
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-white text-sm font-medium">{trace.name}</span>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-white">{trace.name}</h1>
              <StatusBadge status={trace.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Duration: {formatDuration(traceDuration)}</span>
              <span>Started: {formatTimestamp(trace.startedAt)}</span>
              {trace.tags.length > 0 && (
                <div className="flex gap-1">
                  {trace.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input / Output */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-800 p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Input</h3>
            <pre className="text-sm text-gray-300 overflow-auto max-h-48 font-mono">
              {JSON.stringify(trace.input, null, 2)}
            </pre>
          </div>
          <div className="rounded-lg border border-gray-800 p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Output</h3>
            <pre className="text-sm text-gray-300 overflow-auto max-h-48 font-mono">
              {trace.output !== undefined ? JSON.stringify(trace.output, null, 2) : <span className="text-gray-600">—</span>}
            </pre>
          </div>
        </div>

        {/* Waterfall */}
        <div>
          <h2 className="text-lg font-medium text-white mb-4">Spans</h2>
          <div className="rounded-lg border border-gray-800 overflow-hidden">
            <TraceWaterfall
              traceId={traceId}
              traceStart={trace.startedAt}
              traceDuration={traceDuration}
            />
          </div>
        </div>

        {/* Events */}
        {events && events.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-white mb-4">Events</h2>
            <div className="rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id} className="border-b border-gray-800">
                      <td className="px-4 py-2 text-xs text-gray-500">{formatTimestamp(event.timestamp)}</td>
                      <td className="px-4 py-2 text-xs font-medium uppercase">
                        <span className={levelColors[event.level] ?? "text-gray-400"}>{event.level}</span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">{event.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
