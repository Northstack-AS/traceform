import { sql } from "@vercel/postgres";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function SpanBar({ span, minTime, totalDuration }: { span: any; minTime: number; totalDuration: number }) {
  const left = totalDuration > 0 ? ((Number(span.started_at) - minTime) / totalDuration) * 100 : 0;
  const width = totalDuration > 0 && span.duration_ms
    ? Math.max((span.duration_ms / totalDuration) * 100, 0.5)
    : 1;

  const typeColors: Record<string, string> = {
    llm: "bg-blue-500",
    tool: "bg-purple-500",
    retrieval: "bg-orange-500",
    custom: "bg-gray-500",
  };
  const color = typeColors[span.type] ?? "bg-gray-500";

  return (
    <div className="relative h-5 bg-gray-900 rounded overflow-hidden">
      <div
        className={`absolute h-full rounded ${color} opacity-80`}
        style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
      />
    </div>
  );
}

export default async function TraceDetailPage({ params }: { params: Promise<{ traceId: string }> }) {
  const { traceId } = await params;

  const [traceResult, spansResult, eventsResult] = await Promise.all([
    sql`SELECT * FROM traces WHERE id = ${traceId} LIMIT 1`,
    sql`SELECT * FROM spans WHERE trace_id = ${traceId} ORDER BY started_at ASC`,
    sql`SELECT * FROM events WHERE trace_id = ${traceId} ORDER BY timestamp ASC`,
  ]);

  if (traceResult.rows.length === 0) notFound();

  const trace = traceResult.rows[0];
  const spans = spansResult.rows;
  const events = eventsResult.rows;

  const minTime = spans.length > 0 ? Math.min(...spans.map(s => Number(s.started_at))) : Number(trace.started_at);
  const maxTime = spans.length > 0 ? Math.max(...spans.map(s => Number(s.ended_at ?? s.started_at) + (s.duration_ms ?? 0))) : Number(trace.ended_at ?? trace.started_at);
  const totalDuration = maxTime - minTime || 1;

  const statusColors: Record<string, string> = {
    success: "text-green-400",
    error: "text-red-400",
    running: "text-yellow-400",
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 text-sm">← Traces</Link>
        <span className="text-gray-700">/</span>
        <span className="font-mono text-sm">{trace.name}</span>
        <span className={`text-xs font-mono ${statusColors[trace.status] ?? "text-gray-400"}`}>
          {trace.status}
        </span>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Duration</div>
            <div className="font-mono text-lg">{trace.duration_ms != null ? `${trace.duration_ms}ms` : "—"}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Spans</div>
            <div className="font-mono text-lg">{spans.length}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Events</div>
            <div className="font-mono text-lg">{events.length}</div>
          </div>
        </div>

        {/* Input/Output */}
        {(trace.input || trace.output) && (
          <div className="grid grid-cols-2 gap-4">
            {trace.input && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="text-xs text-gray-500 mb-2">Input</div>
                <pre className="text-xs text-gray-300 overflow-auto max-h-32 font-mono whitespace-pre-wrap">
                  {JSON.stringify(trace.input, null, 2)}
                </pre>
              </div>
            )}
            {trace.output && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="text-xs text-gray-500 mb-2">Output</div>
                <pre className="text-xs text-gray-300 overflow-auto max-h-32 font-mono whitespace-pre-wrap">
                  {JSON.stringify(trace.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Waterfall */}
        {spans.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-3">Span Waterfall</h2>
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className="grid grid-cols-[1fr_2fr_80px_80px] text-xs text-gray-500 px-4 py-2 border-b border-gray-800">
                <span>Span</span><span>Timeline</span><span>Duration</span><span>Tokens</span>
              </div>
              {spans.map((span) => {
                const typeColors: Record<string, string> = {
                  llm: "text-blue-400",
                  tool: "text-purple-400",
                  retrieval: "text-orange-400",
                  custom: "text-gray-400",
                };
                return (
                  <div key={span.id} className="grid grid-cols-[1fr_2fr_80px_80px] px-4 py-2.5 border-b border-gray-800/50 hover:bg-gray-800/30 items-center">
                    <div>
                      <div className="font-mono text-xs">{span.name}</div>
                      <div className={`text-xs ${typeColors[span.type] ?? "text-gray-500"}`}>{span.type}</div>
                    </div>
                    <div className="pr-4">
                      <SpanBar span={span} minTime={minTime} totalDuration={totalDuration} />
                    </div>
                    <div className="font-mono text-xs text-gray-400">
                      {span.duration_ms != null ? `${span.duration_ms}ms` : "—"}
                    </div>
                    <div className="font-mono text-xs text-gray-400">
                      {span.prompt_tokens != null ? `${span.prompt_tokens}+${span.completion_tokens ?? 0}` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Events */}
        {events.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-400 mb-3">Events</h2>
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              {events.map((event) => {
                const levelColors: Record<string, string> = {
                  debug: "text-gray-500",
                  info: "text-blue-400",
                  warn: "text-yellow-400",
                  error: "text-red-400",
                };
                return (
                  <div key={event.id} className="flex gap-3 px-4 py-2.5 border-b border-gray-800/50 text-xs">
                    <span className={`font-mono w-12 shrink-0 ${levelColors[event.level] ?? "text-gray-400"}`}>
                      {event.level}
                    </span>
                    <span className="text-gray-300">{event.message}</span>
                    <span className="text-gray-600 ml-auto shrink-0">
                      {new Date(Number(event.timestamp)).toLocaleTimeString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
