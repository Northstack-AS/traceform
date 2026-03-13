"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { StatusBadge } from "./StatusBadge";
import { formatDuration, formatTimestamp } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

interface TraceTableProps {
  projectId: Id<"projects">;
}

type FilterStatus = "all" | "running" | "success" | "error";

export function TraceTable({ projectId }: TraceTableProps) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const traces = useQuery(api.traces.list, {
    projectId,
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {(["all", "running", "success", "error"] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trace
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Started
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
            </tr>
          </thead>
          <tbody>
            {traces === undefined && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
            {traces?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No traces yet. Start instrumenting your agent.
                </td>
              </tr>
            )}
            {traces?.map((trace) => (
              <tr
                key={trace._id}
                className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/traces/${trace._id}`}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {trace.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={trace.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {formatDuration(trace.durationMs)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {formatTimestamp(trace.startedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {trace.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-400 border border-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
