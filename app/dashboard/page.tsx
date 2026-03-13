import { sql } from "@vercel/postgres";
import Link from "next/link";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "bg-green-900 text-green-300",
    error: "bg-red-900 text-red-300",
    running: "bg-yellow-900 text-yellow-300",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono ${colors[status] ?? "bg-gray-800 text-gray-300"}`}>
      {status}
    </span>
  );
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let traces: any[] = [];
  let error: string | null = null;

  try {
    const result = await sql`
      SELECT t.*, p.name as project_name
      FROM traces t
      LEFT JOIN projects p ON p.id = t.project_id
      ORDER BY t.started_at DESC
      LIMIT 100
    `;
    traces = result.rows;
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight">Traceform</span>
          <span className="text-xs text-gray-500 bg-gray-900 px-2 py-0.5 rounded">spike</span>
        </div>
        <span className="text-xs text-gray-500">The black box for your AI agents</span>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Traces</h1>
          <span className="text-xs text-gray-500">{traces.length} recent runs</span>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded px-4 py-3 text-sm text-red-300 mb-4">
            DB error: {error} — run POST /api/migrate to initialize.
          </div>
        )}

        {traces.length === 0 && !error && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-sm">No traces yet. Instrument an agent with the SDK to see runs here.</p>
            <p className="mt-2 text-xs font-mono text-gray-600">POST /api/ingest · x-api-key: tf_demo_key_spike</p>
          </div>
        )}

        {traces.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium">Name</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium">Status</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium">Duration</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium">Started</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium">Project</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {traces.map((trace) => (
                  <tr key={trace.id} className="hover:bg-gray-900/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link href={`/dashboard/traces/${trace.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">
                        {trace.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={trace.status} /></td>
                    <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">
                      {trace.duration_ms != null ? `${trace.duration_ms}ms` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">
                      {new Date(Number(trace.started_at)).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{trace.project_name ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
